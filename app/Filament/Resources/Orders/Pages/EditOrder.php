<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Services\Ecommerce\OrderInventoryService;
use App\Services\Ecommerce\OrderNotificationService;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected string $oldStatus = '';

    protected function beforeSave(): void
    {
        $this->oldStatus = (string) $this->record->status;
    }

    protected function afterSave(): void
    {
        if ($this->record->status === 'shipped' && ! $this->record->shipped_at) {
            $this->record->forceFill(['shipped_at' => now()])->save();
        }

        if ($this->record->status === 'completed' && ! $this->record->delivered_at) {
            $this->record->forceFill(['delivered_at' => now()])->save();
        }

        if ($this->oldStatus !== $this->record->status) {
            app(OrderInventoryService::class)->handleStatusChange(
                $this->record,
                $this->oldStatus,
                (string) $this->record->status,
            );

            app(OrderNotificationService::class)
                ->notifyStatusChanged($this->record, $this->oldStatus);
        }
    }
}

