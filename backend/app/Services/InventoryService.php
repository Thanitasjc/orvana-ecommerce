<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * @param  array<int, array{variation_id: int, quantity: int}>  $items
     */
    public function deduct(array $items): void
    {
        foreach ($items as $item) {
            $variation = ProductVariation::query()
                ->lockForUpdate()
                ->findOrFail($item['variation_id']);

            if ($variation->stock < $item['quantity']) {
                throw new InsufficientStockException(
                    $variation->sku,
                    $item['quantity'],
                    $variation->stock,
                );
            }

            $variation->decrement('stock', $item['quantity']);

            Product::query()
                ->whereKey($variation->product_id)
                ->increment('sales_count', $item['quantity']);
        }
    }

    public function restoreFromOrder(Order $order): bool
    {
        if ($order->stock_restored_at !== null) {
            return false;
        }

        return DB::transaction(function () use ($order) {
            $order = Order::query()
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($order->id);

            if ($order->stock_restored_at !== null) {
                return false;
            }

            foreach ($order->items as $item) {
                if (! $item->product_variation_id) {
                    continue;
                }

                $variation = ProductVariation::query()
                    ->lockForUpdate()
                    ->find($item->product_variation_id);

                if (! $variation) {
                    continue;
                }

                $variation->increment('stock', $item->quantity);

                $product = Product::query()
                    ->lockForUpdate()
                    ->find($variation->product_id);

                if ($product) {
                    $product->update([
                        'sales_count' => max(0, $product->sales_count - $item->quantity),
                    ]);
                }
            }

            $order->update(['stock_restored_at' => now()]);

            return true;
        });
    }
}
