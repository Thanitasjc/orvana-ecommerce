<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class BlogPost extends Model
{
    use HasCmsMedia;
    use HasTranslations;

    public array $translatable = ['title', 'excerpt', 'content'];

    protected $fillable = [
        'slug',
        'title',
        'excerpt',
        'content',
        'image',
        'author',
        'published_at',
        'sort',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_active' => 'boolean',
            'sort' => 'integer',
        ];
    }
}
