<?php

namespace App\Services;

use App\Models\LoyaltySetting;

class LoyaltySettingsService
{
    public function get(): array
    {
        $row = LoyaltySetting::query()->first();

        if (! $row) {
            return $this->defaults();
        }

        return $this->format($row);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function save(array $payload): array
    {
        $normalized = $this->mergeDefaults($payload);

        $row = LoyaltySetting::query()->first();
        if ($row) {
            $row->update($normalized);
        } else {
            $row = LoyaltySetting::query()->create($normalized);
        }

        return $this->format($row->fresh());
    }

    public function calculateEarnPoints(int $payableTotal): int
    {
        $settings = $this->get();

        if (! $settings['enabled']) {
            return 0;
        }

        if ($payableTotal < $settings['min_spend']) {
            return 0;
        }

        $bahtPerPoint = max(1, $settings['baht_per_point']);

        return (int) floor($payableTotal / $bahtPerPoint);
    }

    /**
     * @return array{points_used: int, discount: int}
     */
    public function calculateRedeem(int $pointsToRedeem, int $customerBalance, int $payableAfterCoupon): array
    {
        $settings = $this->get();

        if (! $settings['redeem_enabled'] || $pointsToRedeem <= 0 || $payableAfterCoupon <= 0) {
            return ['points_used' => 0, 'discount' => 0];
        }

        $rate = max(1, $settings['redeem_points_per_baht']);
        $minRedeem = max(1, $settings['min_redeem_points']);
        $maxPercent = min(100, max(1, $settings['max_redeem_percent']));

        $maxDiscountByPercent = (int) floor($payableAfterCoupon * $maxPercent / 100);
        $maxPointsByPercent = $maxDiscountByPercent * $rate;

        $requestedPoints = min($pointsToRedeem, $customerBalance, $maxPointsByPercent);
        $usablePoints = (int) (floor($requestedPoints / $rate) * $rate);

        if ($usablePoints < $minRedeem) {
            return ['points_used' => 0, 'discount' => 0];
        }

        $discount = (int) floor($usablePoints / $rate);
        $discount = min($discount, $payableAfterCoupon);

        return [
            'points_used' => $discount * $rate,
            'discount' => $discount,
        ];
    }

    public function resolveTier(int $totalSpent): string
    {
        $settings = $this->get();
        $platinum = max(0, $settings['platinum_threshold']);
        $gold = max(0, $settings['gold_threshold']);

        if ($platinum > 0 && $totalSpent >= $platinum) {
            return 'Platinum';
        }

        if ($gold > 0 && $totalSpent >= $gold) {
            return 'Gold';
        }

        return 'Silver';
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function mergeDefaults(array $payload): array
    {
        $defaults = $this->defaults();

        return [
            'enabled' => (bool) ($payload['enabled'] ?? $defaults['enabled']),
            'baht_per_point' => max(1, (int) ($payload['baht_per_point'] ?? $defaults['baht_per_point'])),
            'min_spend' => max(0, (int) ($payload['min_spend'] ?? $defaults['min_spend'])),
            'gold_threshold' => max(0, (int) ($payload['gold_threshold'] ?? $defaults['gold_threshold'])),
            'platinum_threshold' => max(0, (int) ($payload['platinum_threshold'] ?? $defaults['platinum_threshold'])),
            'redeem_enabled' => (bool) ($payload['redeem_enabled'] ?? $defaults['redeem_enabled']),
            'redeem_points_per_baht' => max(1, (int) ($payload['redeem_points_per_baht'] ?? $defaults['redeem_points_per_baht'])),
            'min_redeem_points' => max(1, (int) ($payload['min_redeem_points'] ?? $defaults['min_redeem_points'])),
            'max_redeem_percent' => min(100, max(1, (int) ($payload['max_redeem_percent'] ?? $defaults['max_redeem_percent']))),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function format(LoyaltySetting $row): array
    {
        return [
            'enabled' => $row->enabled,
            'baht_per_point' => $row->baht_per_point,
            'min_spend' => $row->min_spend,
            'gold_threshold' => $row->gold_threshold,
            'platinum_threshold' => $row->platinum_threshold,
            'redeem_enabled' => $row->redeem_enabled,
            'redeem_points_per_baht' => $row->redeem_points_per_baht,
            'min_redeem_points' => $row->min_redeem_points,
            'max_redeem_percent' => $row->max_redeem_percent,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaults(): array
    {
        return [
            'enabled' => true,
            'baht_per_point' => 100,
            'min_spend' => 0,
            'gold_threshold' => 10000,
            'platinum_threshold' => 25000,
            'redeem_enabled' => true,
            'redeem_points_per_baht' => 10,
            'min_redeem_points' => 100,
            'max_redeem_percent' => 50,
        ];
    }
}
