<?php

namespace App\Filament\Resources\Testimonials\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TestimonialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('รีวิว')
                    ->schema([
                        FileUpload::make('image')->label('รูป')->image()->directory('testimonials')->disk('public'),
                        TextInput::make('rating')->label('คะแนน')->numeric()->minValue(1)->maxValue(5)->default(5),
                        TextInput::make('sort')->label('ลำดับ')->numeric()->default(0),
                        Toggle::make('is_active')->label('แสดงผล')->default(true),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('เนื้อหา', function (string $locale) {
                    return [
                        TextInput::make("name.{$locale}")->label('ชื่อ')->required($locale === 'th'),
                        TextInput::make("role.{$locale}")->label('ตำแหน่ง/บทบาท'),
                        TextInput::make("content.{$locale}")->label('ข้อความรีวิว')->columnSpanFull(),
                    ];
                }),
            ]);
    }
}
