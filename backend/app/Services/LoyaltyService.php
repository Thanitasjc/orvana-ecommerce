<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;

class LoyaltyService
{
    public function earnPoints(?Customer $customer, Order $order): void
    {
        if (! $customer) {
            return;
        }

        $earnedPoints = (int) floor($order->total / 100);
        $newTotalSpent = $customer->total_spent + $order->total;
        $newPoints = $customer->points + $earnedPoints;

        $tier = 'Silver';
        if ($newTotalSpent >= 25000) {
            $tier = 'Platinum';
        } elseif ($newTotalSpent >= 10000) {
            $tier = 'Gold';
        }

        $customer->update([
            'points' => $newPoints,
            'total_spent' => $newTotalSpent,
            'tier' => $tier,
        ]);
    }
}
