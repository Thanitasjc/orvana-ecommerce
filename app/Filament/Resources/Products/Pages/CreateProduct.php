<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use Filament\Resources\Pages\CreateRecord;
use App\Filament\Concerns\MutatesTranslatable;

class CreateProduct extends CreateRecord
{
    use MutatesTranslatable;
    protected static string $resource = ProductResource::class;
}
