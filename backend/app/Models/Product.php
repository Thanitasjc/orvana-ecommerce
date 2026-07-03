<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'detail_content',
        'price',
        'cost',
        'image',
        'images',
        'sales_count',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'images' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function totalStock(): int
    {
        return (int) $this->variations()->sum('stock');
    }

    /**
     * Normalize legacy / invalid image paths for the Next.js public assets folder.
     */
    public static function normalizeImagePath(?string $path, ?int $productId = null): string
    {
        if ($path) {
            $normalized = preg_replace(
                '#/assets/img/product/2/product-#',
                '/assets/img/product/2/prodcut-',
                $path,
            );

            return $normalized ?? $path;
        }

        $index = $productId ? (($productId - 1) % 15) + 1 : 1;

        return "/assets/img/product/2/prodcut-{$index}.jpg";
    }

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => static::normalizeImagePath($value, $this->id),
        );
    }
}
