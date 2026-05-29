<?php

namespace App\Filament\Resources\Testimonials\Pages;

use App\Filament\Resources\Testimonials\TestimonialResource;
use Filament\Resources\Pages\CreateRecord;
use App\Filament\Concerns\MutatesTranslatable;

class CreateTestimonial extends CreateRecord
{
    use MutatesTranslatable;
    protected static string $resource = TestimonialResource::class;
}
