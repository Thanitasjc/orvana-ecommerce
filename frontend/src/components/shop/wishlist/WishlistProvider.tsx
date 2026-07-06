"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type WishlistItem = {
  id: number;
  title: string;
  href: string;
  image: string;
  price: number;
  quantity: number;
};

type WishlistContextValue = {
  items: WishlistItem[];
  wishlistCount: number;
  addItem: (item: Omit<WishlistItem, "quantity"> & { quantity?: number }) => boolean;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearItems: () => void;
};

const WISHLIST_STORAGE_KEY = "aesthete_shop_wishlist";

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WishlistItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // Ignore malformed localStorage content.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      wishlistCount: items.length,
      addItem: (item) => {
        let added = false;
        setItems((prev) => {
          if (prev.some((existing) => existing.id === item.id)) {
            return prev;
          }
          added = true;
          return [...prev, { ...item, quantity: item.quantity ?? 1 }];
        });
        return added;
      },
      removeItem: (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      updateQuantity: (id: number, quantity: number) => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
        );
      },
      clearItems: () => setItems([]),
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
