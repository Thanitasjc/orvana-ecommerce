<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
  /**
   * @return array<int, array{thumb: string, main: string}>
   */
  private static function gallery(): array
  {
    $base = '/assets/img/product/boys-graphic-t-shirt';

    return [
      ['thumb' => "{$base}/orange.png", 'main' => "{$base}/orange.png"],
      ['thumb' => "{$base}/tan.png", 'main' => "{$base}/tan.png"],
      ['thumb' => "{$base}/green.png", 'main' => "{$base}/green.png"],
      ['thumb' => "{$base}/pink.png", 'main' => "{$base}/pink.png"],
    ];
  }

  public function up(): void
  {
    $category = Category::query()->where('slug', 'tops')->first();
    if (! $category) {
      return;
    }

    $slug = 'boys-graphic-t-shirt';
    $gallery = self::gallery();

    $product = Product::updateOrCreate(
      ['slug' => $slug],
      [
        'category_id' => $category->id,
        'name' => 'Boys Graphic T-Shirt',
        'description' => 'เสื้อยืดกราฟิกสำหรับเด็กชาย ผ้านุ่ม สวมใส่สบาย เลือกลายและสีได้หลากหลาย',
        'price' => 650,
        'cost' => 280,
        'is_featured' => true,
        'image' => $gallery[0]['main'],
        'images' => $gallery,
      ],
    );

    $variations = [
      ['Orange', 'S', 12],
      ['Orange', 'M', 15],
      ['Orange', 'L', 10],
      ['Tan', 'S', 8],
      ['Tan', 'M', 12],
      ['Tan', 'L', 9],
      ['Green', 'S', 10],
      ['Green', 'M', 14],
      ['Green', 'L', 7],
      ['Pink', 'S', 11],
      ['Pink', 'M', 13],
      ['Pink', 'L', 6],
    ];

    foreach ($variations as [$color, $size, $stock]) {
      ProductVariation::updateOrCreate(
        [
          'product_id' => $product->id,
          'color' => $color,
          'size' => $size,
        ],
        [
          'sku' => strtoupper(Str::slug("{$slug}-{$color}-{$size}")),
          'stock' => $stock,
        ],
      );
    }
  }

  public function down(): void
  {
    $product = Product::query()->where('slug', 'boys-graphic-t-shirt')->first();
    if (! $product) {
      return;
    }

    ProductVariation::query()->where('product_id', $product->id)->delete();
    $product->delete();
  }
};
