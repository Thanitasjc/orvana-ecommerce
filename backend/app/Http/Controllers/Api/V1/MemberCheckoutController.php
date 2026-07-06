<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberCheckoutController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CouponService $coupons,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ]);

        $built = $this->orders->buildLineItems($validated['items']);
        $shippingFee = $built['total'] > 0 && $built['total'] < 300 ? 20 : 0;

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
                paymentMethod: $validated['payment_method'] ?? 'บัตรเครดิต',
                customer: $request->user(),
                coupon: $coupon,
                shippingFee: $shippingFee,
                shippingDiscount: $shippingDiscount,
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => 'สินค้าไม่เพียงพอในคลัง',
                'errors' => [
                    'stock' => [$e->getMessage()],
                ],
            ], 422);
        }

        return response()->json(['data' => $order], 201);
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
