<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OmiseService
{
    private const API_BASE = 'https://api.omise.co';

    public function isConfigured(): bool
    {
        return filled($this->secretKey());
    }

    public function publicKey(): ?string
    {
        return config('services.omise.public_key');
    }

    /**
     * @return array<string, mixed>
     */
    public function chargeCard(Order $order, string $omiseToken): array
    {
        $this->ensureConfigured();

        $response = $this->request('POST', '/charges', [
            'amount' => (int) round($order->total * 100),
            'currency' => 'thb',
            'card' => $omiseToken,
            'description' => "Order {$order->order_number}",
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        return $this->normalizeCharge($response);
    }

    /**
     * @return array<string, mixed>
     */
    public function createPromptPaySource(Order $order): array
    {
        $this->ensureConfigured();

        $source = $this->request('POST', '/sources', [
            'amount' => (int) round($order->total * 100),
            'currency' => 'thb',
            'type' => 'promptpay',
        ]);

        $charge = $this->request('POST', '/charges', [
            'amount' => (int) round($order->total * 100),
            'currency' => 'thb',
            'source' => $source['id'],
            'description' => "Order {$order->order_number}",
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        return $this->normalizeCharge($charge, $source);
    }

    /**
     * @return array<string, mixed>
     */
    public function retrieveCharge(string $chargeId): array
    {
        $this->ensureConfigured();

        return $this->normalizeCharge($this->request('GET', "/charges/{$chargeId}"));
    }

    public function applyChargeToOrder(Order $order, array $charge): Order
    {
        $paid = ($charge['status'] ?? '') === 'successful';
        $pending = in_array($charge['status'] ?? '', ['pending', 'processing'], true);
        $isPos = str_contains((string) $order->channel, 'POS');

        $metadata = array_merge($order->payment_metadata ?? [], [
            'omise' => [
                'charge_id' => $charge['id'] ?? null,
                'status' => $charge['status'] ?? null,
                'failure_code' => $charge['failure_code'] ?? null,
                'failure_message' => $charge['failure_message'] ?? null,
            ],
        ]);

        $order->update([
            'omise_charge_id' => $charge['id'] ?? $order->omise_charge_id,
            'payment_metadata' => $metadata,
            'payment_status' => $paid ? 'paid' : ($pending ? 'pending' : 'pending'),
            'status' => $paid ? ($isPos ? 'completed' : 'processing') : 'pending',
        ]);

        if ($paid && $order->customer_id) {
            app(LoyaltyService::class)->finalizePayment($order->fresh());
        }

        return $order->fresh()->load(['items', 'customer', 'paymentMethod']);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function request(string $method, string $path, array $payload = []): array
    {
        $request = Http::withBasicAuth($this->secretKey(), '')
            ->acceptJson()
            ->asForm();

        $response = $method === 'GET'
            ? $request->get(self::API_BASE.$path)
            : $request->post(self::API_BASE.$path, $payload);

        if (! $response->successful()) {
            Log::warning('Omise API error', [
                'path' => $path,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            $message = $response->json('message') ?? 'การชำระเงินไม่สำเร็จ';

            throw ValidationException::withMessages([
                'payment' => [$message],
            ]);
        }

        return $response->json();
    }

    /**
     * @param  array<string, mixed>  $charge
     * @param  array<string, mixed>|null  $source
     * @return array<string, mixed>
     */
    private function normalizeCharge(array $charge, ?array $source = null): array
    {
        $qrImage = $source['scannable_code']['image']['download_uri']
            ?? $charge['source']['scannable_code']['image']['download_uri']
            ?? null;

        return [
            'id' => $charge['id'] ?? null,
            'status' => $charge['status'] ?? null,
            'amount' => $charge['amount'] ?? null,
            'paid' => (bool) ($charge['paid'] ?? false),
            'authorize_uri' => $charge['authorize_uri'] ?? null,
            'qr_image_url' => $qrImage,
            'failure_code' => $charge['failure_code'] ?? null,
            'failure_message' => $charge['failure_message'] ?? null,
        ];
    }

    private function secretKey(): ?string
    {
        return config('services.omise.secret_key');
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw ValidationException::withMessages([
                'payment' => ['ระบบชำระเงิน Omise ยังไม่ได้ตั้งค่า (OMISE_PUBLIC_KEY / OMISE_SECRET_KEY)'],
            ]);
        }
    }
}
