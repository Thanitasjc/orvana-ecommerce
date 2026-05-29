<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'currency',
        'shipping_method',
        'shipping_carrier',
        'tracking_number',
        'shipping_amount',
        'discount_amount',
        'subtotal_amount',
        'total_amount',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_country',
        'shipping_state',
        'shipping_city',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_postal_code',
        'note',
        'status_note',
        'placed_at',
        'shipped_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'shipping_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'subtotal_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'placed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}

