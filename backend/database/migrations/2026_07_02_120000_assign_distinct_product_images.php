<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * @return array<string, string>
     */
    public static function imageMap(): array
    {
        return [
            'minimalist-autumn-blazer' => '/assets/img/product/slider/product-slider-1.jpg',
            'oversized-premium-cotton-tee' => '/assets/img/product/2/prodcut-3.jpg',
            'linen-summer-wrap-dress' => '/assets/img/product/trending/trending-1.jpg',
            'urban-cargo-pants-modern-fit' => '/assets/img/product/2/prodcut-7.jpg',
            'cropped-heavyweight-denim-jacket' => '/assets/img/product/slider/product-slider-4.jpg',
            'aesthetic-tan-leather-crossbody' => '/assets/img/product/2/prodcut-12.jpg',
        ];
    }

    public function up(): void
    {
        foreach (self::imageMap() as $slug => $image) {
            Product::query()->where('slug', $slug)->update(['image' => $image]);
        }
    }

    public function down(): void
    {
        // No safe rollback — images were duplicated before this migration.
    }
};
