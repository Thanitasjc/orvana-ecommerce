<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->unsignedInteger('stock_quantity')->default(0)->after('sale_price');
        });

        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->timestamps();
            $table->unique(['cart_id', 'product_id']);
        });

        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending');
            $table->string('currency', 3)->default('THB');
            $table->string('shipping_method')->default('standard');
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('subtotal_amount', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('shipping_country');
            $table->string('shipping_state')->nullable();
            $table->string('shipping_city');
            $table->string('shipping_address_line1');
            $table->string('shipping_address_line2')->nullable();
            $table->string('shipping_postal_code');
            $table->text('note')->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 12, 2);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('method');
            $table->string('status')->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('provider')->nullable();
            $table->string('reference')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->integer('quantity_delta');
            $table->unsignedInteger('stock_after');
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('stock_quantity');
        });
    }
};

