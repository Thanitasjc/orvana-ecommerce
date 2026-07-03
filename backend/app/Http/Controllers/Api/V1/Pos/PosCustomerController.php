<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PosCustomerController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2'],
        ]);

        $term = $validated['q'];

        $customers = Customer::query()
            ->where(function ($query) use ($term) {
                $query->where('phone', 'like', "%{$term}%")
                    ->orWhere('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'phone', 'email', 'points', 'tier']);

        return response()->json(['data' => $customers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255', 'unique:customers,email'],
        ]);

        $email = $validated['email'] ?? $this->generatePosEmail($validated['phone']);

        $customer = Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $email,
            'password' => Str::password(12),
            'points' => 0,
            'tier' => 'Silver',
        ]);

        return response()->json([
            'data' => $customer->only(['id', 'name', 'phone', 'email', 'points', 'tier']),
        ], 201);
    }

    private function generatePosEmail(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?: Str::random(8);
        $base = "pos.{$digits}";

        do {
            $email = "{$base}.".Str::lower(Str::random(4))."@aesthete.local";
        } while (Customer::where('email', $email)->exists());

        return $email;
    }
}
