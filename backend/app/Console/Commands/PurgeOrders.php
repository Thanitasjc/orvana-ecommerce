<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderPurgeService;
use Illuminate\Console\Command;

class PurgeOrders extends Command
{
    protected $signature = 'orders:purge
        {--channel= : Filter by channel (online|pos)}
        {--before= : Delete orders created before date (Y-m-d)}
        {--after= : Delete orders created on or after date (Y-m-d)}
        {--dry-run : Preview without deleting}
        {--force : Skip confirmation prompt}';

    protected $description = 'Delete orders and restore stock, loyalty points, and coupon usage counts';

    public function handle(OrderPurgeService $purge): int
    {
        $query = Order::query()->orderBy('id');

        if ($channel = $this->option('channel')) {
            $query->where('channel', $channel);
        }

        if ($before = $this->option('before')) {
            $query->whereDate('created_at', '<', $before);
        }

        if ($after = $this->option('after')) {
            $query->whereDate('created_at', '>=', $after);
        }

        $orders = $query->get();
        $count = $orders->count();

        if ($count === 0) {
            $this->info('No orders match the criteria.');

            return self::SUCCESS;
        }

        $this->table(
            ['Channel', 'Count'],
            $orders->groupBy('channel')->map(fn ($group, $ch) => [$ch, $group->count()])->values()->all(),
        );
        $this->info("Total: {$count} order(s)");

        if ($this->option('dry-run')) {
            $this->warn('Dry run — no orders deleted.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm("Permanently delete {$count} order(s)?")) {
            $this->warn('Cancelled.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $stats = ['deleted' => 0, 'stock_restored' => 0, 'loyalty_reversed' => 0, 'coupons_adjusted' => 0];

        foreach ($orders as $order) {
            $result = $purge->purge(collect([$order]));
            foreach ($result as $key => $value) {
                $stats[$key] += $value;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Deleted: {$stats['deleted']}");
        $this->info("Stock restored: {$stats['stock_restored']}");
        $this->info("Loyalty reversed: {$stats['loyalty_reversed']}");
        $this->info("Coupon counts adjusted: {$stats['coupons_adjusted']}");

        return self::SUCCESS;
    }
}
