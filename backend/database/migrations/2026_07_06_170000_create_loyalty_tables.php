<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('baht_per_point')->default(100);
            $table->unsignedInteger('min_spend')->default(0);
            $table->unsignedInteger('gold_threshold')->default(10000);
            $table->unsignedInteger('platinum_threshold')->default(25000);
            $table->boolean('redeem_enabled')->default(true);
            $table->unsignedInteger('redeem_points_per_baht')->default(10);
            $table->unsignedInteger('min_redeem_points')->default(100);
            $table->unsignedInteger('max_redeem_percent')->default(50);
            $table->timestamps();
        });

        DB::table('loyalty_settings')->insert([
            'enabled' => true,
            'baht_per_point' => 100,
            'min_spend' => 0,
            'gold_threshold' => 10000,
            'platinum_threshold' => 25000,
            'redeem_enabled' => true,
            'redeem_points_per_baht' => 10,
            'min_redeem_points' => 100,
            'max_redeem_percent' => 50,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('loyalty_point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->integer('points');
            $table->unsignedInteger('balance_after');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'created_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('points_redeemed')->default(0)->after('discount');
            $table->unsignedInteger('points_discount')->default(0)->after('points_redeemed');
            $table->unsignedInteger('points_earned')->default(0)->after('points_discount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['points_redeemed', 'points_discount', 'points_earned']);
        });

        Schema::dropIfExists('loyalty_point_transactions');
        Schema::dropIfExists('loyalty_settings');
    }
};
