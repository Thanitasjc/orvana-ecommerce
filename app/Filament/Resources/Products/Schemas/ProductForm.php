<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Filament\Support\TranslatableTabs;
use App\Models\Category;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลสินค้า')
                    ->schema([
                        Select::make('category_id')
                            ->label('หมวดหมู่')
                            ->options(fn () => Category::query()->get()->mapWithKeys(
                                fn (Category $c) => [$c->id => $c->getTranslation('name', 'th')]
                            ))
                            ->searchable()
                            ->preload(),
                        TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                        TextInput::make('sku')->label('SKU'),
                        TextInput::make('price')->label('ราคา')->numeric()->required()->prefix('฿'),
                        TextInput::make('sale_price')->label('ราคาลด')->numeric()->prefix('฿'),
                        TextInput::make('stock_quantity')->label('สต็อกคงเหลือ')->numeric()->default(0)->required(),
                        FileUpload::make('image')->label('รูปหลัก')->image()->directory('products')->disk('public'),
                        FileUpload::make('gallery')
                            ->label('รูปแกลเลอรี่ (หน้ารายละเอียด)')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->directory('products/gallery')
                            ->disk('public')
                            ->helperText('แสดงในหน้ารายละเอียดสินค้า ถ้าไม่ใส่จะใช้รูปหลักอย่างเดียว'),
                        TextInput::make('sort')->label('ลำดับ')->numeric()->default(0),
                        Toggle::make('is_active')->label('แสดงผล')->default(true),
                        Toggle::make('is_featured')
                            ->label('สินค้าแนะนำ')
                            ->helperText('ถ้าเปิด จะแสดงก่อนสินค้าอื่นในหน้าแรก')
                            ->default(false),
                    ])
                    ->columns(2),
                ...TranslatableTabs::make('เนื้อหา', function (string $locale) {
                    return [
                        TextInput::make("name.{$locale}")->label('ชื่อสินค้า')->required($locale === 'th'),
                        TextInput::make("short_description.{$locale}")->label('คำโปรย (หน้ารายละเอียด)'),
                        ...(TranslatableTabs::richEditor('description', 'รายละเอียด (แท็บ Description)')($locale)),
                    ];
                }),
            ]);
    }
}
