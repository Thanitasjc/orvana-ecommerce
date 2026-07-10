<?php

namespace Tests\Feature;

use App\Models\Coupon;
use Database\Seeders\CouponSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCouponsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_coupons_index_returns_active_coupons(): void
    {
        $this->seed(CouponSeeder::class);

        $response = $this->getJson('/api/v1/coupons');

        $response->assertOk();
        $response->assertJsonStructure(['data' => [['code', 'name', 'type', 'is_active']]]);

        $activeCount = Coupon::query()->active()->count();
        $this->assertSame($activeCount, count($response->json('data')));
        $this->assertGreaterThan(0, $activeCount);
    }
}
