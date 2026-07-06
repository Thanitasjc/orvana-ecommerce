<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCouponController extends Controller
{
    public function __construct(private readonly CouponService $coupons) {}

    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query()->orderByDesc('created_at');

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('code', 'like', "%{$term}%")
                    ->orWhere('name', 'like', "%{$term}%");
            });
        }

        return response()->json($query->paginate(15)->through(fn (Coupon $coupon) => $this->formatCoupon($coupon)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateCoupon($request);

        $coupon = Coupon::create($this->payloadFromValidated($validated));

        return response()->json(['data' => $this->formatCoupon($coupon)], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $this->validateCoupon($request, $coupon);

        $updates = collect($this->payloadFromValidated($validated))
            ->except(['code'])
            ->merge(
                array_key_exists('code', $validated) && filled($validated['code'])
                    ? ['code' => strtoupper(trim($validated['code']))]
                    : [],
            )
            ->filter(fn ($value) => $value !== null)
            ->all();

        if ($updates !== []) {
            $coupon->update($updates);
        }

        return response()->json(['data' => $this->formatCoupon($coupon->fresh())]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        if ($coupon->orders()->exists()) {
            return response()->json([
                'message' => 'ไม่สามารถลบคูปองที่ถูกใช้งานแล้วได้',
            ], 422);
        }

        $coupon->delete();

        return response()->json(['message' => 'ลบคูปองแล้ว']);
    }

    public function reportSummary(): JsonResponse
    {
        return response()->json(['data' => $this->coupons->reportSummary()]);
    }

    public function usages(Request $request, Coupon $coupon): JsonResponse
    {
        $logs = CouponUsage::query()
            ->with(['customer:id,name,email', 'order:id,order_number,total'])
            ->where('coupon_id', $coupon->id)
            ->latest()
            ->paginate(20);

        return response()->json($logs);
    }

    public function codes(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='.urlencode($coupon->code),
                'barcode_url' => 'https://bwipjs-api.metafloor.com/?bcid=code128&text='.urlencode($coupon->code).'&scale=3&height=12',
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateCoupon(Request $request, ?Coupon $coupon = null): array
    {
        $codeRules = ['string', 'max:50', 'regex:/^[A-Za-z0-9_-]+$/'];
        $codeField = $coupon
            ? ['sometimes', ...$codeRules, Rule::unique('coupons', 'code')->ignore($coupon->id)]
            : ['required', ...$codeRules, Rule::unique('coupons', 'code')];

        return $request->validate([
            'code' => $codeField,
            'name' => [$coupon ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => [$coupon ? 'sometimes' : 'required', Rule::in(['fixed', 'percent', 'free_shipping', 'bogo', 'tier'])],
            'apply_to' => ['nullable', Rule::in(['order', 'category', 'product'])],
            'customer_rule' => ['nullable', Rule::in(['all', 'new_member', 'returning'])],
            'value' => ['nullable', 'integer', 'min:0'],
            'min_order' => ['nullable', 'integer', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'rules' => ['nullable', 'array'],
            'rules.max_discount' => ['nullable', 'integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['nullable', 'boolean'],
            'channel' => ['nullable', Rule::in(['online', 'pos', 'both'])],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function payloadFromValidated(array $validated): array
    {
        return [
            'code' => strtoupper(trim($validated['code'])),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'apply_to' => $validated['apply_to'] ?? 'order',
            'customer_rule' => $validated['customer_rule'] ?? 'all',
            'value' => $validated['value'] ?? 0,
            'min_order' => $validated['min_order'] ?? 0,
            'max_uses' => $validated['max_uses'] ?? null,
            'per_user_limit' => $validated['per_user_limit'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'channel' => $validated['channel'] ?? 'both',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCoupon(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'name' => $coupon->name,
            'description' => $coupon->description,
            'type' => $coupon->type,
            'apply_to' => $coupon->apply_to ?? 'order',
            'customer_rule' => $coupon->customer_rule ?? 'all',
            'value' => $coupon->value,
            'min_order' => $coupon->min_order,
            'max_uses' => $coupon->max_uses,
            'per_user_limit' => $coupon->per_user_limit,
            'rules' => $coupon->rules,
            'used_count' => $coupon->used_count,
            'starts_at' => $coupon->starts_at?->toIso8601String(),
            'ends_at' => $coupon->ends_at?->toIso8601String(),
            'is_active' => $coupon->is_active,
            'channel' => $coupon->channel,
            'created_at' => $coupon->created_at?->toIso8601String(),
            'updated_at' => $coupon->updated_at?->toIso8601String(),
        ];
    }
}
