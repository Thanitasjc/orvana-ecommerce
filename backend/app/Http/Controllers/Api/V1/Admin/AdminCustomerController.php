<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCustomerController extends Controller
{
    public function __construct(private readonly LoyaltyService $loyalty) {}

    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->latest();

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($builder) use ($term) {
                $builder->where('name', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        if ($request->filled('tier')) {
            $query->where('tier', $request->string('tier'));
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:8'],
            'points' => ['nullable', 'integer', 'min:0'],
            'tier' => ['nullable', 'string', Rule::in(['Silver', 'Gold', 'Platinum'])],
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'] ?? Str::password(12),
            'points' => $validated['points'] ?? 0,
            'tier' => $validated['tier'] ?? 'Silver',
        ]);

        return response()->json(['data' => $this->formatCustomer($customer)], 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customer->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:8'],
            'points' => ['sometimes', 'integer', 'min:0'],
            'tier' => ['sometimes', 'string', Rule::in(['Silver', 'Gold', 'Platinum'])],
        ]);

        if (array_key_exists('password', $validated) && blank($validated['password'])) {
            unset($validated['password']);
        }

        if (array_key_exists('points', $validated)) {
            $newPoints = (int) $validated['points'];
            $delta = $newPoints - $customer->points;
            if ($delta !== 0) {
                $this->loyalty->logAdjustment($customer, $delta, 'ปรับแต้มโดย Admin');
            }
            unset($validated['points']);
        }

        $customer->update($validated);

        return response()->json(['data' => $this->formatCustomer($customer->fresh())]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(['message' => 'ลบสมาชิกแล้ว']);
    }

    private function formatCustomer(Customer $customer): array
    {
        return $customer->only([
            'id',
            'name',
            'email',
            'phone',
            'points',
            'tier',
            'total_spent',
            'created_at',
        ]);
    }
}
