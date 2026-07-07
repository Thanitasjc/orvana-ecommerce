<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('guest_name')->nullable()->after('customer_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone', 30)->nullable()->after('guest_email');
            $table->text('shipping_address')->nullable()->after('guest_phone');
            $table->string('shipping_province')->nullable()->after('shipping_address');
            $table->string('shipping_postcode', 20)->nullable()->after('shipping_province');
            $table->text('shipping_notes')->nullable()->after('shipping_postcode');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'guest_name',
                'guest_email',
                'guest_phone',
                'shipping_address',
                'shipping_province',
                'shipping_postcode',
                'shipping_notes',
            ]);
        });
    }
};
