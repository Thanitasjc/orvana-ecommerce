<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if ($data['email_is_verified'] ?? false) {
            $data['email_verified_at'] = now();
        }

        unset($data['email_is_verified'], $data['password_confirmation']);

        return $data;
    }
}
