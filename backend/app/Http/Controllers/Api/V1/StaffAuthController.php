<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StaffAuthController extends Controller
{
    public function posLogin(Request $request): JsonResponse
    {
        $user = $this->authenticateStaff($request, [User::ROLE_CASHIER, User::ROLE_ADMIN]);

        return $this->tokenResponse($user, 'pos');
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $user = $this->authenticateStaff($request, [User::ROLE_ADMIN]);

        return $this->tokenResponse($user, 'admin');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * @param  array<int, string>  $allowedRoles
     */
    private function authenticateStaff(Request $request, array $allowedRoles): User
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['อีเมลหรือรหัสผ่านไม่ถูกต้อง'],
            ]);
        }

        if (! in_array($user->role, $allowedRoles, true)) {
            throw ValidationException::withMessages([
                'email' => ['บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบนี้'],
            ]);
        }

        return $user;
    }

    private function tokenResponse(User $user, string $scope): JsonResponse
    {
        $token = $user->createToken($scope)->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ]);
    }
}
