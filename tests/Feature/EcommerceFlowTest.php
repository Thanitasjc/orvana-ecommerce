<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\Ecommerce\OrderInventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EcommerceFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_checkout_and_create_order_with_inventory_transaction(): void
    {
        Notification::fake();

        $user = User::factory()->create(['is_admin' => false]);
        $category = Category::query()->create([
            'slug' => 'cat-test',
            'name' => ['th' => 'หมวดทดสอบ', 'en' => 'Test Category'],
            'description' => ['th' => null, 'en' => null],
            'sort' => 0,
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'slug' => 'product-test',
            'sku' => 'SKU-TEST-1',
            'name' => ['th' => 'สินค้าทดสอบ', 'en' => 'Test Product'],
            'short_description' => ['th' => null, 'en' => null],
            'description' => ['th' => null, 'en' => null],
            'price' => 100,
            'sale_price' => 90,
            'stock_quantity' => 10,
            'sort' => 0,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($user)
            ->post(route('frontend.cart.items.add'), [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertRedirect();

        $response = $this->actingAs($user)
            ->post(route('frontend.checkout.place-order'), [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'phone' => '0812345678',
                'country' => 'Thailand',
                'state' => 'Bangkok',
                'city' => 'Bangkok',
                'address_line1' => '123 Main Road',
                'address_line2' => null,
                'postal_code' => '10110',
                'shipping_method' => 'standard',
                'payment_method' => 'bank_transfer',
                'note' => 'test checkout',
            ]);

        $response->assertRedirect();

        $order = Order::query()->first();
        $this->assertNotNull($order);
        $this->assertSame('paid', $order->status);
        $this->assertEquals(180.00, (float) $order->subtotal_amount);
        $this->assertEquals(50.00, (float) $order->shipping_amount);
        $this->assertEquals(230.00, (float) $order->total_amount);
        $this->assertCount(1, $order->items);

        $product->refresh();
        $this->assertSame(8, $product->stock_quantity);
        $this->assertDatabaseHas('inventory_transactions', [
            'product_id' => $product->id,
            'order_id' => $order->id,
            'type' => 'sale',
            'quantity_delta' => -2,
            'stock_after' => 8,
        ]);

        Notification::assertSentOnDemand(\App\Notifications\OrderPlacedNotification::class);
    }

    public function test_cod_checkout_does_not_deduct_stock_until_paid(): void
    {
        Notification::fake();

        $user = User::factory()->create(['is_admin' => false]);
        $category = Category::query()->create([
            'slug' => 'cat-cod',
            'name' => ['th' => 'หมวด COD', 'en' => 'COD Category'],
            'description' => ['th' => null, 'en' => null],
            'sort' => 0,
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'slug' => 'product-cod',
            'sku' => 'SKU-COD-1',
            'name' => ['th' => 'สินค้า COD', 'en' => 'COD Product'],
            'short_description' => ['th' => null, 'en' => null],
            'description' => ['th' => null, 'en' => null],
            'price' => 100,
            'sale_price' => null,
            'stock_quantity' => 5,
            'sort' => 0,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($user)
            ->post(route('frontend.cart.items.add'), [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('frontend.checkout.place-order'), [
                'first_name' => 'Jane',
                'last_name' => 'Doe',
                'email' => 'jane@example.com',
                'phone' => '0811111111',
                'country' => 'Thailand',
                'state' => 'Bangkok',
                'city' => 'Bangkok',
                'address_line1' => '456 Road',
                'address_line2' => null,
                'postal_code' => '10110',
                'shipping_method' => 'standard',
                'payment_method' => 'cod',
                'note' => null,
            ])
            ->assertRedirect();

        $order = Order::query()->first();
        $this->assertNotNull($order);
        $this->assertSame('pending', $order->status);

        $product->refresh();
        $this->assertSame(5, $product->stock_quantity);
        $this->assertDatabaseMissing('inventory_transactions', [
            'order_id' => $order->id,
            'type' => 'sale',
        ]);

        app(OrderInventoryService::class)->allocate($order->fresh(['items']));

        $product->refresh();
        $this->assertSame(3, $product->stock_quantity);
        $this->assertDatabaseHas('inventory_transactions', [
            'order_id' => $order->id,
            'type' => 'sale',
            'quantity_delta' => -2,
        ]);
    }

    public function test_cancelling_paid_order_restores_stock(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $category = Category::query()->create([
            'slug' => 'cat-cancel',
            'name' => ['th' => 'หมวด', 'en' => 'Cat'],
            'description' => ['th' => null, 'en' => null],
            'sort' => 0,
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'slug' => 'product-cancel',
            'sku' => 'SKU-CAN-1',
            'name' => ['th' => 'สินค้า', 'en' => 'Product'],
            'short_description' => ['th' => null, 'en' => null],
            'description' => ['th' => null, 'en' => null],
            'price' => 50,
            'sale_price' => null,
            'stock_quantity' => 10,
            'sort' => 0,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $order = Order::query()->create([
            'order_number' => 'ORD-CANCEL-1',
            'user_id' => $user->id,
            'status' => 'paid',
            'currency' => 'THB',
            'shipping_method' => 'standard',
            'shipping_amount' => 50,
            'discount_amount' => 0,
            'subtotal_amount' => 100,
            'total_amount' => 150,
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'customer_phone' => '0800000000',
            'shipping_country' => 'Thailand',
            'shipping_state' => 'Bangkok',
            'shipping_city' => 'Bangkok',
            'shipping_address_line1' => '1 Road',
            'shipping_postal_code' => '10110',
            'placed_at' => now(),
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'สินค้า',
            'product_sku' => 'SKU-CAN-1',
            'unit_price' => 50,
            'quantity' => 2,
            'line_total' => 100,
        ]);

        $inventory = app(OrderInventoryService::class);
        $inventory->allocate($order->fresh(['items']));

        $product->refresh();
        $this->assertSame(8, $product->stock_quantity);

        $inventory->handleStatusChange($order, 'paid', 'cancelled');

        $product->refresh();
        $this->assertSame(10, $product->stock_quantity);
        $this->assertDatabaseHas('inventory_transactions', [
            'order_id' => $order->id,
            'type' => 'return',
            'quantity_delta' => 2,
            'stock_after' => 10,
        ]);
    }

    public function test_payment_webhook_updates_payment_and_order_status(): void
    {
        config()->set('ecommerce.payment_webhook_secret', 'test-secret');
        config()->set('ecommerce.payment_signature_header', 'X-Payment-Signature');

        $user = User::factory()->create(['is_admin' => false]);
        $category = Category::query()->create([
            'slug' => 'cat-webhook',
            'name' => ['th' => 'หมวด', 'en' => 'Cat'],
            'description' => ['th' => null, 'en' => null],
            'sort' => 0,
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'slug' => 'product-webhook',
            'sku' => 'SKU-WH-1',
            'name' => ['th' => 'สินค้า', 'en' => 'Product'],
            'short_description' => ['th' => null, 'en' => null],
            'description' => ['th' => null, 'en' => null],
            'price' => 100,
            'sale_price' => null,
            'stock_quantity' => 10,
            'sort' => 0,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $order = Order::query()->create([
            'order_number' => 'ORD-TEST-123',
            'user_id' => $user->id,
            'status' => 'pending',
            'currency' => 'THB',
            'shipping_method' => 'standard',
            'shipping_amount' => 50,
            'discount_amount' => 0,
            'subtotal_amount' => 100,
            'total_amount' => 150,
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '0899999999',
            'shipping_country' => 'Thailand',
            'shipping_state' => 'Bangkok',
            'shipping_city' => 'Bangkok',
            'shipping_address_line1' => '1 Street',
            'shipping_address_line2' => null,
            'shipping_postal_code' => '10000',
            'placed_at' => now(),
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'สินค้า',
            'product_sku' => 'SKU-WH-1',
            'unit_price' => 100,
            'quantity' => 3,
            'line_total' => 300,
        ]);

        $payment = Payment::query()->create([
            'order_id' => $order->id,
            'method' => 'bank_transfer',
            'status' => 'pending',
            'amount' => 150,
            'provider' => 'manual',
            'reference' => 'ORD-TEST-123',
        ]);

        $payload = [
            'reference' => 'ORD-TEST-123',
            'status' => 'paid',
            'provider' => 'demo_gateway',
            'meta' => ['txn' => 'TXN123'],
        ];

        $raw = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $raw, 'test-secret');

        $this->withHeader('X-Payment-Signature', $signature)
            ->postJson(route('frontend.payments.webhook'), $payload)
            ->assertOk();

        $payment->refresh();
        $order->refresh();

        $this->assertSame('paid', $payment->status);
        $this->assertSame('paid', $order->status);
        $this->assertSame('demo_gateway', $payment->provider);

        $product->refresh();
        $this->assertSame(7, $product->stock_quantity);
        $this->assertDatabaseHas('inventory_transactions', [
            'order_id' => $order->id,
            'type' => 'sale',
            'quantity_delta' => -3,
        ]);
    }

    public function test_payment_webhook_rejects_invalid_signature(): void
    {
        config()->set('ecommerce.payment_webhook_secret', 'test-secret');
        config()->set('ecommerce.payment_signature_header', 'X-Payment-Signature');

        $response = $this->withHeader('X-Payment-Signature', 'invalid-signature')
            ->postJson(route('frontend.payments.webhook'), [
                'reference' => 'ORD-INVALID-123',
                'status' => 'paid',
            ]);

        $response->assertStatus(401);
    }
}

