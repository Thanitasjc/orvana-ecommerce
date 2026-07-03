"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type CartItem = {
  id: number;
  variationId?: number;
  title: string;
  href: string;
  image: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  setItems: Dispatch<SetStateAction<CartItem[]>>;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  subtotal: number;
  cartCount: number;
};

const CART_STORAGE_KEY = "aesthete_shop_cart";

const defaultItems: CartItem[] = [];

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(defaultItems);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // Ignore malformed localStorage content.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      setItems,
      addItem: (item: CartItem) => {
        setItems((prev) => {
          const existing = prev.find((it) => it.id === item.id);
          if (!existing) return [...prev, item];
          return prev.map((it) =>
            it.id === item.id ? { ...it, quantity: it.quantity + Math.max(1, item.quantity) } : it,
          );
        });
      },
      removeItem: (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      updateQuantity: (id: number, quantity: number) => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
        );
      },
      subtotal,
      cartCount,
    }),
    [cartCount, items, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
