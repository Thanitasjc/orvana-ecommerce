<?php

declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$schema = env('DB_SCHEMA', 'aesthete');

DB::statement("CREATE SCHEMA IF NOT EXISTS {$schema}");

if (! Schema::hasTable('coupons')) {
    DB::statement("
        CREATE TABLE {$schema}.coupons (
            id BIGSERIAL PRIMARY KEY,
            code VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(30) NOT NULL DEFAULT 'fixed',
            value INTEGER NOT NULL,
            min_order INTEGER NOT NULL DEFAULT 0,
            max_uses INTEGER NULL,
            used_count INTEGER NOT NULL DEFAULT 0,
            starts_at TIMESTAMP NULL,
            ends_at TIMESTAMP NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            channel VARCHAR(20) NOT NULL DEFAULT 'both',
            description TEXT NULL,
            apply_to VARCHAR(20) NOT NULL DEFAULT 'order',
            customer_rule VARCHAR(20) NOT NULL DEFAULT 'all',
            per_user_limit INTEGER NULL,
            rules JSON NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )
    ");
    echo "Created coupons table\n";
} else {
    echo "coupons table already exists\n";
}

if (! Schema::hasTable('coupon_usages')) {
    DB::statement("
        CREATE TABLE {$schema}.coupon_usages (
            id BIGSERIAL PRIMARY KEY,
            coupon_id BIGINT NOT NULL REFERENCES {$schema}.coupons(id) ON DELETE CASCADE,
            order_id BIGINT NOT NULL REFERENCES {$schema}.orders(id) ON DELETE CASCADE,
            customer_id BIGINT NULL REFERENCES {$schema}.customers(id) ON DELETE SET NULL,
            channel VARCHAR(50) NOT NULL,
            discount_amount INTEGER NOT NULL DEFAULT 0,
            shipping_discount INTEGER NOT NULL DEFAULT 0,
            order_subtotal INTEGER NOT NULL DEFAULT 0,
            metadata JSON NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )
    ");
    DB::statement("CREATE INDEX coupon_usages_coupon_customer_idx ON {$schema}.coupon_usages (coupon_id, customer_id)");
    echo "Created coupon_usages table\n";
} else {
    echo "coupon_usages table already exists\n";
}

$orderColumns = collect(DB::select("
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = ? AND table_name = 'orders'
", [$schema]))->pluck('column_name')->all();

if (! in_array('coupon_id', $orderColumns, true)) {
    DB::statement("ALTER TABLE {$schema}.orders ADD COLUMN coupon_id BIGINT NULL REFERENCES {$schema}.coupons(id) ON DELETE SET NULL");
    echo "Added orders.coupon_id\n";
}

if (! in_array('coupon_code', $orderColumns, true)) {
    DB::statement("ALTER TABLE {$schema}.orders ADD COLUMN coupon_code VARCHAR(255) NULL");
    echo "Added orders.coupon_code\n";
}

if (! in_array('shipping_fee', $orderColumns, true)) {
    DB::statement("ALTER TABLE {$schema}.orders ADD COLUMN shipping_fee INTEGER NOT NULL DEFAULT 0");
    echo "Added orders.shipping_fee\n";
}

if (! in_array('shipping_discount', $orderColumns, true)) {
    DB::statement("ALTER TABLE {$schema}.orders ADD COLUMN shipping_discount INTEGER NOT NULL DEFAULT 0");
    echo "Added orders.shipping_discount\n";
}

$migrations = [
    '2026_07_06_120000_create_coupons_table',
    '2026_07_06_140000_enhance_coupons_system',
    '2026_07_06_141000_expand_coupon_type_column',
];

foreach ($migrations as $migration) {
    $exists = DB::table('migrations')->where('migration', $migration)->exists();
    if (! $exists) {
        $batch = (int) DB::table('migrations')->max('batch') + 1;
        DB::table('migrations')->insert([
            'migration' => $migration,
            'batch' => $batch,
        ]);
        echo "Recorded migration: {$migration}\n";
    }
}

echo "Coupon schema ready.\n";
