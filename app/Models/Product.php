<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasCmsMedia;
    use \Spatie\Translatable\HasTranslations;

    public array $translatable = ['name', 'short_description', 'description'];

    protected $fillable = [
        'category_id',
        'slug',
        'sku',
        'name',
        'short_description',
        'description',
        'image',
        'gallery',
        'price',
        'sale_price',
        'stock_quantity',
        'sort',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * @return array<int, string>
     */
    public function galleryImages(): array
    {
        $images = [];

        if ($this->image) {
            $images[] = $this->image;
        }

        foreach ($this->gallery ?? [] as $path) {
            if (is_string($path) && $path !== '' && ! in_array($path, $images, true)) {
                $images[] = $path;
            }
        }

        return $images;
    }
}
