<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variations'])->latest();

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        $paginator = $query->paginate(15);
        $paginator->getCollection()->transform(fn (Product $product) => $this->formatProduct($product));

        return response()->json($paginator);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $this->formatProduct($product->load(['category', 'variations'])),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateProduct($request);

        $product = DB::transaction(function () use ($validated) {
            $slug = $this->resolveSlug($validated['slug'] ?? null, $validated['name']);

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'detail_content' => $this->sanitizeDetailContent($validated['detail_content'] ?? null),
                'price' => $validated['price'],
                'cost' => $validated['cost'] ?? 0,
                'image' => $validated['image'] ?? null,
                'images' => $this->normalizeGalleryImages($validated['images'] ?? null, $validated['image'] ?? null),
                'is_featured' => $validated['is_featured'] ?? false,
            ]);

            $this->syncVariations($product, $validated['variations']);

            return $product->fresh()->load(['category', 'variations']);
        });

        return response()->json(['data' => $this->formatProduct($product)], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validateProduct($request, $product);

        $product = DB::transaction(function () use ($validated, $product) {
            $updates = collect($validated)->only([
                'category_id',
                'name',
                'description',
                'detail_content',
                'price',
                'cost',
                'image',
                'is_featured',
            ])->filter(fn ($value) => $value !== null)->all();

            if (array_key_exists('images', $validated)) {
                $updates['images'] = $this->normalizeGalleryImages(
                    $validated['images'] ?? null,
                    $validated['image'] ?? $product->image,
                );
            }

            if (array_key_exists('slug', $validated) && filled($validated['slug'])) {
                $updates['slug'] = $this->resolveSlug($validated['slug'], $validated['name'] ?? $product->name, $product->id);
            }

            if (array_key_exists('name', $validated)) {
                $updates['name'] = $validated['name'];
            }

            if (array_key_exists('detail_content', $validated)) {
                $updates['detail_content'] = $this->sanitizeDetailContent($validated['detail_content']);
            }

            if ($updates !== []) {
                $product->update($updates);
            }

            if (array_key_exists('variations', $validated)) {
                $this->syncVariations($product, $validated['variations']);
            }

            return $product->fresh()->load(['category', 'variations']);
        });

        return response()->json(['data' => $this->formatProduct($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'ลบสินค้าแล้ว']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:4096'],
        ]);

        $path = $validated['image']->store('products', 'public');

        return response()->json([
            'path' => '/storage/'.$path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $slugRule = ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'];
        if ($product) {
            $slugRule[] = Rule::unique('products', 'slug')->ignore($product->id);
        } else {
            $slugRule[] = Rule::unique('products', 'slug');
        }

        return $request->validate([
            'category_id' => [$product ? 'sometimes' : 'required', 'integer', 'exists:categories,id'],
            'name' => [$product ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => $slugRule,
            'description' => ['nullable', 'string', 'max:5000'],
            'detail_content' => ['nullable', 'string'],
            'price' => [$product ? 'sometimes' : 'required', 'integer', 'min:0'],
            'cost' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array', 'min:1'],
            'images.*.thumb' => ['nullable', 'string', 'max:500'],
            'images.*.main' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'variations' => [$product ? 'sometimes' : 'required', 'array', 'min:1'],
            'variations.*.id' => ['nullable', 'integer', 'exists:product_variations,id'],
            'variations.*.color' => ['required_with:variations', 'string', 'max:100'],
            'variations.*.size' => ['required_with:variations', 'string', 'max:50'],
            'variations.*.sku' => ['nullable', 'string', 'max:120'],
            'variations.*.stock' => ['required_with:variations', 'integer', 'min:0'],
        ]);
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $name);
        if ($base === '') {
            $base = 'product';
        }

        $candidate = $base;
        $suffix = 1;

        while (
            Product::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    /**
     * @param  array<int, array<string, mixed>>  $variations
     */
    private function syncVariations(Product $product, array $variations): void
    {
        $normalized = [];

        foreach ($variations as $index => $row) {
            $color = trim((string) $row['color']);
            $size = trim((string) $row['size']);

            $normalized[] = [
                'id' => $row['id'] ?? null,
                'color' => $color,
                'size' => $size,
                'sku' => filled($row['sku'] ?? null)
                    ? strtoupper(trim((string) $row['sku']))
                    : null,
                'stock' => (int) $row['stock'],
                'index' => $index,
            ];
        }

        $combinationKeys = array_map(
            fn (array $row) => mb_strtolower($row['color'].'|'.$row['size']),
            $normalized,
        );

        if (count($combinationKeys) !== count(array_unique($combinationKeys))) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'variations' => ['มีสีและไซส์ซ้ำกัน กรุณาตรวจสอบอีกครั้ง'],
            ]);
        }

        foreach ($normalized as $row) {
            if (empty($row['id'])) {
                continue;
            }

            ProductVariation::query()
                ->where('product_id', $product->id)
                ->where('id', $row['id'])
                ->update([
                    'color' => '__pending_'.$row['index'],
                    'size' => '__pending_'.$row['index'],
                    'sku' => '__PENDING_'.$product->id.'_'.$row['index'],
                ]);
        }

        $keptIds = [];

        foreach ($normalized as $row) {
            $sku = $row['sku'] ?? strtoupper(Str::slug($product->slug.'-'.$row['color'].'-'.$row['size']));

            $payload = [
                'color' => $row['color'],
                'size' => $row['size'],
                'sku' => $sku,
                'stock' => $row['stock'],
            ];

            if (! empty($row['id'])) {
                $variation = ProductVariation::query()
                    ->where('product_id', $product->id)
                    ->where('id', $row['id'])
                    ->firstOrFail();

                $variation->update($payload);
                $keptIds[] = $variation->id;
                continue;
            }

            $variation = ProductVariation::create(array_merge($payload, [
                'product_id' => $product->id,
            ]));
            $keptIds[] = $variation->id;
        }

        ProductVariation::query()
            ->where('product_id', $product->id)
            ->whereNotIn('id', $keptIds)
            ->delete();
    }

    /**
     * @param  array<int, mixed>|null  $images
     * @return array<int, array{thumb: string, main: string}>|null
     */
    private function normalizeGalleryImages(?array $images, ?string $coverImage = null): ?array
    {
        $normalized = [];

        foreach ($images ?? [] as $item) {
            if (is_string($item) && $item !== '') {
                $normalized[] = ['thumb' => $item, 'main' => $item];
                continue;
            }

            if (! is_array($item)) {
                continue;
            }

            $main = $item['main'] ?? $item['thumb'] ?? null;
            $thumb = $item['thumb'] ?? $main;

            if (is_string($main) && $main !== '') {
                $normalized[] = [
                    'thumb' => is_string($thumb) && $thumb !== '' ? $thumb : $main,
                    'main' => $main,
                ];
            }
        }

        if ($normalized === [] && filled($coverImage)) {
            return [['thumb' => $coverImage, 'main' => $coverImage]];
        }

        return $normalized === [] ? null : $normalized;
    }

    private function sanitizeDetailContent(?string $html): ?string
    {
        if (blank($html)) {
            return null;
        }

        $allowed = '<p><br><strong><b><em><i><u><s><strike><h1><h2><h3><h4><h5><h6>'
            .'<ul><ol><li><blockquote><pre><code><a><img><span><div><sub><sup>'
            .'<table><thead><tbody><tr><td><th>';
        $clean = strip_tags($html, $allowed);

        return trim($clean) === '' ? null : $clean;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProduct(Product $product): array
    {
        $product->loadMissing(['category', 'variations']);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'detail_content' => $product->detail_content,
            'price' => $product->price,
            'cost' => $product->cost,
            'image' => $product->image,
            'images' => $product->images,
            'is_featured' => $product->is_featured,
            'sales_count' => $product->sales_count,
            'total_stock' => $product->totalStock(),
            'category' => $product->category,
            'variations' => $product->variations,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }
}
