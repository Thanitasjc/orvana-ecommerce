<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('apply_to', 20)->default('order')->after('type');
            $table->string('customer_rule', 20)->default('all')->after('apply_to');
            $table->unsignedInteger('per_user_limit')->nullable()->after('max_uses');
            $table->json('rules')->nullable()->after('per_user_limit');
        });

        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('channel', 50);
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('shipping_discount')->default(0);
            $table->unsignedInteger('order_subtotal')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['coupon_id', 'customer_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('shipping_fee')->default(0)->after('discount');
            $table->unsignedInteger('shipping_discount')->default(0)->after('shipping_fee');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_fee', 'shipping_discount']);
        });

        Schema::dropIfExists('coupon_usages');

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['description', 'apply_to', 'customer_rule', 'per_user_limit', 'rules']);
        });
    }
};
