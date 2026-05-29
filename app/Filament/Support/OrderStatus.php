<?php

namespace App\Filament\Support;

class OrderStatus
{
    /** @return array<string, string> */
    public static function options(): array
    {
        return [
            'pending' => 'รอชำระเงิน',
            'paid' => 'ชำระเงินแล้ว',
            'processing' => 'กำลังจัดเตรียม',
            'shipped' => 'จัดส่งแล้ว',
            'completed' => 'สำเร็จ',
            'cancelled' => 'ยกเลิกแล้ว',
        ];
    }

    public static function label(string $status): string
    {
        return self::options()[$status] ?? $status;
    }
}
