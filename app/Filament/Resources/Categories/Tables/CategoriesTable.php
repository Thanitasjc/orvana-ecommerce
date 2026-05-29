<?php

namespace App\Filament\Resources\Categories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('รูป')
                    ->disk('public'),
                TextColumn::make('name')
                    ->label('ชื่อ')
                    ->formatStateUsing(fn ($record) => $record->getTranslation('name', 'th'))
                    ->searchable(),
                TextColumn::make('slug')
                    ->label('Slug')
                    ->searchable(),
                TextColumn::make('sort')
                    ->label('ลำดับ')
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('สถานะ')
                    ->boolean(),
                TextColumn::make('updated_at')
                    ->label('อัปเดต')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('sort')
            ->reorderable('sort')
            ->filters([
                TernaryFilter::make('is_active')->label('สถานะแสดงผล'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
