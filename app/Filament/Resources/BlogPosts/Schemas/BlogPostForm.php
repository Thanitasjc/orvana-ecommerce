<?php

namespace App\Filament\Resources\BlogPosts\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class BlogPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลบทความ')
                    ->schema([
                        TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                        TextInput::make('author')->label('ผู้เขียน'),
                        FileUpload::make('image')->label('รูปปก')->image()->directory('blog')->disk('public'),
                        DateTimePicker::make('published_at')
                            ->label('วันที่เผยแพร่')
                            ->nullable()
                            ->default(null)
                            ->helperText('เว้นว่าง = แสดงทันทีเมื่อเปิด "เผยแพร่"'),
                        TextInput::make('sort')->label('ลำดับ')->numeric()->default(0),
                        Toggle::make('is_active')->label('เผยแพร่')->default(true),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('เนื้อหา', function (string $locale) {
                    return [
                        TextInput::make("title.{$locale}")->label('หัวข้อ')->required($locale === 'th'),
                        TextInput::make("excerpt.{$locale}")->label('คำโปรย'),
                        RichEditor::make("content.{$locale}")->label('เนื้อหา')->columnSpanFull(),
                    ];
                }),
            ]);
    }
}
