<?php

namespace App\Filament\Resources\InventoryTransactions\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class InventoryTransactionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('product.name')
                    ->label('สินค้า')
                    ->formatStateUsing(fn ($record) => $record->product?->getTranslation('name', 'th') ?? '-'),
                TextColumn::make('type')->label('ประเภท')->badge(),
                TextColumn::make('quantity_delta')->label('เปลี่ยนแปลง'),
                TextColumn::make('stock_after')->label('คงเหลือ'),
                TextColumn::make('order.order_number')->label('อ้างอิงออเดอร์'),
                TextColumn::make('created_at')->label('เวลา')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc');
    }
}

