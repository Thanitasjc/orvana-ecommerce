<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\ProductVariation;
use App\Services\OrderService;
use Database\Seeders\OmnichannelSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderPaymentAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_order_can_be_loaded_with_customer_email(): void
    {
        $this->seed(OmnichannelSeeder::class);

        $customer = Customer::query()->create([
            'name' => 'ทดสอบ สมาชิก',
            'email' => 'member@example.com',
            'phone' => '0812345678',
            'password' => bcrypt('password'),
        ]);

        $variation = ProductVariation::query()->firstOrFail();
        $paymentMethod = PaymentMethod::query()
            ->where('type', 'bank_transfer')
            ->where('is_active', true)
            ->first()
            ?? PaymentMethod::query()->where('is_active', true)->firstOrFail();

        $order = app(OrderService::class)->checkout(
            items: [['variation_id' => $variation->id, 'quantity' => 1]],
            channel: 'Online Store',
            paymentMethod: $paymentMethod->name,
            customer: $customer,
            paymentMethodId: $paymentMethod->id,
            orderStatus: 'pending',
            paymentStatus: 'pending',
        );

        $this->assertNull($order->guest_email);

        $this->getJson('/api/v1/checkout/orders/'.$order->order_number.'?email='.urlencode($customer->email))
            ->assertOk()
            ->assertJsonPath('data.order_number', $order->order_number);
    }

    public function test_member_order_can_be_loaded_with_bearer_token(): void
    {
        $this->seed(OmnichannelSeeder::class);

        $customer = Customer::query()->create([
            'name' => 'ทดสอบ Token',
            'email' => 'token-member@example.com',
            'phone' => '0811111111',
            'password' => bcrypt('password'),
        ]);

        $variation = ProductVariation::query()->firstOrFail();
        $paymentMethod = PaymentMethod::query()->where('is_active', true)->firstOrFail();

        $order = app(OrderService::class)->checkout(
            items: [['variation_id' => $variation->id, 'quantity' => 1]],
            channel: 'Online Store',
            paymentMethod: $paymentMethod->name,
            customer: $customer,
            paymentMethodId: $paymentMethod->id,
            orderStatus: 'pending',
            paymentStatus: 'pending',
        );

        $token = $customer->createToken('test')->plainTextToken;

        $this->getJson('/api/v1/checkout/orders/'.$order->order_number, [
            'Authorization' => "Bearer {$token}",
        ])
            ->assertOk()
            ->assertJsonPath('data.order_number', $order->order_number);
    }

    public function test_guest_order_rejects_wrong_email(): void
    {
        $this->seed(OmnichannelSeeder::class);

        $variation = ProductVariation::query()->firstOrFail();
        $paymentMethod = PaymentMethod::query()->where('is_active', true)->firstOrFail();

        $order = app(OrderService::class)->checkout(
            items: [['variation_id' => $variation->id, 'quantity' => 1]],
            channel: 'Online Store',
            paymentMethod: $paymentMethod->name,
            guestDetails: [
                'name' => 'Guest User',
                'email' => 'guest@example.com',
                'phone' => '0899999999',
                'address' => '1 Test Rd',
                'province' => 'Bangkok',
                'postcode' => '10110',
            ],
            paymentMethodId: $paymentMethod->id,
            orderStatus: 'pending',
            paymentStatus: 'pending',
        );

        $this->getJson('/api/v1/checkout/orders/'.$order->order_number.'?email='.urlencode('wrong@example.com'))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
