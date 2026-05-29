<?php

namespace App\Filament\Resources\BlogPosts\Pages;

use App\Filament\Resources\BlogPosts\BlogPostResource;
use Filament\Resources\Pages\CreateRecord;
use App\Filament\Concerns\MutatesTranslatable;

class CreateBlogPost extends CreateRecord
{
    use MutatesTranslatable;
    protected static string $resource = BlogPostResource::class;
}
