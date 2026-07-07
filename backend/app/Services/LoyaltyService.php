<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    public function __construct(
        private readonly LoyaltySettingsService $settings,
    ) {}

    /**
     * @return array{points_used: int, discount: int}
     */
    public function validateRedeem(?Customer $customer, int $pointsToRedeem, int $payableAfterCoupon): array
    {
        if (! $customer || $pointsToRedeem <= 0) {
            return ['points_used' => 0, 'discount' => 0];
        }

        $result = $this->settings->calculateRedeem(
            $pointsToRedeem,
            $customer->points,
            $payableAfterCoupon,
        );

        if ($pointsToRedeem > 0 && $result['points_used'] === 0) {
            $config = $this->settings->get();
            throw ValidationException::withMessages([
                'points_to_redeem' => [
                    "ไม่สามารถใช้แต้มได้ (ขั้นต่ำ {$config['min_redeem_points']} แต้ม หรือเกินขีดจำกัด)",
                ],
            ]);
        }

        if ($result['points_used'] > $customer->points) {
            throw ValidationException::withMessages([
                'points_to_redeem' => ['แต้มไม่เพียงพอ'],
            ]);
        }

        return $result;
    }

    public function processOrder(?Customer $customer, Order $order, int $pointsRedeemed = 0): void
    {
        if (! $customer) {
            return;
        }

        $customer->refresh();
        $balance = $customer->points;

        if ($pointsRedeemed > 0) {
            $balance -= $pointsRedeemed;
            $this->logTransaction(
                $customer,
                $order,
                'redeem',
                -$pointsRedeemed,
                $balance,
                "ใช้แต้มออเดอร์ {$order->order_number}",
            );
        }

        $earnedPoints = $this->settings->calculateEarnPoints($order->total);

        if ($earnedPoints > 0) {
            $balance += $earnedPoints;
            $this->logTransaction(
                $customer,
                $order,
                'earn',
                $earnedPoints,
                $balance,
                "สะสมแต้มออเดอร์ {$order->order_number}",
            );
        }

        $newTotalSpent = $customer->total_spent + $order->total;

        $customer->update([
            'points' => $balance,
            'total_spent' => $newTotalSpent,
            'tier' => $this->settings->resolveTier($newTotalSpent),
        ]);

        $order->update([
            'points_earned' => $earnedPoints,
        ]);
    }

    public function reverseOrder(Order $order): bool
    {
        if ($order->loyalty_reversed_at !== null || ! $order->customer_id) {
            return false;
        }

        return DB::transaction(function () use ($order) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($order->loyalty_reversed_at !== null || ! $order->customer_id) {
                return false;
            }

            $customer = Customer::query()->lockForUpdate()->find($order->customer_id);
            if (! $customer) {
                return false;
            }

            $balance = $customer->points;
            $pointsRedeemed = (int) $order->points_redeemed;
            $pointsEarned = (int) $order->points_earned;
            $orderNumber = $order->order_number;

            if ($pointsRedeemed > 0) {
                $balance += $pointsRedeemed;
                $this->logTransaction(
                    $customer,
                    $order,
                    'cancel',
                    $pointsRedeemed,
                    $balance,
                    "คืนแต้มจากยกเลิกออเดอร์ {$orderNumber}",
                );
            }

            if ($pointsEarned > 0) {
                $revoked = min($pointsEarned, $balance);
                $balance -= $revoked;
                $this->logTransaction(
                    $customer,
                    $order,
                    'cancel',
                    -$revoked,
                    $balance,
                    $revoked < $pointsEarned
                        ? "หักแต้มจากยกเลิกออเดอร์ {$orderNumber} (หักได้ {$revoked} จาก {$pointsEarned})"
                        : "หักแต้มจากยกเลิกออเดอร์ {$orderNumber}",
                );
            }

            $newTotalSpent = max(0, $customer->total_spent - (int) $order->total);

            $customer->update([
                'points' => max(0, $balance),
                'total_spent' => $newTotalSpent,
                'tier' => $this->settings->resolveTier($newTotalSpent),
            ]);

            $order->update(['loyalty_reversed_at' => now()]);

            return true;
        });
    }

    public function logAdjustment(Customer $customer, int $delta, string $description): void
    {
        $balance = max(0, $customer->points + $delta);

        $this->logTransaction(
            $customer,
            null,
            'adjust',
            $delta,
            $balance,
            $description,
        );

        $customer->update(['points' => $balance]);
    }

    private function logTransaction(
        Customer $customer,
        ?Order $order,
        string $type,
        int $points,
        int $balanceAfter,
        string $description,
    ): void {
        LoyaltyPointTransaction::create([
            'customer_id' => $customer->id,
            'order_id' => $order?->id,
            'type' => $type,
            'points' => $points,
            'balance_after' => $balanceAfter,
            'description' => $description,
        ]);
    }
}
