<?php

namespace App\Filament\Resources\BlogPosts\Pages;

use App\Filament\Concerns\MutatesTranslatable;
use App\Filament\Resources\BlogPosts\BlogPostResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBlogPost extends EditRecord
{
    use MutatesTranslatable;
    protected static string $resource = BlogPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('viewOnSite')
                ->label('ดูหน้าบทความ')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->url(fn () => route('frontend.blog.show', $this->record->slug))
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
