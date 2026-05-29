<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'รายการสินค้า';

    protected static ?string $modelLabel = 'รายการ';

    protected static ?string $pluralModelLabel = 'รายการสินค้า';

    public function isReadOnly(): bool
    {
        return true;
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('product_name')
            ->modifyQueryUsing(fn (Builder $query) => $query->with('product:id,image'))
            ->columns([
                ImageColumn::make('product.image')
                    ->label('รูป')
                    ->disk('public')
                    ->height(48)
                    ->defaultImageUrl(fn () => asset('assets/images/product/product-10.jpg')),
                TextColumn::make('product_name')
                    ->label('สินค้า')
                    ->searchable(),
                TextColumn::make('product_sku')
                    ->label('SKU'),
                TextColumn::make('quantity')
                    ->label('จำนวน')
                    ->alignCenter(),
                TextColumn::make('unit_price')
                    ->label('ราคา/ชิ้น')
                    ->money('THB'),
                TextColumn::make('line_total')
                    ->label('รวม')
                    ->money('THB'),
            ])
            ->paginated(false);
    }
}
