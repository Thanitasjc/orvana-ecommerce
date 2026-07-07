<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPointTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberLoyaltyController extends Controller
{
    public function transactions(Request $request): JsonResponse
    {
        $transactions = LoyaltyPointTransaction::query()
            ->where('customer_id', $request->user()->id)
            ->with('order:id,order_number')
            ->latest()
            ->paginate(15);

        return response()->json($transactions);
    }
}
