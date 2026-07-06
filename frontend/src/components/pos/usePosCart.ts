"use client";

import { useCallback, useMemo, useState } from "react";
import type { PosProduct, PosVariation } from "@/lib/api/pos";
import { validateCouponCode } from "@/lib/api/coupons";
import { getPosSessionId } from "@/lib/pos/session";
import { calculateTotalsWithDiscount } from "@/lib/pricing/vat";

export type PosCouponApplyOptions = {
  customerId?: number;
  posSessionId?: string;
};

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

export type PosAppliedCoupon = {
  code: string;
  name: string;
  discount: number;
};

export function getProductTotalStock(product: PosProduct) {
  return product.variations.reduce((sum, variation) => sum + variation.stock, 0);
}

export function findFirstInStockVariation(product: PosProduct) {
  return product.variations.find((variation) => variation.stock > 0) ?? null;
}

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<PosAppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = appliedCoupon?.discount ?? manualDiscount;

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
    setManualDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
  }

  function setDiscount(value: number) {
    setManualDiscount(Math.max(0, value));
    setAppliedCoupon(null);
    setCouponError(null);
  }

  const applyCoupon = useCallback(
    async (code: string, options?: PosCouponApplyOptions) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setCouponError("กรุณาระบุรหัสคูปอง");
        return false;
      }

      if (items.length === 0) {
        setCouponError("ตะกร้าว่าง — ไม่สามารถใช้คูปองได้");
        return false;
      }

      setCouponLoading(true);
      setCouponError(null);

      try {
        const response = await validateCouponCode(
          trimmed,
          "pos",
          items.map((item) => ({ variation_id: item.variationId, quantity: item.quantity })),
          {
            customerId: options?.customerId,
            posSessionId: options?.posSessionId ?? getPosSessionId(),
          },
        );
        const data = response.data;
        setAppliedCoupon({
          code: data.code,
          name: data.name,
          discount: data.discount,
        });
        setManualDiscount(0);
        return true;
      } catch (err: unknown) {
        setAppliedCoupon(null);
        if (err && typeof err === "object") {
          const apiError = err as { message?: string; errors?: Record<string, string[]> };
          const fieldError = apiError.errors?.coupon_code?.[0] ?? apiError.errors?.code?.[0];
          setCouponError(fieldError ?? apiError.message ?? "คูปองไม่ถูกต้อง");
        } else {
          setCouponError("คูปองไม่ถูกต้อง");
        }
        return false;
      } finally {
        setCouponLoading(false);
      }
    },
    [items],
  );

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
  }

  return {
    items,
    discount,
    manualDiscount,
    appliedCoupon,
    couponError,
    couponLoading,
    setDiscount,
    applyCoupon,
    removeCoupon,
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
