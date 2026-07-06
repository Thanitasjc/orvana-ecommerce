<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ProductVariation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CouponService
{
    public function __construct(private readonly OrderService $orders) {}

    /**
     * @param  array<int, array{variation_id: int, quantity: int}>  $items
     * @return array{
     *   coupon: Coupon,
     *   discount: int,
     *   shipping_discount: int,
     *   free_shipping: bool,
     *   subtotal: int,
     *   applicable_subtotal: int
     * }
     */
    public function validate(
        string $code,
        array $items,
        string $salesChannel,
        ?Customer $customer = null,
        int $shippingFee = 0,
        ?string $posSessionId = null,
    ): array {
        $coupon = $this->findCoupon($code);
        $this->assertCouponUsable($coupon, $salesChannel);
        $this->assertCustomerEligible($coupon, $customer, $salesChannel, $posSessionId);

        $context = $this->buildContext($items);
        $applicableSubtotal = $this->resolveApplicableSubtotal($coupon, $context['line_items']);

        if ($applicableSubtotal <= 0 && $coupon->type !== 'free_shipping') {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ไม่สามารถใช้กับสินค้าในตะกร้าได้'],
            ]);
        }

        $spendBase = $coupon->apply_to === 'order' ? $context['total'] : $applicableSubtotal;

        if ($spendBase < $coupon->min_order) {
            throw ValidationException::withMessages([
                'coupon_code' => ["ยอดสั่งซื้อขั้นต่ำ ฿".number_format($coupon->min_order).' สำหรับคูปองนี้'],
            ]);
        }

        $result = $this->calculateBenefit($coupon, $context, $applicableSubtotal, $shippingFee);

        if ($result['discount'] <= 0 && $result['shipping_discount'] <= 0) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ไม่สามารถใช้กับออเดอร์นี้ได้'],
            ]);
        }

        return [
            'coupon' => $coupon,
            'discount' => $result['discount'],
            'shipping_discount' => $result['shipping_discount'],
            'free_shipping' => $result['free_shipping'],
            'subtotal' => $context['total'],
            'applicable_subtotal' => $applicableSubtotal,
        ];
    }

    public function logUsage(
        Coupon $coupon,
        Order $order,
        ?Customer $customer,
        string $channel,
        int $discount,
        int $shippingDiscount,
        int $orderSubtotal,
        array $metadata = [],
    ): CouponUsage {
        return DB::transaction(function () use ($coupon, $order, $customer, $channel, $discount, $shippingDiscount, $orderSubtotal, $metadata) {
            $coupon->increment('used_count');

            return CouponUsage::create([
                'coupon_id' => $coupon->id,
                'order_id' => $order->id,
                'customer_id' => $customer?->id,
                'channel' => $channel,
                'discount_amount' => $discount,
                'shipping_discount' => $shippingDiscount,
                'order_subtotal' => $orderSubtotal,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function reportSummary(): array
    {
        return Coupon::query()
            ->withCount('usages')
            ->withSum('usages as total_discount', 'discount_amount')
            ->withSum('usages as total_shipping_saved', 'shipping_discount')
            ->orderByDesc('used_count')
            ->get()
            ->map(fn (Coupon $coupon) => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type,
                'used_count' => $coupon->used_count,
                'max_uses' => $coupon->max_uses,
                'usage_logs' => $coupon->usages_count,
                'total_discount' => (int) ($coupon->total_discount ?? 0),
                'total_shipping_saved' => (int) ($coupon->total_shipping_saved ?? 0),
                'is_active' => $coupon->is_active,
            ])
            ->all();
    }

    private function findCoupon(string $code): Coupon
    {
        $normalizedCode = strtoupper(trim($code));
        if ($normalizedCode === '') {
            throw ValidationException::withMessages([
                'coupon_code' => ['กรุณาระบุรหัสคูปอง'],
            ]);
        }

        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [$normalizedCode])
            ->first();

        if (! $coupon) {
            throw ValidationException::withMessages([
                'coupon_code' => ['ไม่พบรหัสคูปองนี้'],
            ]);
        }

        return $coupon;
    }

    private function assertCouponUsable(Coupon $coupon, string $salesChannel): void
    {
        if (! $coupon->is_active) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ถูกปิดใช้งานแล้ว'],
            ]);
        }

        if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ยังไม่เริ่มใช้งาน'],
            ]);
        }

        if ($coupon->ends_at && now()->gt($coupon->ends_at)) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้หมดอายุแล้ว'],
            ]);
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ถูกใช้ครบจำนวนแล้ว'],
            ]);
        }

        $channel = $this->normalizeSalesChannel($salesChannel);
        if ($coupon->channel !== 'both' && $coupon->channel !== $channel) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ใช้ได้เฉพาะช่องทางที่กำหนด'],
            ]);
        }
    }

    private function assertCustomerEligible(
        Coupon $coupon,
        ?Customer $customer,
        string $salesChannel,
        ?string $posSessionId = null,
    ): void {
        if ($coupon->customer_rule === 'new_member') {
            if (! $customer) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['คูปองนี้สำหรับสมาชิกใหม่ — กรุณาเข้าสู่ระบบ'],
                ]);
            }

            $hasOrders = $customer->orders()->exists();
            if ($hasOrders) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['คูปองนี้ใช้ได้เฉพาะลูกค้าใหม่ที่ยังไม่เคยสั่งซื้อ'],
                ]);
            }
        }

        if ($coupon->customer_rule === 'returning') {
            if (! $customer) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['คูปองนี้สำหรับลูกค้าเก่า — กรุณาเข้าสู่ระบบ'],
                ]);
            }

            if (! $customer->orders()->exists()) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['คูปองนี้ใช้ได้เฉพาะลูกค้าที่เคยสั่งซื้อแล้ว'],
                ]);
            }
        }

        if ($coupon->per_user_limit === null) {
            return;
        }

        if ($customer) {
            $usedByCustomer = CouponUsage::query()
                ->where('coupon_id', $coupon->id)
                ->where('customer_id', $customer->id)
                ->count();

            if ($usedByCustomer >= $coupon->per_user_limit) {
                throw ValidationException::withMessages([
                    'coupon_code' => ['คุณใช้คูปองนี้ครบจำนวนที่กำหนดแล้ว'],
                ]);
            }

            return;
        }

        if ($this->normalizeSalesChannel($salesChannel) !== 'pos') {
            return;
        }

        $sessionId = trim((string) $posSessionId);
        if ($sessionId === '') {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองจำกัดจำนวนครั้ง — กรุณาเลือกสมาชิก หรือใช้เครื่อง POS เดิม'],
            ]);
        }

        $usedBySession = CouponUsage::query()
            ->where('coupon_id', $coupon->id)
            ->whereNull('customer_id')
            ->where('metadata->pos_session_id', $sessionId)
            ->count();

        if ($usedBySession >= $coupon->per_user_limit) {
            throw ValidationException::withMessages([
                'coupon_code' => ['คูปองนี้ถูกใช้ครบจำนวนที่กำหนดแล้ว (Walk-in) — กรุณาเลือกสมาชิก'],
            ]);
        }
    }

    /**
     * @param  array<int, array{variation_id: int, quantity: int}>  $items
     * @return array{total: int, line_items: array<int, array<string, mixed>>}
     */
    private function buildContext(array $items): array
    {
        $built = $this->orders->buildLineItems($items);
        $lineItems = [];

        foreach ($built['lineItems'] as $line) {
            $lineItems[] = [
                'product_id' => $line['product']->id,
                'category_id' => $line['product']->category_id,
                'product_name' => $line['product']->name,
                'price' => $line['price'],
                'quantity' => $line['quantity'],
                'subtotal' => $line['subtotal'],
            ];
        }

        return [
            'total' => $built['total'],
            'line_items' => $lineItems,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    private function resolveApplicableSubtotal(Coupon $coupon, array $lineItems): int
    {
        $rules = $coupon->rules ?? [];

        if ($coupon->apply_to === 'category') {
            $categoryIds = array_map('intval', $rules['category_ids'] ?? []);
            if ($categoryIds === []) {
                return 0;
            }

            return (int) collect($lineItems)
                ->filter(fn (array $line) => in_array((int) $line['category_id'], $categoryIds, true))
                ->sum('subtotal');
        }

        if ($coupon->apply_to === 'product') {
            $productIds = array_map('intval', $rules['product_ids'] ?? []);
            if ($productIds === []) {
                return 0;
            }

            return (int) collect($lineItems)
                ->filter(fn (array $line) => in_array((int) $line['product_id'], $productIds, true))
                ->sum('subtotal');
        }

        return (int) collect($lineItems)->sum('subtotal');
    }

    /**
     * @param  array{total: int, line_items: array<int, array<string, mixed>>}  $context
     * @return array{discount: int, shipping_discount: int, free_shipping: bool}
     */
    private function calculateBenefit(Coupon $coupon, array $context, int $applicableSubtotal, int $shippingFee): array
    {
        return match ($coupon->type) {
            'free_shipping' => $this->calculateFreeShipping($coupon, $context['total'], $shippingFee),
            'bogo' => [
                'discount' => $this->calculateBogoDiscount($coupon, $context['line_items']),
                'shipping_discount' => 0,
                'free_shipping' => false,
            ],
            'tier' => [
                'discount' => $this->calculateTierDiscount($coupon, $applicableSubtotal > 0 ? $applicableSubtotal : $context['total']),
                'shipping_discount' => 0,
                'free_shipping' => false,
            ],
            'percent' => [
                'discount' => $this->calculatePercentDiscount($coupon, $applicableSubtotal),
                'shipping_discount' => 0,
                'free_shipping' => false,
            ],
            default => [
                'discount' => $this->calculateFixedDiscount($coupon, $applicableSubtotal),
                'shipping_discount' => 0,
                'free_shipping' => false,
            ],
        };
    }

    private function calculatePercentDiscount(Coupon $coupon, int $base): int
    {
        if ($base <= 0) {
            return 0;
        }

        $percent = max(1, min(100, $coupon->value));
        $discount = (int) round($base * $percent / 100);

        $maxDiscount = (int) ($coupon->rules['max_discount'] ?? 0);
        if ($maxDiscount > 0) {
            $discount = min($discount, $maxDiscount);
        }

        return min($base, $discount);
    }

    private function calculateFixedDiscount(Coupon $coupon, int $base): int
    {
        if ($base <= 0) {
            return 0;
        }

        return min($base, max(0, $coupon->value));
    }

    /**
     * @return array{discount: int, shipping_discount: int, free_shipping: bool}
     */
    private function calculateFreeShipping(Coupon $coupon, int $orderTotal, int $shippingFee): array
    {
        $rules = $coupon->rules ?? [];
        $freeMin = (int) ($rules['free_shipping_min'] ?? $coupon->min_order);

        if ($freeMin > 0 && $orderTotal < $freeMin) {
            return ['discount' => 0, 'shipping_discount' => 0, 'free_shipping' => false];
        }

        return [
            'discount' => 0,
            'shipping_discount' => max(0, $shippingFee),
            'free_shipping' => true,
        ];
    }

    private function calculateTierDiscount(Coupon $coupon, int $base): int
    {
        $tiers = $coupon->rules['tiers'] ?? [];
        if ($base <= 0 || ! is_array($tiers) || $tiers === []) {
            return 0;
        }

        usort($tiers, fn (array $a, array $b) => ($b['min_spend'] ?? 0) <=> ($a['min_spend'] ?? 0));

        foreach ($tiers as $tier) {
            $minSpend = (int) ($tier['min_spend'] ?? 0);
            if ($base < $minSpend) {
                continue;
            }

            $tierType = $tier['discount_type'] ?? 'percent';
            $tierValue = (int) ($tier['value'] ?? 0);
            if ($tierValue <= 0) {
                continue;
            }

            if ($tierType === 'fixed') {
                return min($base, $tierValue);
            }

            $percent = max(1, min(100, $tierValue));

            return min($base, (int) round($base * $percent / 100));
        }

        return 0;
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    private function calculateBogoDiscount(Coupon $coupon, array $lineItems): int
    {
        $rules = $coupon->rules['bogo'] ?? [];
        $buyQty = max(1, (int) ($rules['buy_qty'] ?? 2));
        $getQty = max(1, (int) ($rules['get_qty'] ?? 1));
        $mode = $rules['mode'] ?? 'same_product';

        if ($mode === 'product') {
            return $this->calculateBuyAGetBDiscount($lineItems, $rules, $buyQty, $getQty);
        }

        $eligibleLines = $this->filterLinesForBogo($coupon, $lineItems);
        if ($eligibleLines === []) {
            return 0;
        }

        if ($mode === 'cheapest') {
            $units = [];
            foreach ($eligibleLines as $line) {
                for ($i = 0; $i < $line['quantity']; $i++) {
                    $units[] = (int) $line['price'];
                }
            }

            sort($units);
            $groupSize = $buyQty + $getQty;
            $discount = 0;
            $index = 0;
            while ($index + $groupSize <= count($units)) {
                for ($free = 0; $free < $getQty; $free++) {
                    $discount += $units[$index + $free] ?? 0;
                }
                $index += $groupSize;
            }

            return $discount;
        }

        $discount = 0;
        foreach ($eligibleLines as $line) {
            $freeUnits = intdiv((int) $line['quantity'], $buyQty) * $getQty;
            $discount += $freeUnits * (int) $line['price'];
        }

        return $discount;
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     * @param  array<string, mixed>  $rules
     */
    private function calculateBuyAGetBDiscount(array $lineItems, array $rules, int $buyQty, int $getQty): int
    {
        $buyProductId = (int) ($rules['product_id'] ?? 0);
        $getProductId = (int) ($rules['get_product_id'] ?? 0);
        if ($buyProductId <= 0 || $getProductId <= 0) {
            return 0;
        }

        $buyLine = collect($lineItems)->first(fn (array $line) => (int) $line['product_id'] === $buyProductId);
        $getLine = collect($lineItems)->first(fn (array $line) => (int) $line['product_id'] === $getProductId);
        if (! $buyLine || ! $getLine) {
            return 0;
        }

        $sets = intdiv((int) $buyLine['quantity'], $buyQty);
        $freeUnits = min($sets * $getQty, (int) $getLine['quantity']);

        return $freeUnits * (int) $getLine['price'];
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     * @return array<int, array<string, mixed>>
     */
    private function filterLinesForBogo(Coupon $coupon, array $lineItems): array
    {
        $rules = $coupon->rules ?? [];

        if ($coupon->apply_to === 'category') {
            $categoryIds = array_map('intval', $rules['category_ids'] ?? []);

            return collect($lineItems)
                ->filter(fn (array $line) => in_array((int) $line['category_id'], $categoryIds, true))
                ->values()
                ->all();
        }

        if ($coupon->apply_to === 'product') {
            $productIds = array_map('intval', $rules['product_ids'] ?? []);

            return collect($lineItems)
                ->filter(fn (array $line) => in_array((int) $line['product_id'], $productIds, true))
                ->values()
                ->all();
        }

        return $lineItems;
    }

    private function normalizeSalesChannel(string $salesChannel): string
    {
        return str_contains(mb_strtolower($salesChannel), 'pos') ? 'pos' : 'online';
    }
}
