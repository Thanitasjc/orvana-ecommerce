<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $rows = [
            [
                'name' => 'เงินสด',
                'type' => 'pos_cash',
                'description' => 'รับชำระเงินสดหน้าร้าน',
                'instructions' => 'กรอกยอดรับจากลูกค้าและคำนวณเงินทอน',
                'config' => json_encode([]),
                'channel' => 'pos',
                'sort_order' => 1,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'บัตรเครดิต / เดบิต',
                'type' => 'pos_card',
                'description' => 'รับชำระผ่านเครื่องรูดบัตรหน้าร้าน',
                'instructions' => 'บันทึกยอดเมื่อรับชำระผ่านเครื่อง EDC แล้ว',
                'config' => json_encode([]),
                'channel' => 'pos',
                'sort_order' => 2,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'PromptPay QR',
                'type' => 'omise_promptpay',
                'description' => 'สแกน QR PromptPay ผ่าน Omise',
                'instructions' => 'ให้ลูกค้าสแกน QR เพื่อชำระเงิน',
                'config' => json_encode([]),
                'channel' => 'pos',
                'sort_order' => 3,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($rows as $row) {
            $exists = DB::table('payment_methods')
                ->where('type', $row['type'])
                ->where('channel', $row['channel'])
                ->exists();

            if (! $exists) {
                DB::table('payment_methods')->insert($row);
            }
        }

        // Keep online Omise methods off POS (POS has dedicated pos_card / omise_promptpay rows).
        DB::table('payment_methods')
            ->whereIn('type', ['omise_card', 'omise_promptpay'])
            ->where('channel', 'both')
            ->update(['channel' => 'online']);
    }
}
