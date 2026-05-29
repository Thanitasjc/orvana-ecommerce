<?php

namespace App\Filament\Resources\InventoryTransactions;

use App\Filament\Resources\InventoryTransactions\Pages\ListInventoryTransactions;
use App\Filament\Resources\InventoryTransactions\Tables\InventoryTransactionsTable;
use App\Models\InventoryTransaction;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class InventoryTransactionResource extends Resource
{
    protected static ?string $model = InventoryTransaction::class;

    protected static ?string $navigationLabel = 'รายการสต็อก';

    protected static ?string $modelLabel = 'รายการสต็อก';

    protected static ?string $pluralModelLabel = 'รายการสต็อก';

    protected static string|\UnitEnum|null $navigationGroup = 'ร้านค้า';

    protected static ?int $navigationSort = 3;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowsRightLeft;

    public static function table(Table $table): Table
    {
        return InventoryTransactionsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInventoryTransactions::route('/'),
        ];
    }
}

