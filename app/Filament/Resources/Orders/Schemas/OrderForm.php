<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Filament\Support\OrderStatus;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลออเดอร์')
                    ->schema([
                        TextInput::make('order_number')->label('เลขออเดอร์')->disabled(),
                        Select::make('status')
                            ->label('สถานะ')
                            ->options(OrderStatus::options())
                            ->required(),
                        TextInput::make('customer_name')->label('ชื่อลูกค้า')->disabled(),
                        TextInput::make('customer_email')->label('อีเมล')->disabled(),
                        TextInput::make('customer_phone')->label('เบอร์โทร')->disabled(),
                        TextInput::make('shipping_method')->label('วิธีจัดส่ง')->disabled(),
                        TextInput::make('shipping_carrier')->label('ผู้ให้บริการขนส่ง'),
                        TextInput::make('tracking_number')->label('Tracking Number'),
                        TextInput::make('shipping_amount')->label('ค่าส่ง')->numeric()->disabled(),
                        TextInput::make('subtotal_amount')->label('ยอดสินค้า')->numeric()->disabled(),
                        TextInput::make('total_amount')->label('ยอดรวม')->numeric()->disabled(),
                        TextInput::make('shipping_country')->label('ประเทศ')->disabled(),
                        TextInput::make('shipping_state')->label('รัฐ/จังหวัด')->disabled(),
                        TextInput::make('shipping_city')->label('เมือง')->disabled(),
                        TextInput::make('shipping_address_line1')->label('ที่อยู่ 1')->disabled(),
                        TextInput::make('shipping_address_line2')->label('ที่อยู่ 2')->disabled(),
                        TextInput::make('shipping_postal_code')->label('รหัสไปรษณีย์')->disabled(),
                        Textarea::make('note')->label('โน้ต')->disabled(),
                        Textarea::make('status_note')->label('หมายเหตุสถานะ'),
                    ])
                    ->columns(2),
            ]);
    }
}

