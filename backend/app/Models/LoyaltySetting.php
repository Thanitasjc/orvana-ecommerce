<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    protected $fillable = [
        'enabled',
        'baht_per_point',
        'min_spend',
        'gold_threshold',
        'platinum_threshold',
        'redeem_enabled',
        'redeem_points_per_baht',
        'min_redeem_points',
        'max_redeem_percent',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'redeem_enabled' => 'boolean',
        ];
    }
}
