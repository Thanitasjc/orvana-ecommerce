<?php

namespace App\Filament\Resources\Categories\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลทั่วไป')
                    ->schema([
                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        FileUpload::make('image')
                            ->label('รูปภาพ')
                            ->image()
                            ->directory('categories')
                            ->disk('public'),
                        TextInput::make('sort')
                            ->label('ลำดับ')
                            ->numeric()
                            ->default(0),
                        Toggle::make('is_active')
                            ->label('แสดงผล')
                            ->default(true),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('ชื่อและรายละเอียด', function (string $locale) {
                    return [
                        TextInput::make("name.{$locale}")
                            ->label('ชื่อหมวดหมู่')
                            ->required($locale === 'th')
                            ->maxLength(255),
                        TextInput::make("description.{$locale}")
                            ->label('คำอธิบาย')
                            ->maxLength(500),
                    ];
                }),
            ]);
    }
}
