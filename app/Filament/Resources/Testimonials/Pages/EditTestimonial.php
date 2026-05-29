<?php

namespace App\Filament\Resources\Testimonials\Pages;

use App\Filament\Resources\Testimonials\TestimonialResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use App\Filament\Concerns\MutatesTranslatable;

class EditTestimonial extends EditRecord
{
    use MutatesTranslatable;
    protected static string $resource = TestimonialResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
