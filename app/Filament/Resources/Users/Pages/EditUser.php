<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Validation\ValidationException;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['email_is_verified'] = $this->record->hasVerifiedEmail();
        $data['password'] = null;
        $data['password_confirmation'] = null;

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['email_verified_at'] = ($data['email_is_verified'] ?? false)
            ? ($this->record->email_verified_at ?? now())
            : null;

        unset($data['email_is_verified'], $data['password_confirmation']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        return $data;
    }

    protected function beforeSave(): void
    {
        $wasAdmin = (bool) $this->record->is_admin;
        $willBeAdmin = (bool) ($this->data['is_admin'] ?? false);

        if ($wasAdmin && ! $willBeAdmin && User::query()->where('is_admin', true)->count() <= 1) {
            throw ValidationException::withMessages([
                'is_admin' => 'ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน',
            ]);
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->label('ลบ')
                ->visible(fn (): bool => ! $this->record->is(auth()->user()))
                ->before(function (DeleteAction $action): void {
                    if ($this->record->is_admin && User::query()->where('is_admin', true)->count() <= 1) {
                        Notification::make()
                            ->danger()
                            ->title('ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้')
                            ->send();

                        $action->halt();
                    }
                }),
        ];
    }
}
