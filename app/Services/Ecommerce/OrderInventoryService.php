<?php

namespace App\Services\Ecommerce;

use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderInventoryService
{
    public function handleStatusChange(Order $order, string $oldStatus, string $newStatus): void
    {
        if ($oldStatus === $newStatus) {
            return;
        }

        if ($newStatus === 'paid' && $oldStatus !== 'paid') {
            $this->allocate($order);

            return;
        }

        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            $this->release($order);
        }
    }

    public function allocate(Order $order): void
    {
        if ($this->hasAllocated($order)) {
            return;
        }

        DB::transaction(function () use ($order): void {
            $order->loadMissing('items');

            foreach ($order->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                /** @var Product $product */
                $product = Product::query()->lockForUpdate()->findOrFail($item->product_id);

                if ($product->stock_quantity < $item->quantity) {
                    throw new RuntimeException(
                        "Insufficient stock for {$product->getTranslation('name', config('locales.default', 'th'))}."
                    );
                }

                $product->decrement('stock_quantity', $item->quantity);
                $product->refresh();

                InventoryTransaction::query()->create([
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'type' => 'sale',
                    'quantity_delta' => -$item->quantity,
                    'stock_after' => $product->stock_quantity,
                    'note' => "Order {$order->order_number} paid",
                ]);
            }
        });
    }

    public function release(Order $order): void
    {
        if (! $this->hasAllocated($order) || $this->hasReleased($order)) {
            return;
        }

        DB::transaction(function () use ($order): void {
            $order->loadMissing('items');

            foreach ($order->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                /** @var Product $product */
                $product = Product::query()->lockForUpdate()->findOrFail($item->product_id);

                $product->increment('stock_quantity', $item->quantity);
                $product->refresh();

                InventoryTransaction::query()->create([
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'type' => 'return',
                    'quantity_delta' => $item->quantity,
                    'stock_after' => $product->stock_quantity,
                    'note' => "Order {$order->order_number} cancelled",
                ]);
            }
        });
    }

    public function hasAllocated(Order $order): bool
    {
        return InventoryTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'sale')
            ->exists();
    }

    public function hasReleased(Order $order): bool
    {
        return InventoryTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'return')
            ->exists();
    }
}
