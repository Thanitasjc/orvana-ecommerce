<?php

/**
 * Dev-only: delete all orders and reset product stock for clean testing.
 * Usage: php scripts/dev-reset-orders-and-stock.php
 * Optional: DEV_DEFAULT_STOCK=50 php scripts/dev-reset-orders-and-stock.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use Illuminate\Support\Facades\DB;

$defaultStock = (int) (getenv('DEV_DEFAULT_STOCK') ?: 100);

echo "=== Before ===\n";
echo 'orders: '.DB::table('orders')->count()."\n";
echo 'order_items: '.DB::table('order_items')->count()."\n";
echo 'payments: '.DB::table('payments')->count()."\n";
echo 'inventory_transactions: '.DB::table('inventory_transactions')->count()."\n";

DB::table('orders')->delete();
DB::table('inventory_transactions')->delete();
Product::query()->update(['stock_quantity' => $defaultStock]);

echo "\n=== After ===\n";
echo 'orders: '.DB::table('orders')->count()."\n";
echo 'order_items: '.DB::table('order_items')->count()."\n";
echo 'payments: '.DB::table('payments')->count()."\n";
echo 'inventory_transactions: '.DB::table('inventory_transactions')->count()."\n";
echo "All products stock_quantity = {$defaultStock}\n\n";

Product::query()->orderBy('id')->get(['sku', 'stock_quantity'])->each(function (Product $product): void {
    echo "  {$product->sku}: {$product->stock_quantity}\n";
});
