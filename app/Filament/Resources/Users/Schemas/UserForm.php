<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\User;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Validation\Rules\Password;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('ข้อมูลผู้ใช้')
                    ->schema([
                        TextInput::make('name')
                            ->label('ชื่อ')
                            ->required()
                            ->maxLength(150),
                        TextInput::make('email')
                            ->label('อีเมล')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('password')
                            ->label('รหัสผ่าน')
                            ->password()
                            ->revealable()
                            ->rule(Password::min(8))
                            ->confirmed()
                            ->dehydrated(fn (?string $state): bool => filled($state))
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->helperText(fn (string $operation): string => $operation === 'edit'
                                ? 'เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน'
                                : 'อย่างน้อย 8 ตัวอักษร'),
                        Toggle::make('email_is_verified')
                            ->label('ยืนยันอีเมลแล้ว')
                            ->default(true)
                            ->dehydrated(false),
                        Toggle::make('is_admin')
                            ->label('ผู้ดูแลระบบ (Admin)')
                            ->helperText('เปิดเพื่อให้เข้า Filament ที่ /admin ได้')
                            ->default(false)
                            ->disabled(fn (?User $record): bool => $record?->is(auth()->user()) === true
                                && $record->is_admin === true),
                    ])
                    ->columns(2),
            ]);
    }
}
