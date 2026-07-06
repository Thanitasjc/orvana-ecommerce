export type CouponDiscountType = "percent" | "fixed" | "free_shipping" | "bogo" | "tier";
export type CouponApplyTo = "order" | "category" | "product";
export type CouponCustomerRule = "all" | "new_member" | "returning";
export type CouponChannel = "online" | "pos" | "both";

export type CouponTierRule = {
  min_spend: number;
  discount_type: "percent" | "fixed";
  value: number;
};

export type CouponBogoRule = {
  buy_qty: number;
  get_qty: number;
  mode: "same_product" | "cheapest" | "product";
  product_id?: number;
  get_product_id?: number;
};

export type CouponRules = {
  tiers?: CouponTierRule[];
  bogo?: CouponBogoRule;
  category_ids?: number[];
  product_ids?: number[];
  free_shipping_min?: number;
  max_discount?: number;
};

export const COUPON_TYPE_OPTIONS: { value: CouponDiscountType; label: string; hint: string }[] = [
  { value: "percent", label: "ส่วนลด %", hint: "ลดทั้งออเดอร์หรือเฉพาะส cope ตามเงื่อนไข" },
  { value: "fixed", label: "ส่วนลดจำนวนเงิน", hint: "เช่น ซื้อครบ 2,000 ลด 200 บาท" },
  { value: "free_shipping", label: "ส่งฟรี", hint: "ยกเว้นค่าจัดส่งเมื่อครบเงื่อนไข" },
  { value: "bogo", label: "ซื้อ X แถม Y (BOGO)", hint: "ซื้อ 1 แถม 1, ซื้อ 2 แถม 1, ซื้อ A ลด B" },
  { value: "tier", label: "ส่วนลดตามยอด (Tier)", hint: "ยอดสูงขึ้น ส่วนลดมากขึ้น" },
];

export const APPLY_TO_OPTIONS: { value: CouponApplyTo; label: string }[] = [
  { value: "order", label: "ทั้งออเดอร์" },
  { value: "category", label: "เฉพาะหมวดหมู่" },
  { value: "product", label: "เฉพาะสินค้า" },
];

export const CUSTOMER_RULE_OPTIONS: { value: CouponCustomerRule; label: string }[] = [
  { value: "all", label: "ลูกค้าทุกคน" },
  { value: "new_member", label: "สมาชิกใหม่ (ยังไม่เคยสั่ง)" },
  { value: "returning", label: "ลูกค้าเก่า (เคยสั่งแล้ว)" },
];

export const CHANNEL_OPTIONS: { value: CouponChannel; label: string }[] = [
  { value: "both", label: "ออนไลน์ + หน้าร้าน" },
  { value: "online", label: "ออนไลน์เท่านั้น" },
  { value: "pos", label: "หน้าร้าน (POS) เท่านั้น" },
];

export function formatCouponTypeLabel(type: CouponDiscountType) {
  return COUPON_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function formatCouponSummary(coupon: {
  type: CouponDiscountType;
  value: number;
  min_order: number;
  apply_to?: CouponApplyTo;
  rules?: CouponRules | null;
}): string {
  const min = coupon.min_order > 0 ? ` (ขั้นต่ำ ฿${coupon.min_order.toLocaleString("th-TH")})` : "";

  switch (coupon.type) {
    case "percent": {
      const cap = coupon.rules?.max_discount;
      const capText = cap && cap > 0 ? ` สูงสุด ฿${cap.toLocaleString("th-TH")}` : "";
      return `ลด ${coupon.value}%${capText}${min}`;
    }
    case "fixed":
      return `ลด ฿${coupon.value.toLocaleString("th-TH")}${min}`;
    case "free_shipping": {
      const shipMin = coupon.rules?.free_shipping_min ?? coupon.min_order;
      return shipMin > 0 ? `ส่งฟรีเมื่อครบ ฿${shipMin.toLocaleString("th-TH")}` : "ส่งฟรี";
    }
    case "bogo": {
      const bogo = coupon.rules?.bogo;
      if (!bogo) return "BOGO";
      if (bogo.mode === "product") return `ซื้อสินค้า #${bogo.product_id} แถม #${bogo.get_product_id}`;
      return `ซื้อ ${bogo.buy_qty} แถม ${bogo.get_qty}`;
    }
    case "tier":
      return `ส่วนลดตามยอด (${coupon.rules?.tiers?.length ?? 0} ขั้น)${min}`;
    default:
      return coupon.type;
  }
}
