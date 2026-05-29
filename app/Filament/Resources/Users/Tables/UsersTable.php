<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('ชื่อ')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->label('อีเมล')
                    ->searchable()
                    ->sortable(),
                IconColumn::make('email_verified_at')
                    ->label('ยืนยันอีเมล')
                    ->boolean()
                    ->getStateUsing(fn ($record): bool => $record->hasVerifiedEmail()),
                IconColumn::make('is_admin')
                    ->label('Admin')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label('สร้างเมื่อ')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->label('อัปเดต')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                TernaryFilter::make('is_admin')->label('ผู้ดูแลระบบ'),
                TernaryFilter::make('email_verified_at')
                    ->label('ยืนยันอีเมลแล้ว')
                    ->nullable(),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }
}
