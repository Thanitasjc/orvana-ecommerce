<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Services\OrderService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GuestCheckoutController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CouponService $coupons,
        private readonly ShippingService $shipping,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:500'],
            'province' => ['required', 'string', 'max:100'],
            'postcode' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $built = $this->orders->buildLineItems($validated['items']);
        $shipping = $this->shipping->resolveForCheckout($validated['shipping_method_id'], $built['total']);
        $shippingFee = $shipping['fee'];
        $shippingMethod = $shipping['method'];

        $discount = 0;
        $shippingDiscount = 0;
        $coupon = null;

        if (! empty($validated['coupon_code'])) {
            $validatedCoupon = $this->coupons->validate(
                $validated['coupon_code'],
                $validated['items'],
                'Online Store',
                null,
                $shippingFee,
            );
            $discount = $validatedCoupon['discount'];
            $shippingDiscount = $validatedCoupon['shipping_discount'];
            $coupon = $validatedCoupon['coupon'];
        }

        $guestDetails = [
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'province' => $validated['province'],
            'postcode' => $validated['postcode'],
            'notes' => $validated['notes'] ?? null,
        ];

        try {
            $order = $this->orders->checkout(
                items: $validated['items'],
                channel: 'Online Store',
                discount: $discount,
                paymentMethod: $validated['payment_method'] ?? 'บัตรเครดิต',
                customer: null,
                coupon: $coupon,
                shippingFee: $shippingFee,
                shippingDiscount: $shippingDiscount,
                pointsToRedeem: 0,
                guestDetails: $guestDetails,
                shippingMethodId: $shippingMethod->id,
                shippingMethodName: $shippingMethod->name,
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => 'สินค้าไม่เพียงพอในคลัง',
                'errors' => [
                    'stock' => [$e->getMessage()],
                ],
            ], 422);
        } catch (ValidationException $e) {
            throw $e;
        }

        return response()->json(['data' => $order], 201);
    }
}
