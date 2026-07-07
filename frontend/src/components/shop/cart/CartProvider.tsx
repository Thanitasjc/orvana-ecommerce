"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { buildCheckoutItems } from "@/lib/api/checkout";
import { validateCouponCode, type ValidatedCoupon } from "@/lib/api/coupons";
import { fetchShippingMethods, type ShippingMethod } from "@/lib/shipping/api";
import type { CouponDiscountType } from "@/lib/coupons/constants";

export type CartItem = {
  id: number;
  variationId?: number;
  title: string;
  href: string;
  image: string;
  price: number;
  quantity: number;
};

export type AppliedCoupon = {
  code: string;
  name: string;
  type: CouponDiscountType;
  value: number;
  discount: number;
  shipping_discount: number;
  free_shipping: boolean;
};

function toAppliedCoupon(data: ValidatedCoupon): AppliedCoupon {
  return {
    code: data.code,
    name: data.name,
    type: data.type,
    value: data.value,
    discount: data.discount,
    shipping_discount: data.shipping_discount,
    free_shipping: data.free_shipping,
  };
}

type CartContextValue = {
  items: CartItem[];
  setItems: Dispatch<SetStateAction<CartItem[]>>;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  subtotal: number;
  cartCount: number;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  couponLoading: boolean;
  shippingMethods: ShippingMethod[];
  shippingLoading: boolean;
  selectedShippingMethodId: number | null;
  setSelectedShippingMethodId: (id: number) => void;
  shippingFee: number;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
};

const CART_STORAGE_KEY = "aesthete_shop_cart";
const COUPON_STORAGE_KEY = "aesthete_shop_coupon";

const defaultItems: CartItem[] = [];

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(defaultItems);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);

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
    try {
      const raw = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AppliedCoupon;
      if (parsed?.code) {
        setAppliedCoupon(parsed);
      }
    } catch {
      // Ignore malformed localStorage content.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingMethodId) ?? null,
    [shippingMethods, selectedShippingMethodId],
  );
  const shippingFee = selectedShippingMethod?.fee ?? 0;

  useEffect(() => {
    if (subtotal <= 0) {
      setShippingMethods([]);
      setSelectedShippingMethodId(null);
      return;
    }

    let cancelled = false;
    setShippingLoading(true);

    void fetchShippingMethods(subtotal)
      .then((response) => {
        if (cancelled) return;
        const methods = response.data ?? [];
        setShippingMethods(methods);
        setSelectedShippingMethodId((current) => {
          if (current && methods.some((method) => method.id === current)) {
            return current;
          }
          return methods[0]?.id ?? null;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setShippingMethods([]);
          setSelectedShippingMethodId(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setShippingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setCouponError("กรุณาระบุรหัสคูปอง");
        return;
      }

      if (items.length === 0) {
        setCouponError("ตะกร้าว่าง — ไม่สามารถใช้คูปองได้");
        return;
      }

      setCouponLoading(true);
      setCouponError(null);

      try {
        const checkoutItems = await buildCheckoutItems(items);
        const response = await validateCouponCode(trimmed, "online", checkoutItems, { shippingFee });
        setAppliedCoupon(toAppliedCoupon(response.data));
      } catch (err: unknown) {
        setAppliedCoupon(null);
        if (err && typeof err === "object") {
          const apiError = err as { message?: string; errors?: Record<string, string[]> };
          const fieldError = apiError.errors?.coupon_code?.[0] ?? apiError.errors?.code?.[0];
          setCouponError(fieldError ?? apiError.message ?? "คูปองไม่ถูกต้อง");
        } else {
          setCouponError("คูปองไม่ถูกต้อง");
        }
      } finally {
        setCouponLoading(false);
      }
    },
    [items, shippingFee],
  );

  useEffect(() => {
    if (!appliedCoupon || items.length === 0) {
      if (items.length === 0 && appliedCoupon) {
        removeCoupon();
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const checkoutItems = await buildCheckoutItems(items);
        const response = await validateCouponCode(appliedCoupon.code, "online", checkoutItems, { shippingFee });
        if (cancelled) return;
        setAppliedCoupon(toAppliedCoupon(response.data));
        setCouponError(null);
      } catch {
        if (!cancelled) {
          removeCoupon();
          setCouponError("คูปองไม่สามารถใช้กับตะกร้าปัจจุบันได้");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, appliedCoupon?.code, removeCoupon, shippingFee]);

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
      appliedCoupon,
      couponError,
      couponLoading,
      shippingMethods,
      shippingLoading,
      selectedShippingMethodId,
      setSelectedShippingMethodId,
      shippingFee,
      applyCoupon,
      removeCoupon,
    }),
    [
      appliedCoupon,
      applyCoupon,
      cartCount,
      couponError,
      couponLoading,
      items,
      removeCoupon,
      selectedShippingMethodId,
      shippingFee,
      shippingLoading,
      shippingMethods,
      subtotal,
    ],
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
