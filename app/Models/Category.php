<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasCmsMedia;
    use HasTranslations;

    public array $translatable = ['name', 'description'];

    protected $fillable = [
        'slug',
        'name',
        'description',
        'image',
        'sort',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
