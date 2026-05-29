<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use App\Filament\Concerns\MutatesTranslatable;

class EditProduct extends EditRecord
{
    use MutatesTranslatable;
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('viewOnSite')
                ->label('ดูหน้ารายละเอียด')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->url(fn () => route('frontend.product.show', $this->record->slug))
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
