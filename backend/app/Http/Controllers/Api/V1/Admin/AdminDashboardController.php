<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $todayOrders = Order::whereDate('created_at', today())->get();
        $onlineChannel = 'Online Store';
        $posChannel = 'POS (หน้าร้าน)';

        $recentCustomers = Customer::query()
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'phone', 'tier', 'points', 'created_at']);

        return response()->json([
            'data' => [
                'orders_today' => $todayOrders->count(),
                'online_orders_today' => $todayOrders->where('channel', $onlineChannel)->count(),
                'pos_orders_today' => $todayOrders->where('channel', $posChannel)->count(),
                'revenue_today' => $todayOrders->sum('total'),
                'profit_today' => $todayOrders->sum('profit'),
                'products_count' => Product::count(),
                'low_stock_count' => Product::whereHas('variations', fn ($q) => $q->where('stock', '<', 5))->count(),
                'customers_count' => Customer::count(),
                'recent_customers' => $recentCustomers,
            ],
        ]);
    }
}
