<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\CouponService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosCheckoutController extends Controller
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
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'pos_session_id' => ['nullable', 'string', 'max:64'],
        ]);

        $customer = isset($validated['customer_id'])
            ? Customer::find($validated['customer_id'])
            : null;

        $discount = $validated['discount'] ?? 0;
        $coupon = null;
        $shippingDiscount = 0;

        if (! empty($validated['coupon_code'])) {
            $validatedCoupon = $this->coupons->validate(
                $validated['coupon_code'],
                $validated['items'],
                'POS (หน้าร้าน)',
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
                channel: 'POS (หน้าร้าน)',
                discount: $discount,
                paymentMethod: $validated['payment_method'] ?? 'เงินสด',
                customer: $customer,
                staff: $request->user(),
                coupon: $coupon,
                shippingFee: 0,
                shippingDiscount: $shippingDiscount,
                posSessionId: $validated['pos_session_id'] ?? null,
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
}
