<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Service extends Model
{
    use HasCmsMedia;
    use HasTranslations;

    public array $translatable = ['name', 'short_description', 'description'];

    protected $fillable = [
        'slug',
        'name',
        'short_description',
        'description',
        'image',
        'icon',
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
}
