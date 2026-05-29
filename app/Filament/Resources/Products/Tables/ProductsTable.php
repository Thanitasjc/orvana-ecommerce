<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')->label('รูป')->disk('public'),
                TextColumn::make('slug')->label('Slug')->searchable()->copyable(),
                TextColumn::make('name')
                    ->label('ชื่อ')
                    ->formatStateUsing(fn ($record) => $record->getTranslation('name', 'th'))
                    ->searchable(),
                TextColumn::make('category.name')
                    ->label('หมวดหมู่')
                    ->formatStateUsing(fn ($record) => $record->category?->getTranslation('name', 'th') ?? '-'),
                TextColumn::make('price')->label('ราคา')->money('THB'),
                TextColumn::make('sort')->label('ลำดับ')->sortable(),
                IconColumn::make('is_active')->label('แสดง')->boolean(),
                IconColumn::make('is_featured')->label('แนะนำ')->boolean(),
            ])
            ->defaultSort('sort')
            ->reorderable('sort')
            ->filters([
                TernaryFilter::make('is_active'),
                TernaryFilter::make('is_featured')->label('สินค้าแนะนำ'),
            ])
            ->recordActions([
                EditAction::make(),
                ViewAction::make()
                    ->label('ดูหน้าเว็บ')
                    ->url(fn ($record) => route('frontend.product.show', $record->slug))
                    ->openUrlInNewTab(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
