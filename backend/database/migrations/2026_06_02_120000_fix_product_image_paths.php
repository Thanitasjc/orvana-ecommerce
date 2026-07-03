<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Product::query()->each(function (Product $product): void {
            $raw = $product->getRawOriginal('image');
            $fixed = Product::normalizeImagePath($raw, $product->id);

            if ($raw !== $fixed) {
                $product->updateQuietly(['image' => $fixed]);
            }
        });
    }

    public function down(): void
    {
        // Paths were invalid before; no safe rollback.
    }
};
