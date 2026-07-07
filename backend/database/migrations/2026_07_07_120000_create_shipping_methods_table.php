<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('min_order')->default(0);
            $table->unsignedInteger('free_shipping_min')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('shipping_method_id')->nullable()->after('shipping_notes')->constrained()->nullOnDelete();
            $table->string('shipping_method_name')->nullable()->after('shipping_method_id');
        });

        DB::table('shipping_methods')->insert([
            [
                'name' => 'จัดส่งพัสดุมาตรฐาน',
                'description' => 'จัดส่งทั่วไป 3–5 วันทำการ',
                'price' => 20,
                'min_order' => 0,
                'free_shipping_min' => 300,
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ส่งด่วน Kerry',
                'description' => 'จัดส่งด่วน 1–2 วันทำการ',
                'price' => 50,
                'min_order' => 0,
                'free_shipping_min' => null,
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_method_id');
            $table->dropColumn('shipping_method_name');
        });

        Schema::dropIfExists('shipping_methods');
    }
};
