<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * @return array<int, array<int, array{thumb: string, main: string}>>
     */
    public static function gallerySets(): array
    {
        return [
            1 => self::slides([1, 2, 3, 4, 5]),
            2 => self::slides([2, 3, 4, 5, 1]),
            3 => self::slides([3, 4, 5, 1, 2]),
            4 => self::slides([4, 5, 1, 2, 3]),
            5 => self::slides([5, 1, 2, 3, 4]),
            6 => self::slides([1, 3, 5, 2, 4]),
        ];
    }

    /**
     * @param  array<int, int>  $indexes
     * @return array<int, array{thumb: string, main: string}>
     */
    private static function slides(array $indexes): array
    {
        return array_map(
            fn (int $index) => [
                'thumb' => "/assets/img/product/details/nav/product-details-nav-{$index}.jpg",
                'main' => "/assets/img/product/details/main/product-details-main-{$index}.jpg",
            ],
            $indexes,
        );
    }

    public function up(): void
    {
        Product::query()->each(function (Product $product): void {
            $set = self::gallerySets()[$product->id] ?? self::gallerySets()[1];
            $product->updateQuietly(['images' => $set]);
        });
    }

    public function down(): void
    {
        Product::query()->update(['images' => null]);
    }
};
