<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\LoyaltySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function __construct(private readonly LoyaltySettingsService $settings) {}

    public function settings(): JsonResponse
    {
        return response()->json(['data' => $this->settings->get()]);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'total' => ['required', 'integer', 'min:0'],
            'coupon_discount' => ['nullable', 'integer', 'min:0'],
            'points_to_redeem' => ['nullable', 'integer', 'min:0'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
        ]);

        $config = $this->settings->get();
        $couponDiscount = $validated['coupon_discount'] ?? 0;
        $payableAfterCoupon = max(0, $validated['total'] - $couponDiscount);
        $customerBalance = 0;

        if (! empty($validated['customer_id'])) {
            $customerBalance = (int) Customer::query()->whereKey($validated['customer_id'])->value('points');
        }

        $redeem = $this->settings->calculateRedeem(
            $validated['points_to_redeem'] ?? 0,
            $customerBalance,
            $payableAfterCoupon,
        );

        $finalTotal = max(0, $payableAfterCoupon - $redeem['discount']);
        $pointsEarned = $this->settings->calculateEarnPoints($finalTotal);

        return response()->json([
            'data' => [
                'settings' => $config,
                'points_discount' => $redeem['discount'],
                'points_used' => $redeem['points_used'],
                'final_total' => $finalTotal,
                'points_earned' => $pointsEarned,
            ],
        ]);
    }
}
