<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Services\LoyaltySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLoyaltyController extends Controller
{
    public function __construct(private readonly LoyaltySettingsService $settings) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->settings->get()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'baht_per_point' => ['sometimes', 'integer', 'min:1'],
            'min_spend' => ['sometimes', 'integer', 'min:0'],
            'gold_threshold' => ['sometimes', 'integer', 'min:0'],
            'platinum_threshold' => ['sometimes', 'integer', 'min:0'],
            'redeem_enabled' => ['sometimes', 'boolean'],
            'redeem_points_per_baht' => ['sometimes', 'integer', 'min:1'],
            'min_redeem_points' => ['sometimes', 'integer', 'min:1'],
            'max_redeem_percent' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        if (
            isset($validated['gold_threshold'], $validated['platinum_threshold'])
            && $validated['platinum_threshold'] < $validated['gold_threshold']
        ) {
            return response()->json([
                'message' => 'เกณฑ์ Platinum ต้องมากกว่าหรือเท่ากับ Gold',
            ], 422);
        }

        $saved = $this->settings->save($validated);

        return response()->json(['data' => $saved]);
    }

    public function customerTransactions(Customer $customer): JsonResponse
    {
        $transactions = LoyaltyPointTransaction::query()
            ->where('customer_id', $customer->id)
            ->with('order:id,order_number')
            ->latest()
            ->paginate(20);

        return response()->json($transactions);
    }
}
