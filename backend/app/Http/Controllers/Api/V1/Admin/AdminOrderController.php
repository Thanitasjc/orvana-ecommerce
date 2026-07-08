<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InventoryService;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminOrderController extends Controller
{
    public function __construct(
        private readonly LoyaltyService $loyalty,
        private readonly InventoryService $inventory,
    ) {}
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->filteredQuery($request)->paginate(15));
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'data' => $order->load([
                'items',
                'customer:id,name,email,phone',
                'paymentMethod',
            ]),
        ]);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,cancelled,on_hold',
            'payment_status' => 'sometimes|in:pending,paid,refunded',
        ]);

        $shouldReverse = (
            isset($validated['status'])
            && $validated['status'] === 'cancelled'
            && $order->status !== 'cancelled'
        ) || (
            isset($validated['payment_status'])
            && $validated['payment_status'] === 'refunded'
            && $order->payment_status !== 'refunded'
        );

        DB::transaction(function () use ($order, $validated, $shouldReverse) {
            if ($shouldReverse) {
                $this->loyalty->reverseOrder($order);
                $this->inventory->restoreFromOrder($order->fresh(['items']));
            }

            $wasPending = $order->payment_status === 'pending';
            $order->update($validated);

            if (
                $wasPending
                && ($validated['payment_status'] ?? null) === 'paid'
                && $order->customer_id
            ) {
                $this->loyalty->finalizePayment($order->fresh());
            }
        });

        return response()->json([
            'data' => $order->fresh()->load([
                'items',
                'customer:id,name,email,phone',
            ]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $orders = $this->filteredQuery($request)->get();
        $filename = 'orders-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Order Number',
                'Date',
                'Channel',
                'Customer',
                'Email',
                'Phone',
                'Products',
                'Status',
                'Payment Status',
                'Payment Method',
                'Total',
            ]);

            foreach ($orders as $order) {
                $items = $order->items
                    ->map(fn ($item) => $item->product_name.' x'.$item->quantity)
                    ->implode('; ');

                fputcsv($handle, [
                    $order->order_number,
                    $order->created_at?->format('Y-m-d H:i:s'),
                    $order->channel,
                    $order->customer?->name ?? 'Walk-in',
                    $order->customer?->email ?? '',
                    $order->customer?->phone ?? '',
                    $items,
                    $order->status,
                    $order->payment_status,
                    $order->payment_method ?? '',
                    $order->total,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function filteredQuery(Request $request)
    {
        $query = Order::query()
            ->with([
                'items',
                'customer:id,name,email,phone',
            ])
            ->latest();

        $channel = $request->query('channel');

        if ($channel === 'online') {
            $query->where('channel', 'Online Store');
        } elseif ($channel === 'pos') {
            $query->where('channel', 'POS (หน้าร้าน)');
        }

        return $query;
    }
}
