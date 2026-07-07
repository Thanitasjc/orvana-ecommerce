<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(private readonly ShippingService $shipping) {}

    public function index(Request $request): JsonResponse
    {
        $subtotal = max(0, (int) $request->integer('subtotal', 0));

        return response()->json([
            'data' => $this->shipping->listForCheckout($subtotal),
        ]);
    }
}
