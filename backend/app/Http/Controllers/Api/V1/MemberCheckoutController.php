<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Services\OrderService;
use App\Services\PaymentMethodService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberCheckoutController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CouponService $coupons,
        private readonly ShippingService $shipping,
        private readonly PaymentMethodService $payments,
        private readonly \App\Services\OrderPaymentService $orderPayments,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'points_to_redeem' => ['nullable', 'integer', 'min:0'],
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
        ]);

        $built = $this->orders->buildLineItems($validated['items']);
        $shipping = $this->shipping->resolveForCheckout($validated['shipping_method_id'], $built['total']);
        $shippingFee = $shipping['fee'];
        $shippingMethod = $shipping['method'];
        $paymentMethod = $this->payments->resolveForCheckout($validated['payment_method_id']);
        $statuses = $this->payments->initialOrderStatuses($paymentMethod, 'Online Store');

        $discount = 0;
        $shippingDiscount = 0;
        $coupon = null;

        if (! empty($validated['coupon_code'])) {
            $validatedCoupon = $this->coupons->validate(
                $validated['coupon_code'],
                $validated['items'],
                'Online Store',
                $request->user(),
                $shippingFee,
            );
            $discount = $validatedCoupon['discount'];
            $shippingDiscount = $validatedCoupon['shipping_discount'];
            $coupon = $validatedCoupon['coupon'];
        }

        try {
            $order = $this->orders->checkout(
                items: $validated['items'],
                channel: 'Online Store',
                discount: $discount,
                paymentMethod: $paymentMethod->name,
                customer: $request->user(),
                coupon: $coupon,
                shippingFee: $shippingFee,
                shippingDiscount: $shippingDiscount,
                pointsToRedeem: $validated['points_to_redeem'] ?? 0,
                shippingMethodId: $shippingMethod->id,
                shippingMethodName: $shippingMethod->name,
                paymentMethodId: $paymentMethod->id,
                orderStatus: $statuses['status'],
                paymentStatus: $statuses['payment_status'],
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => 'สินค้าไม่เพียงพอในคลัง',
                'errors' => [
                    'stock' => [$e->getMessage()],
                ],
            ], 422);
        }

        return response()->json([
            'data' => $this->orderPayments->formatPublicOrder($order),
        ], 201);
    }

    public function orders(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }
}
