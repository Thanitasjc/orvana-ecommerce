<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
            Schema::create('coupons_new', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('type', 30)->default('fixed');
                $table->string('apply_to', 20)->default('order');
                $table->string('customer_rule', 20)->default('all');
                $table->unsignedInteger('value')->default(0);
                $table->unsignedInteger('min_order')->default(0);
                $table->unsignedInteger('max_uses')->nullable();
                $table->unsignedInteger('per_user_limit')->nullable();
                $table->json('rules')->nullable();
                $table->unsignedInteger('used_count')->default(0);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->enum('channel', ['online', 'pos', 'both'])->default('both');
                $table->timestamps();
            });

            DB::statement('INSERT INTO coupons_new SELECT id, code, name, description, type, apply_to, customer_rule, value, min_order, max_uses, per_user_limit, rules, used_count, starts_at, ends_at, is_active, channel, created_at, updated_at FROM coupons');
            Schema::drop('coupons');
            Schema::rename('coupons_new', 'coupons');
            DB::statement('PRAGMA foreign_keys=ON');

            return;
        }

        Schema::table('coupons', function (Blueprint $table) {
            $table->string('type', 30)->default('fixed')->change();
        });
    }

    public function down(): void
    {
        // No-op: reverting enum constraint is not required for local dev.
    }
};
