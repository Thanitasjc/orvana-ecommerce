"use client";

import { useMemo, useState } from "react";
import type { PosProduct, PosVariation } from "@/lib/api/pos";
import { calculateTotalsWithDiscount } from "@/lib/pricing/vat";

export type PosCartItem = {
  variationId: number;
  productId: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  maxStock: number;
};

export function getProductTotalStock(product: PosProduct) {
  return product.variations.reduce((sum, variation) => sum + variation.stock, 0);
}

export function findFirstInStockVariation(product: PosProduct) {
  return product.variations.find((variation) => variation.stock > 0) ?? null;
}

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const totals = useMemo(() => calculateTotalsWithDiscount(subtotal, discount), [subtotal, discount]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function addVariation(product: PosProduct, variation: PosVariation) {
    if (variation.stock <= 0) return false;

    setItems((current) => {
      const existing = current.find((item) => item.variationId === variation.id);
      if (existing) {
        if (existing.quantity >= variation.stock) return current;
        return current.map((item) =>
          item.variationId === variation.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...current,
        {
          variationId: variation.id,
          productId: product.id,
          name: product.name,
          color: variation.color,
          size: variation.size,
          price: product.price,
          quantity: 1,
          maxStock: variation.stock,
        },
      ];
    });

    return true;
  }

  function addFromProduct(product: PosProduct) {
    const variation = findFirstInStockVariation(product);
    if (!variation) return false;
    return addVariation(product, variation);
  }

  function updateQuantity(variationId: number, nextQuantity: number) {
    setItems((current) =>
      current
        .map((item) => {
          if (item.variationId !== variationId) return item;
          const quantity = Math.min(Math.max(1, nextQuantity), item.maxStock);
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(variationId: number) {
    setItems((current) => current.filter((item) => item.variationId !== variationId));
  }

  function clearCart() {
    setItems([]);
    setDiscount(0);
  }

  return {
    items,
    discount,
    setDiscount,
    subtotal,
    totals,
    total: totals.total,
    amountBeforeVat: totals.amountBeforeVat,
    vatAmount: totals.vatAmount,
    itemCount,
    addFromProduct,
    addVariation,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
