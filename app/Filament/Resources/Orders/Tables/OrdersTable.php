<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Filament\Support\OrderStatus;
use App\Models\Order;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('items_preview')
                    ->label('รูป')
                    ->disk('public')
                    ->height(40)
                    ->getStateUsing(function (Order $record): array {
                        return $record->items
                            ->map(fn ($item) => $item->product?->image)
                            ->filter()
                            ->values()
                            ->all();
                    })
                    ->stacked()
                    ->limit(3)
                    ->limitedRemainingText(),
                TextColumn::make('order_number')->label('เลขออเดอร์')->searchable()->copyable(),
                TextColumn::make('customer_name')->label('ลูกค้า')->searchable(),
                TextColumn::make('customer_phone')->label('โทรศัพท์'),
                TextColumn::make('status')
                    ->label('สถานะ')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => OrderStatus::label($state))
                    ->sortable(),
                TextColumn::make('shipping_method')->label('ขนส่ง'),
                TextColumn::make('total_amount')->label('ยอดรวม')->money('THB')->sortable(),
                TextColumn::make('placed_at')
                    ->label('เวลา')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('สถานะ')
                    ->options(OrderStatus::options()),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }
}
