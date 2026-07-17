<?php

namespace App\Services;

use App\Models\CouponUsage;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderPurgeService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly LoyaltyService $loyalty,
    ) {}

    /**
     * @return array{deleted: int, stock_restored: int, loyalty_reversed: int, coupons_adjusted: int}
     */
    public function purge(Collection $orders): array
    {
        $stats = [
            'deleted' => 0,
            'stock_restored' => 0,
            'loyalty_reversed' => 0,
            'coupons_adjusted' => 0,
        ];

        foreach ($orders as $order) {
            $this->purgeOne($order, $stats);
        }

        return $stats;
    }

    /**
     * @param  array{deleted: int, stock_restored: int, loyalty_reversed: int, coupons_adjusted: int}  $stats
     */
    private function purgeOne(Order $order, array &$stats): void
    {
        DB::transaction(function () use ($order, &$stats) {
            $order = Order::query()->lockForUpdate()->with(['items', 'coupon'])->findOrFail($order->id);

            if ($this->loyalty->reverseOrder($order)) {
                $stats['loyalty_reversed']++;
            }

            if ($this->inventory->restoreFromOrder($order)) {
                $stats['stock_restored']++;
            }

            $usages = CouponUsage::query()->where('order_id', $order->id)->with('coupon')->get();
            foreach ($usages as $usage) {
                if ($usage->coupon && $usage->coupon->used_count > 0) {
                    $usage->coupon->decrement('used_count');
                    $stats['coupons_adjusted']++;
                }
            }

            if ($order->payment_slip_path) {
                Storage::disk(config('filesystems.uploads'))->delete($order->payment_slip_path);
            }

            LoyaltyPointTransaction::query()->where('order_id', $order->id)->delete();

            $order->delete();
            $stats['deleted']++;
        });
    }
}
