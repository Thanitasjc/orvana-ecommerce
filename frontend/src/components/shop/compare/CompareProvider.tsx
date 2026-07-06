"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CompareItem = {
  id: number;
  title: string;
  href: string;
  image: string;
  price: number;
  oldPrice?: number;
  description?: string;
  rating?: number;
};

type CompareContextValue = {
  items: CompareItem[];
  compareCount: number;
  addItem: (item: CompareItem) => boolean;
  removeItem: (id: number) => void;
  clearItems: () => void;
  isFull: boolean;
};

const COMPARE_STORAGE_KEY = "aesthete_shop_compare";
export const MAX_COMPARE_ITEMS = 4;

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CompareItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed.slice(0, MAX_COMPARE_ITEMS));
      }
    } catch {
      // Ignore malformed localStorage content.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CompareContextValue>(
    () => ({
      items,
      compareCount: items.length,
      isFull: items.length >= MAX_COMPARE_ITEMS,
      addItem: (item: CompareItem) => {
        let added = false;
        setItems((prev) => {
          if (prev.some((existing) => existing.id === item.id)) {
            return prev;
          }
          if (prev.length >= MAX_COMPARE_ITEMS) {
            return prev;
          }
          added = true;
          return [...prev, item];
        });
        return added;
      },
      removeItem: (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      clearItems: () => setItems([]),
    }),
    [items],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}

export function parseDisplayPrice(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}
