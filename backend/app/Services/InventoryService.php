<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\ProductVariation;

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
}
