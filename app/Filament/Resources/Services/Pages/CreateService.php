<?php

namespace App\Filament\Resources\Services\Pages;

use App\Filament\Resources\Services\ServiceResource;
use Filament\Resources\Pages\CreateRecord;
use App\Filament\Concerns\MutatesTranslatable;

class CreateService extends CreateRecord
{
    use MutatesTranslatable;
    protected static string $resource = ServiceResource::class;
}
