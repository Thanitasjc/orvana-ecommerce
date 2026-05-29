<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Banner extends Model
{
    use HasCmsMedia;
    use HasTranslations;

    public array $translatable = ['title', 'subtitle', 'button_text'];

    protected $fillable = [
        'placement',
        'title',
        'subtitle',
        'button_text',
        'button_url',
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

    public static function placements(): array
    {
        return [
            'home_slider' => 'Home Slider',
            'home_cta' => 'Home CTA Banner',
        ];
    }
}
