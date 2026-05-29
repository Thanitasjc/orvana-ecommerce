<?php

namespace Modules\Frontend\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\Ecommerce\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    public function add(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $product = Product::query()
            ->where('is_active', true)
            ->findOrFail($validated['product_id']);

        $cart = $this->cartService->getOrCreate($request);
        $quantity = (int) ($validated['quantity'] ?? 1);

        $this->cartService->addItem($cart, $product, $quantity);

        return back()->with('success', 'Added to cart.');
    }

    public function update(Request $request, CartItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = $this->cartService->getOrCreate($request);
        abort_unless($item->cart_id === $cart->id, 403);

        $this->cartService->updateQuantity($item, (int) $validated['quantity']);

        return back()->with('success', 'Cart updated.');
    }

    public function destroy(Request $request, CartItem $item): RedirectResponse
    {
        $cart = $this->cartService->getOrCreate($request);
        abort_unless($item->cart_id === $cart->id, 403);

        $this->cartService->removeItem($item);

        return back()->with('success', 'Item removed.');
    }
}

