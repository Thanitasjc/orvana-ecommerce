<?php

namespace App\Filament\Resources\Testimonials\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TestimonialsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')->label('รูป')->disk('public'),
                TextColumn::make('name')
                    ->label('ชื่อ')
                    ->formatStateUsing(fn ($record) => $record->getTranslation('name', 'th')),
                TextColumn::make('rating')->label('คะแนน'),
                TextColumn::make('sort')->label('ลำดับ')->sortable(),
                IconColumn::make('is_active')->label('สถานะ')->boolean(),
            ])
            ->defaultSort('sort')
            ->reorderable('sort')
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
