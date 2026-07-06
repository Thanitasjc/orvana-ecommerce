<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogSyncService
{
  private string $source;

  private string $remote;

  /** @var array<string, string> */
  private array $imagePathMap = [];

  private int $copiedImages = 0;

  public function __construct(string $source = 'sqlite', string $remote = 'remote')
  {
    $this->source = $source;
    $this->remote = $remote;
  }

  /**
   * @return array{categories: int, products: int, variations: int, images: int}
   */
  public function sync(bool $dryRun = false, bool $withCustomers = false): array
  {
    $this->imagePathMap = [];
    $this->copiedImages = 0;

    $schema = (string) config('database.connections.remote.search_path', 'aesthete');
    if (! $dryRun) {
      DB::connection($this->remote)->statement('SET search_path TO "'.$schema.'"');
    }

    $stats = ['categories' => 0, 'products' => 0, 'variations' => 0, 'images' => 0];

    $categoryIds = $this->syncCategories($dryRun);
    $stats['categories'] = count($categoryIds);

    $productIds = $this->syncProducts($categoryIds, $dryRun);
    $stats['products'] = count($productIds);

    $stats['variations'] = $this->syncVariations($productIds, $dryRun);
    $stats['images'] = $this->copiedImages;

    if ($withCustomers) {
      $this->syncCustomers($dryRun);
    }

    return $stats;
  }

  /**
   * @return array<string, int> slug => remote category id
   */
  private function syncCategories(bool $dryRun): array
  {
    $rows = DB::connection($this->source)->table('categories')->orderBy('id')->get();
    $map = [];

    foreach ($rows as $row) {
      if ($dryRun) {
        $map[$row->slug] = 0;
        continue;
      }

      Category::on($this->remote)->updateOrCreate(
        ['slug' => $row->slug],
        [
          'name' => $row->name,
          'image' => $this->migrateImagePath($row->image, "category-{$row->slug}"),
        ],
      );

      $map[$row->slug] = (int) Category::on($this->remote)->where('slug', $row->slug)->value('id');
    }

    return $map;
  }

  /**
   * @param  array<string, int>  $categoryIds
   * @return array<string, int> slug => remote product id
   */
  private function syncProducts(array $categoryIds, bool $dryRun): array
  {
    $rows = DB::connection($this->source)
      ->table('products')
      ->orderBy('id')
      ->get();

    $sourceCategories = DB::connection($this->source)
      ->table('categories')
      ->pluck('slug', 'id');

    $map = [];

    foreach ($rows as $row) {
      $categorySlug = $sourceCategories[$row->category_id] ?? null;
      if (! $categorySlug || ! array_key_exists($categorySlug, $categoryIds)) {
        continue;
      }

      $images = $this->migrateGallery($row->images, $row->slug);

      $payload = [
        'category_id' => $dryRun ? 0 : $categoryIds[$categorySlug],
        'name' => $row->name,
        'description' => $row->description,
        'detail_content' => $row->detail_content,
        'price' => $row->price,
        'cost' => $row->cost,
        'image' => $this->migrateImagePath($row->image, $row->slug),
        'images' => $images,
        'sales_count' => $row->sales_count,
        'is_featured' => (bool) $row->is_featured,
        'deleted_at' => $row->deleted_at,
      ];

      if ($dryRun) {
        $map[$row->slug] = 0;
        continue;
      }

      Product::on($this->remote)->withTrashed()->updateOrCreate(
        ['slug' => $row->slug],
        $payload,
      );

      $map[$row->slug] = (int) Product::on($this->remote)->withTrashed()->where('slug', $row->slug)->value('id');
    }

    return $map;
  }

  /**
   * @param  array<string, int>  $productIds
   */
  private function syncVariations(array $productIds, bool $dryRun): int
  {
    $sourceProducts = DB::connection($this->source)->table('products')->pluck('slug', 'id');
    $count = 0;

    $rows = DB::connection($this->source)
      ->table('product_variations')
      ->orderBy('id')
      ->get();

    foreach ($rows as $row) {
      $productSlug = $sourceProducts[$row->product_id] ?? null;
      if (! $productSlug || ! array_key_exists($productSlug, $productIds)) {
        continue;
      }

      $payload = [
        'product_id' => $dryRun ? 0 : $productIds[$productSlug],
        'color' => $row->color,
        'size' => $row->size,
        'stock' => $row->stock,
      ];

      if ($dryRun) {
        $count++;
        continue;
      }

      ProductVariation::on($this->remote)->updateOrCreate(
        ['sku' => $row->sku],
        [
          'product_id' => $productIds[$productSlug],
          'color' => $row->color,
          'size' => $row->size,
          'stock' => $row->stock,
        ],
      );

      $count++;
    }

    return $count;
  }

  private function syncCustomers(bool $dryRun): void
  {
    $rows = DB::connection($this->source)->table('customers')->orderBy('id')->get();

    foreach ($rows as $row) {
      $payload = [
        'name' => $row->name,
        'email' => $row->email,
        'phone' => $row->phone,
        'password' => $row->password,
        'points' => $row->points,
        'total_spent' => $row->total_spent,
        'tier' => $row->tier,
        'avatar' => $row->avatar ?? null,
        'created_at' => $row->created_at,
        'updated_at' => $row->updated_at,
      ];

      if ($dryRun) {
        continue;
      }

      DB::connection($this->remote)->table('customers')->updateOrInsert(
        ['email' => $row->email],
        $payload,
      );
    }
  }

  private function migrateImagePath(?string $path, string $context): ?string
  {
    if (! $path) {
      return null;
    }

    if (isset($this->imagePathMap[$path])) {
      return $this->imagePathMap[$path];
    }

    if (! Str::startsWith($path, '/storage/products/')) {
      $this->imagePathMap[$path] = $path;

      return $path;
    }

    $filename = basename($path);
    $destDir = base_path('../frontend/public/assets/img/product/synced');
    $destPath = $destDir.DIRECTORY_SEPARATOR.$filename;
    $publicPath = "/assets/img/product/synced/{$filename}";

    $sourceCandidates = [
      public_path("storage/products/{$filename}"),
      storage_path("app/public/products/{$filename}"),
    ];

    foreach ($sourceCandidates as $sourcePath) {
      if (! is_file($sourcePath)) {
        continue;
      }

      if (! is_dir($destDir)) {
        mkdir($destDir, 0755, true);
      }

      if (! is_file($destPath)) {
        copy($sourcePath, $destPath);
        $this->copiedImages++;
      }

      $this->imagePathMap[$path] = $publicPath;

      return $publicPath;
    }

    $this->imagePathMap[$path] = $path;

    return $path;
  }

  /**
   * @return array<int, array{thumb: string, main: string}>|null
   */
  private function migrateGallery(mixed $raw, string $slug): ?array
  {
    if (! $raw) {
      return null;
    }

    $items = is_string($raw) ? json_decode($raw, true) : $raw;
    if (! is_array($items) || $items === []) {
      return null;
    }

    $gallery = [];
    foreach ($items as $item) {
      if (! is_array($item)) {
        continue;
      }

      $thumb = $this->migrateImagePath($item['thumb'] ?? null, "{$slug}-thumb");
      $main = $this->migrateImagePath($item['main'] ?? null, "{$slug}-main");

      if (! $thumb && ! $main) {
        continue;
      }

      $gallery[] = [
        'thumb' => $thumb ?? $main,
        'main' => $main ?? $thumb,
      ];
    }

    return $gallery === [] ? null : $gallery;
  }
}
