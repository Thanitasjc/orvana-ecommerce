<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Ecommerce\OrderInventoryService;
use App\Services\Ecommerce\OrderNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private readonly OrderNotificationService $notificationService,
        private readonly OrderInventoryService $inventoryService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->isSignatureValid($request)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $validated = $request->validate([
            'reference' => ['required', 'string'],
            'status' => ['required', 'in:paid,failed,pending'],
            'provider' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ]);

        $payment = Payment::query()
            ->where('reference', $validated['reference'])
            ->latest('id')
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->status = $validated['status'];
        $payment->provider = $validated['provider'] ?? $payment->provider;
        $payment->meta = array_merge($payment->meta ?? [], $validated['meta'] ?? []);
        $payment->paid_at = $validated['status'] === 'paid' ? now() : $payment->paid_at;
        $payment->save();

        $order = $payment->order;
        $oldStatus = (string) ($order?->status ?? 'pending');
        if ($order) {
            if ($validated['status'] === 'paid') {
                $order->status = 'paid';
            } elseif ($validated['status'] === 'failed') {
                $order->status = 'cancelled';
            } else {
                $order->status = 'pending';
            }
            $order->save();

            if ($oldStatus !== $order->status) {
                $this->inventoryService->handleStatusChange($order, $oldStatus, (string) $order->status);
                $this->notificationService->notifyStatusChanged($order, $oldStatus);
            }
        }

        return response()->json([
            'message' => 'Webhook processed',
            'order_status' => $order?->status,
            'payment_status' => $payment->status,
        ]);
    }

    private function isSignatureValid(Request $request): bool
    {
        $secret = (string) config('ecommerce.payment_webhook_secret');
        if ($secret === '') {
            return false;
        }

        $headerName = (string) config('ecommerce.payment_signature_header', 'X-Payment-Signature');
        $signature = (string) $request->header($headerName);
        if ($signature === '') {
            return false;
        }

        $payload = $request->getContent();
        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals(Str::lower($expected), Str::lower($signature));
    }
}

