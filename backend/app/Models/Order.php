<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'channel',
        'customer_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'shipping_address',
        'shipping_province',
        'shipping_postcode',
        'shipping_notes',
        'shipping_method_id',
        'shipping_method_name',
        'staff_id',
        'coupon_id',
        'coupon_code',
        'discount',
        'points_redeemed',
        'points_discount',
        'points_earned',
        'loyalty_reversed_at',
        'stock_restored_at',
        'shipping_fee',
        'shipping_discount',
        'total',
        'profit',
        'payment_method',
        'payment_method_id',
        'payment_slip_path',
        'omise_charge_id',
        'payment_metadata',
        'status',
        'payment_status',
    ];

    protected $appends = [
        'payment_slip_url',
    ];

    protected function casts(): array
    {
        return [
            'loyalty_reversed_at' => 'datetime',
            'stock_restored_at' => 'datetime',
            'payment_metadata' => 'array',
        ];
    }

    public function getPaymentSlipUrlAttribute(): ?string
    {
        if (! $this->payment_slip_path) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->payment_slip_path);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
