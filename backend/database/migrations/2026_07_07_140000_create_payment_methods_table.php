<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 32);
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->json('config')->nullable();
            $table->string('channel', 16)->default('online');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('payment_method_id')->nullable()->after('payment_method')->constrained()->nullOnDelete();
            $table->string('payment_slip_path')->nullable()->after('payment_method_id');
            $table->string('omise_charge_id')->nullable()->after('payment_slip_path');
            $table->json('payment_metadata')->nullable()->after('omise_charge_id');
        });

        $now = now();
        $rows = [
            [
                'name' => 'โอนเงินผ่านธนาคาร',
                'type' => 'bank_transfer',
                'description' => 'โอนเงินเข้าบัญชีธนาคาร แล้วอัปโหลดสลิป',
                'instructions' => 'กรุณาโอนเงินตามยอดรวม แล้วอัปโหลดสลิปในหน้าถัดไป',
                'config' => json_encode([
                    'bank_name' => 'กสิกรไทย',
                    'account_name' => 'บริษัท ออร์วานา จำกัด',
                    'account_number' => '123-4-56789-0',
                ]),
                'channel' => 'online',
                'sort_order' => 1,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'เก็บเงินปลายทาง',
                'type' => 'cod',
                'description' => 'ชำระเงินสดเมื่อได้รับสินค้า',
                'instructions' => 'เจ้าหน้าที่จะติดต่อยืนยันออเดอร์ก่อนจัดส่ง',
                'config' => json_encode([
                    'instructions' => 'เตรียมเงินสดตามยอดรวมเมื่อรับสินค้า',
                ]),
                'channel' => 'online',
                'sort_order' => 2,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'บัตรเครดิต / เดบิต',
                'type' => 'omise_card',
                'description' => 'ชำระด้วยบัตร Visa / Mastercard / JCB',
                'instructions' => 'กรอกข้อมูลบัตรในหน้าถัดไป (Omise Test Mode)',
                'config' => json_encode([]),
                'channel' => 'online',
                'sort_order' => 3,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'PromptPay',
                'type' => 'omise_promptpay',
                'description' => 'สแกน QR PromptPay',
                'instructions' => 'สแกน QR เพื่อชำระเงินในหน้าถัดไป',
                'config' => json_encode([]),
                'channel' => 'online',
                'sort_order' => 4,
                'is_active' => DB::raw('true'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('payment_methods')->insert($rows);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_method_id');
            $table->dropColumn(['payment_slip_path', 'omise_charge_id', 'payment_metadata']);
        });

        Schema::dropIfExists('payment_methods');
    }
};
