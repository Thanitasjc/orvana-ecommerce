<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Customer;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $coupons) {}

    public function index(): JsonResponse
    {
        $coupons = Coupon::query()
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Coupon $coupon) => [
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type,
                'apply_to' => $coupon->apply_to ?? 'order',
                'value' => $coupon->value,
                'min_order' => $coupon->min_order,
                'max_uses' => $coupon->max_uses,
                'used_count' => $coupon->used_count,
                'starts_at' => $coupon->starts_at,
                'ends_at' => $coupon->ends_at,
                'is_active' => $coupon->is_active,
                'channel' => $coupon->channel,
                'customer_rule' => $coupon->customer_rule ?? 'all',
            ]);

        return response()->json(['data' => $coupons]);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'channel' => ['required', Rule::in(['online', 'pos'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.variation_id' => ['required', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'shipping_fee' => ['nullable', 'integer', 'min:0'],
            'pos_session_id' => ['nullable', 'string', 'max:64'],
        ]);

        $customer = isset($validated['customer_id'])
            ? Customer::find($validated['customer_id'])
            : null;

        try {
            $salesChannel = $validated['channel'] === 'pos' ? 'POS (หน้าร้าน)' : 'Online Store';
            $result = $this->coupons->validate(
                $validated['code'],
                $validated['items'],
                $salesChannel,
                $customer,
                $validated['shipping_fee'] ?? 0,
                $validated['pos_session_id'] ?? null,
            );
        } catch (ValidationException $exception) {
            throw $exception;
        }

        $coupon = $result['coupon'];

        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type,
                'apply_to' => $coupon->apply_to,
                'value' => $coupon->value,
                'discount' => $result['discount'],
                'shipping_discount' => $result['shipping_discount'],
                'free_shipping' => $result['free_shipping'],
                'subtotal' => $result['subtotal'],
                'applicable_subtotal' => $result['applicable_subtotal'],
            ],
        ]);
    }
}
