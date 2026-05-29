<?php

namespace App\Filament\Resources\Services\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลบริการ')
                    ->schema([
                        TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                        FileUpload::make('image')->label('รูป')->image()->directory('services')->disk('public'),
                        TextInput::make('icon')->label('Icon class'),
                        TextInput::make('sort')->label('ลำดับ')->numeric()->default(0),
                        Toggle::make('is_active')->label('แสดงผล')->default(true),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('เนื้อหา', function (string $locale) {
                    return [
                        TextInput::make("name.{$locale}")->label('ชื่อบริการ')->required($locale === 'th'),
                        TextInput::make("short_description.{$locale}")->label('คำโปรย'),
                        RichEditor::make("description.{$locale}")->label('รายละเอียด')->columnSpanFull(),
                    ];
                }),
            ]);
    }
}
