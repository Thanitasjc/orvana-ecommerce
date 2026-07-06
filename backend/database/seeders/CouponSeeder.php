<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME100',
                'name' => 'ส่วนลดต้อนรับ 100 บาท',
                'description' => 'สำหรับสมาชิกใหม่ ลด 100 บาท',
                'type' => 'fixed',
                'apply_to' => 'order',
                'customer_rule' => 'new_member',
                'value' => 100,
                'min_order' => 500,
                'per_user_limit' => 1,
                'max_uses' => 100,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(3),
                'is_active' => true,
                'channel' => 'both',
            ],
            [
                'code' => 'SAVE10',
                'name' => 'ลด 10% ทั้งออเดอร์',
                'description' => 'ลด 10% ไม่จำกัดจำนวนครั้ง',
                'type' => 'percent',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 10,
                'min_order' => 300,
                'max_uses' => null,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(6),
                'is_active' => true,
                'channel' => 'both',
            ],
            [
                'code' => 'FREESHIP1K',
                'name' => 'ส่งฟรีเมื่อครบ 1,000',
                'description' => 'ส่งฟรีทั่วประเทศ',
                'type' => 'free_shipping',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 0,
                'min_order' => 0,
                'rules' => ['free_shipping_min' => 1000],
                'max_uses' => 500,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(2),
                'is_active' => true,
                'channel' => 'online',
            ],
            [
                'code' => 'TIERVIP',
                'name' => 'ส่วนลดตามยอด (Tier)',
                'description' => 'ยิ่งซื้อมาก ยิ่งลดมาก',
                'type' => 'tier',
                'apply_to' => 'order',
                'customer_rule' => 'returning',
                'value' => 0,
                'min_order' => 1000,
                'rules' => [
                    'tiers' => [
                        ['min_spend' => 1000, 'discount_type' => 'percent', 'value' => 5],
                        ['min_spend' => 3000, 'discount_type' => 'percent', 'value' => 10],
                        ['min_spend' => 5000, 'discount_type' => 'percent', 'value' => 15],
                    ],
                ],
                'max_uses' => null,
                'used_count' => 0,
                'is_active' => true,
                'channel' => 'both',
            ],
            [
                'code' => 'BUY2GET1',
                'name' => 'ซื้อ 2 แถม 1',
                'description' => 'สินค้าเดียวกันในตะกร้า',
                'type' => 'bogo',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 0,
                'min_order' => 0,
                'rules' => [
                    'bogo' => ['buy_qty' => 2, 'get_qty' => 1, 'mode' => 'same_product'],
                ],
                'max_uses' => 200,
                'used_count' => 0,
                'is_active' => true,
                'channel' => 'both',
            ],
            [
                'code' => 'SAVE20MAX500',
                'name' => 'ลด 20% สูงสุด 500 บาท',
                'description' => 'ลด 20% แต่ไม่เกิน 500 บาท',
                'type' => 'percent',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 20,
                'min_order' => 500,
                'rules' => ['max_discount' => 500],
                'max_uses' => null,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(6),
                'is_active' => true,
                'channel' => 'both',
            ],
            [
                'code' => 'POS50',
                'name' => 'ส่วนลดหน้าร้าน 50 บาท',
                'type' => 'fixed',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 50,
                'min_order' => 200,
                'per_user_limit' => 1,
                'max_uses' => 50,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonth(),
                'is_active' => true,
                'channel' => 'pos',
            ],
            [
                'code' => 'OLDCODE',
                'name' => 'โปรโมชั่นเก่า (ปิดแล้ว)',
                'type' => 'fixed',
                'apply_to' => 'order',
                'customer_rule' => 'all',
                'value' => 50,
                'min_order' => 0,
                'max_uses' => null,
                'used_count' => 12,
                'starts_at' => now()->subMonths(6),
                'ends_at' => now()->subMonth(),
                'is_active' => false,
                'channel' => 'both',
            ],
        ];

        foreach ($coupons as $data) {
            Coupon::query()->updateOrCreate(
                ['code' => $data['code']],
                $data,
            );
        }
    }
}
