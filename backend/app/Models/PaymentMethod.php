<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'instructions',
        'config',
        'channel',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereRaw('is_active IS TRUE');
    }

    public function isGateway(): bool
    {
        return in_array($this->type, ['omise_card', 'omise_promptpay'], true);
    }

    public function requiresSlip(): bool
    {
        return $this->type === 'bank_transfer';
    }

    public function isPosCash(): bool
    {
        return $this->type === 'pos_cash';
    }
}
