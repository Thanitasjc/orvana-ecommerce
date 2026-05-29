<?php

namespace App\Filament\Resources\Services\Pages;

use App\Filament\Resources\Services\ServiceResource;
use App\Filament\Concerns\MutatesTranslatable;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditService extends EditRecord
{
    use MutatesTranslatable;
    protected static string $resource = ServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('viewOnSite')
                ->label('ดูหน้าบริการ')
                ->icon('heroicon-o-arrow-top-right-on-square')
                ->url(fn () => route('frontend.services.show', $this->record->slug))
                ->openUrlInNewTab(),
            DeleteAction::make(),
        ];
    }
}
