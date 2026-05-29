<?php

namespace App\Services\Ecommerce;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

class CartService
{
    public function getOrCreate(Request $request): Cart
    {
        $user = $request->user();
        $sessionId = $request->session()->getId();

        if ($user) {
            $cart = Cart::query()->firstOrCreate(
                ['user_id' => $user->getAuthIdentifier()],
                ['session_id' => $sessionId]
            );

            $this->mergeGuestCart($user, $sessionId, $cart);

            return $cart->load(['items.product']);
        }

        return Cart::query()->firstOrCreate(
            ['session_id' => $sessionId, 'user_id' => null]
        )->load(['items.product']);
    }

    public function addItem(Cart $cart, Product $product, int $quantity = 1): CartItem
    {
        $quantity = max(1, $quantity);

        $item = CartItem::query()->firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
        ]);

        $item->unit_price = $this->productPrice($product);
        $item->quantity = ($item->exists ? $item->quantity : 0) + $quantity;
        $item->save();

        return $item;
    }

    public function updateQuantity(CartItem $item, int $quantity): void
    {
        if ($quantity <= 0) {
            $item->delete();

            return;
        }

        $item->quantity = $quantity;
        $item->save();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function subtotal(Cart $cart): float
    {
        return (float) $cart->items->sum(fn (CartItem $item): float => $item->line_total);
    }

    public function totalItems(Cart $cart): int
    {
        return (int) $cart->items->sum('quantity');
    }

    private function productPrice(Product $product): float
    {
        return (float) ($product->sale_price ?? $product->price);
    }

    private function mergeGuestCart(Authenticatable $user, string $sessionId, Cart $userCart): void
    {
        $guestCart = Cart::query()
            ->whereNull('user_id')
            ->where('session_id', $sessionId)
            ->where('id', '!=', $userCart->id)
            ->with('items.product')
            ->first();

        if (! $guestCart) {
            return;
        }

        foreach ($guestCart->items as $item) {
            $this->addItem($userCart, $item->product, $item->quantity);
        }

        $guestCart->delete();
    }
}

