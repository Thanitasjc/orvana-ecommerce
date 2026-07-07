<?php

namespace App\Services;

use App\Models\PaymentMethod;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class PaymentMethodService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listForCheckout(string $channel = 'online'): Collection
    {
        return PaymentMethod::query()
            ->active()
            ->where(function ($query) use ($channel) {
                $query->where('channel', $channel)
                    ->orWhere('channel', 'both');
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (PaymentMethod $method) => $this->formatMethod($method))
            ->values();
    }

    public function resolveForCheckout(int $paymentMethodId, string $channel = 'online'): PaymentMethod
    {
        $method = PaymentMethod::query()
            ->active()
            ->where(function ($query) use ($channel) {
                $query->where('channel', $channel)
                    ->orWhere('channel', 'both');
            })
            ->find($paymentMethodId);

        if (! $method) {
            throw ValidationException::withMessages([
                'payment_method_id' => ['วิธีชำระเงินไม่ถูกต้องหรือปิดใช้งานแล้ว'],
            ]);
        }

        return $method;
    }

    /**
     * @return array{status: string, payment_status: string}
     */
    public function initialOrderStatuses(PaymentMethod $method, string $channel): array
    {
        if (! str_contains($channel, 'Online')) {
            return ['status' => 'completed', 'payment_status' => 'paid'];
        }

        if ($method->isGateway()) {
            return ['status' => 'pending', 'payment_status' => 'pending'];
        }

        return ['status' => 'pending', 'payment_status' => 'pending'];
    }

    /**
     * @return array<string, mixed>
     */
    public function formatMethod(PaymentMethod $method, bool $includeSecrets = false): array
    {
        $config = $method->config ?? [];

        return [
            'id' => $method->id,
            'name' => $method->name,
            'type' => $method->type,
            'description' => $method->description,
            'instructions' => $method->instructions,
            'config' => $config,
            'channel' => $method->channel,
            'sort_order' => $method->sort_order,
            'is_active' => $method->is_active,
            'requires_slip' => $method->requiresSlip(),
            'is_gateway' => $method->isGateway(),
            'omise_enabled' => $method->isGateway() && $this->omiseConfigured(),
        ];
    }

    public function omiseConfigured(): bool
    {
        return filled(config('services.omise.secret_key'));
    }
}
