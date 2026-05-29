<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('shipping_carrier')->nullable()->after('shipping_method');
            $table->string('tracking_number')->nullable()->after('shipping_carrier');
            $table->timestamp('shipped_at')->nullable()->after('placed_at');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->text('status_note')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'shipping_carrier',
                'tracking_number',
                'shipped_at',
                'delivered_at',
                'status_note',
            ]);
        });
    }
};

