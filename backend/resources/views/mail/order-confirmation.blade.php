<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ยืนยันคำสั่งซื้อ {{ $order->order_number }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                    <td style="padding:24px 28px;background:#111827;color:#ffffff;">
                        <h1 style="margin:0;font-size:22px;">ขอบคุณสำหรับคำสั่งซื้อ</h1>
                        <p style="margin:8px 0 0;font-size:14px;color:#d1d5db;">เลขที่ออเดอร์: <strong>{{ $order->order_number }}</strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 28px;">
                        <p style="margin:0 0 16px;font-size:15px;">สวัสดีคุณ {{ $customer->name }},</p>
                        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">
                            เราได้รับคำสั่งซื้อของคุณแล้ว รายละเอียดด้านล่างนี้
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                            <tr style="background:#f9fafb;">
                                <th align="left" style="padding:10px 12px;font-size:13px;">สินค้า</th>
                                <th align="center" style="padding:10px 12px;font-size:13px;">จำนวน</th>
                                <th align="right" style="padding:10px 12px;font-size:13px;">ราคา</th>
                            </tr>
                            @foreach ($order->items as $item)
                                <tr>
                                    <td style="padding:10px 12px;font-size:13px;border-top:1px solid #e5e7eb;">
                                        {{ $item->product_name }}
                                        @if ($item->color || $item->size)
                                            <br><span style="color:#6b7280;font-size:12px;">{{ trim(($item->color ?? '').' / '.($item->size ?? ''), ' /') }}</span>
                                        @endif
                                    </td>
                                    <td align="center" style="padding:10px 12px;font-size:13px;border-top:1px solid #e5e7eb;">{{ $item->quantity }}</td>
                                    <td align="right" style="padding:10px 12px;font-size:13px;border-top:1px solid #e5e7eb;">฿{{ number_format($item->price * $item->quantity) }}</td>
                                </tr>
                            @endforeach
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                            @if ((int) $order->discount > 0)
                                <tr>
                                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">ส่วนลดคูปอง</td>
                                    <td align="right" style="padding:4px 0;font-size:14px;color:#dc2626;">-฿{{ number_format((int) $order->discount) }}</td>
                                </tr>
                            @endif
                            @if ((int) $order->points_discount > 0)
                                <tr>
                                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">ส่วนลดแต้ม ({{ (int) $order->points_redeemed }} แต้ม)</td>
                                    <td align="right" style="padding:4px 0;font-size:14px;color:#dc2626;">-฿{{ number_format((int) $order->points_discount) }}</td>
                                </tr>
                            @endif
                            @if ((int) $order->shipping_fee > 0)
                                <tr>
                                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">ค่าจัดส่ง</td>
                                    <td align="right" style="padding:4px 0;font-size:14px;">฿{{ number_format((int) $order->shipping_fee) }}</td>
                                </tr>
                            @endif
                            <tr>
                                <td style="padding:8px 0 4px;font-size:16px;font-weight:bold;">ยอดรวม</td>
                                <td align="right" style="padding:8px 0 4px;font-size:16px;font-weight:bold;">฿{{ number_format((int) $order->total) }}</td>
                            </tr>
                        </table>

                        @if ((int) $order->points_earned > 0)
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;margin-bottom:20px;">
                                <tr>
                                    <td style="padding:16px 18px;">
                                        <p style="margin:0 0 6px;font-size:15px;font-weight:bold;color:#047857;">แต้มสะสมจากออเดอร์นี้</p>
                                        <p style="margin:0;font-size:22px;font-weight:bold;color:#059669;">+{{ (int) $order->points_earned }} แต้ม</p>
                                        <p style="margin:8px 0 0;font-size:13px;color:#065f46;">
                                            คงเหลือทั้งหมด {{ (int) $customer->points }} แต้ม · ระดับ {{ $customer->tier }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        @endif

                        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                            ดูรายละเอียดออเดอร์ได้ที่บัญชีสมาชิกของคุณ
                            @if ($frontendUrl = config('app.frontend_url'))
                                <br><a href="{{ rtrim($frontendUrl, '/') }}/account" style="color:#2563eb;">เปิดบัญชีสมาชิก</a>
                            @endif
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
