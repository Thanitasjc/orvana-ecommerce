<?php

namespace Tests\Feature;

use App\Models\ProductVariation;
use App\Models\User;
use App\Services\OrderService;
use Database\Seeders\OmnichannelSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStockRestoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancelling_order_restores_variation_stock(): void
    {
        $this->seed(OmnichannelSeeder::class);

        $variation = ProductVariation::query()->firstOrFail();
        $initialStock = $variation->stock;

        $order = app(OrderService::class)->checkout(
            items: [['variation_id' => $variation->id, 'quantity' => 2]],
            channel: 'POS (หน้าร้าน)',
            paymentMethod: 'เงินสด',
        );

        $variation->refresh();
        $this->assertSame($initialStock - 2, $variation->stock);

        $admin = User::query()->where('email', 'admin@aesthete.local')->firstOrFail();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->patchJson("/api/v1/admin/orders/{$order->id}", [
            'status' => 'cancelled',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk();

        $variation->refresh();
        $order->refresh();

        $this->assertSame($initialStock, $variation->stock);
        $this->assertNotNull($order->stock_restored_at);
    }

    public function test_refunding_order_restores_stock_once(): void
    {
        $this->seed(OmnichannelSeeder::class);

        $variation = ProductVariation::query()->firstOrFail();
        $initialStock = $variation->stock;

        $order = app(OrderService::class)->checkout(
            items: [['variation_id' => $variation->id, 'quantity' => 1]],
            channel: 'Online Store',
            paymentMethod: 'โอนเงิน',
            orderStatus: 'processing',
            paymentStatus: 'paid',
        );

        $admin = User::query()->where('email', 'admin@aesthete.local')->firstOrFail();
        $token = $admin->createToken('test')->plainTextToken;

        $this->patchJson("/api/v1/admin/orders/{$order->id}", [
            'payment_status' => 'refunded',
        ], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $variation->refresh();
        $this->assertSame($initialStock, $variation->stock);

        $this->patchJson("/api/v1/admin/orders/{$order->id}", [
            'status' => 'cancelled',
        ], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        $variation->refresh();
        $this->assertSame($initialStock, $variation->stock);
    }
}
