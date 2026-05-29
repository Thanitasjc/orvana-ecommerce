<?php

namespace App\Filament\Resources\BlogPosts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BlogPostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')->label('รูป')->disk('public'),
                TextColumn::make('slug')->label('Slug')->searchable()->copyable(),
                TextColumn::make('title')
                    ->label('หัวข้อ')
                    ->formatStateUsing(fn ($record) => $record->getTranslation('title', 'th'))
                    ->searchable(),
                TextColumn::make('author')->label('ผู้เขียน'),
                TextColumn::make('published_at')->label('เผยแพร่')->dateTime('d/m/Y'),
                IconColumn::make('is_active')->label('สถานะ')->boolean(),
            ])
            ->defaultSort('sort')
            ->reorderable('sort')
            ->recordActions([
                EditAction::make(),
                ViewAction::make()
                    ->label('ดูหน้าเว็บ')
                    ->url(fn ($record) => route('frontend.blog.show', $record->slug))
                    ->openUrlInNewTab(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
