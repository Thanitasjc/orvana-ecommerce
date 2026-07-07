<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\CouponService;
use App\Services\OrderPaymentService;
use App\Services\OrderService;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PosCheckoutController extends Controller
{
    private const POS_CHANNEL = 'POS (หน้าร้าน)';

    public function __construct(
        private readonly OrderService $orders,
        private readonly CouponService $coupons,
        private readonly PaymentMethodService $payments,
        private readonly OrderPaymentService $orderPayments,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'amount_paid' => ['nullable', 'integer', 'min:0'],
            'pos_session_id' => ['nullable', 'string', 'max:64'],
            'points_to_redeem' => ['nullable', 'integer', 'min:0'],
        ]);

        $customer = isset($validated['customer_id'])
            ? Customer::find($validated['customer_id'])
            : null;

        $paymentMethod = $this->payments->resolveForCheckout($validated['payment_method_id'], 'pos');
        $statuses = $this->payments->initialOrderStatuses($paymentMethod, self::POS_CHANNEL);

        $discount = $validated['discount'] ?? 0;
        $coupon = null;
        $shippingDiscount = 0;

        if (! empty($validated['coupon_code'])) {
            $validatedCoupon = $this->coupons->validate(
                $validated['coupon_code'],
                $validated['items'],
                self::POS_CHANNEL,
                $customer,
                0,
                $validated['pos_session_id'] ?? null,
            );
            $discount = $validatedCoupon['discount'];
            $shippingDiscount = $validatedCoupon['shipping_discount'];
            $coupon = $validatedCoupon['coupon'];
        }

        try {
            $order = $this->orders->checkout(
                items: $validated['items'],
                channel: self::POS_CHANNEL,
                discount: $discount,
                paymentMethod: $paymentMethod->name,
                customer: $customer,
                staff: $request->user(),
                coupon: $coupon,
                shippingFee: 0,
                shippingDiscount: $shippingDiscount,
                posSessionId: $validated['pos_session_id'] ?? null,
                pointsToRedeem: $validated['points_to_redeem'] ?? 0,
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

        if ($paymentMethod->isPosCash() && isset($validated['amount_paid'])) {
            $amountPaid = (int) $validated['amount_paid'];
            $change = max(0, $amountPaid - (int) $order->total);

            $order->update([
                'payment_metadata' => [
                    'pos' => [
                        'amount_paid' => $amountPaid,
                        'change' => $change,
                    ],
                ],
            ]);
        }

        return response()->json([
            'data' => $this->orderPayments->formatPosOrder($order->fresh()->load(['items', 'customer', 'paymentMethod'])),
        ], 201);
    }
}
