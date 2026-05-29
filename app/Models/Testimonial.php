<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Testimonial extends Model
{
    use HasCmsMedia;
    use HasTranslations;

    public array $translatable = ['name', 'role', 'content'];

    protected $fillable = [
        'name',
        'role',
        'content',
        'image',
        'rating',
        'sort',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort' => 'integer',
            'rating' => 'integer',
        ];
    }
}
