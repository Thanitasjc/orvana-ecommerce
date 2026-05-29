<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\Ecommerce\CartService;
use App\Services\Ecommerce\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly CheckoutService $checkoutService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'shipping_method' => ['required', 'in:standard,express'],
            'payment_method' => ['required', 'in:cod,bank_transfer'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $cart = $this->cartService->getOrCreate($request);

        try {
            $order = $this->checkoutService->placeOrder($cart, $validated);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['checkout' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('frontend.account.orders.show', $order)
            ->with('success', "Order {$order->order_number} placed successfully.");
    }
}

