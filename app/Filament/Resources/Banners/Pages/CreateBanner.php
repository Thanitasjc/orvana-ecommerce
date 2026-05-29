<?php

namespace App\Filament\Resources\Banners\Pages;

use App\Filament\Resources\Banners\BannerResource;
use Filament\Resources\Pages\CreateRecord;
use App\Filament\Concerns\MutatesTranslatable;

class CreateBanner extends CreateRecord
{
    use MutatesTranslatable;
    protected static string $resource = BannerResource::class;
}
