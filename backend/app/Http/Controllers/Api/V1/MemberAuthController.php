<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MemberAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $customer = Customer::create($validated);
        $token = $customer->createToken('member')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->formatCustomer($customer),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $customer = Customer::where('email', $validated['email'])->first();

        if (! $customer || ! Hash::check($validated['password'], $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
            ]);
        }

        $token = $customer->createToken('member')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->formatCustomer($customer),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->formatCustomer($request->user()),
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:2048'],
        ]);

        /** @var Customer $customer */
        $customer = $request->user();

        if ($customer->avatar) {
            Storage::disk('public')->delete($customer->avatar);
        }

        $path = $validated['avatar']->store('avatars', 'public');
        $customer->update(['avatar' => $path]);

        return response()->json([
            'data' => $this->formatCustomer($customer->fresh()),
        ]);
    }

    private function formatCustomer(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'avatar' => $customer->avatar
                ? Storage::disk('public')->url($customer->avatar)
                : null,
            'points' => $customer->points,
            'tier' => $customer->tier,
            'total_spent' => $customer->total_spent,
        ];
    }
}
