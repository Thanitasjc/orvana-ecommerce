<?php

namespace App\Filament\Resources\Banners\Schemas;

use App\Filament\Support\TranslatableTabs;
use App\Models\Banner;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class BannerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('แบนเนอร์')
                    ->schema([
                        Select::make('placement')
                            ->label('ตำแหน่ง')
                            ->options(Banner::placements())
                            ->required(),
                        FileUpload::make('image')->label('รูป')->image()->directory('banners')->disk('public')->required(),
                        TextInput::make('button_url')->label('ลิงก์ปุ่ม')->url(),
                        TextInput::make('sort')->label('ลำดับ')->numeric()->default(0),
                        Toggle::make('is_active')->label('แสดงผล')->default(true),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('ข้อความ', function (string $locale) {
                    return [
                        TextInput::make("title.{$locale}")->label('หัวข้อ')->required($locale === 'th'),
                        TextInput::make("subtitle.{$locale}")->label('คำบรรยาย'),
                        TextInput::make("button_text.{$locale}")->label('ข้อความปุ่ม'),
                    ];
                }),
            ]);
    }
}
