<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AccountOrderController extends Controller
{
    public function index(Request $request): View
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.product:id,image,slug'])
            ->latest('id')
            ->paginate(10);

        return view('frontend::pages.account-orders', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): View
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items.product:id,image,slug', 'payments']);

        return view('frontend::pages.account-order-show', [
            'order' => $order,
        ]);
    }
}

