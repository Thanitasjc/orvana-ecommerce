import { apiFetch } from "@/lib/api/client";
import type { CouponApplyTo, CouponDiscountType } from "@/lib/coupons/constants";

export type CouponValidateItem = {
  variation_id: number;
  quantity: number;
};

export type PublicCoupon = {
  code: string;
  name: string;
  description?: string | null;
  type: CouponDiscountType;
  apply_to?: CouponApplyTo;
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  channel: "online" | "pos" | "both";
  customer_rule?: string;
};

export type ValidatedCoupon = {
  code: string;
  name: string;
  description?: string | null;
  type: CouponDiscountType;
  apply_to?: CouponApplyTo;
  value: number;
  discount: number;
  shipping_discount: number;
  free_shipping: boolean;
  subtotal: number;
  applicable_subtotal: number;
};

export async function fetchPublicCoupons() {
  return apiFetch<{ data: PublicCoupon[] }>("/coupons");
}

export async function validateCouponCode(
  code: string,
  channel: "online" | "pos",
  items: CouponValidateItem[],
  options?: { customerId?: number; shippingFee?: number; posSessionId?: string },
) {
  return apiFetch<{ data: ValidatedCoupon }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({
      code,
      channel,
      items,
      customer_id: options?.customerId,
      shipping_fee: options?.shippingFee ?? 0,
      pos_session_id: options?.posSessionId,
    }),
  });
}
