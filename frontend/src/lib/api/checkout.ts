import type { CartItem } from "@/components/shop/cart/CartProvider";
import { apiFetch } from "@/lib/api/client";

type ProductVariation = { id: number };
type ProductDetail = { variations?: ProductVariation[] | null };

function slugFromHref(href: string): string | null {
  const match = href.match(/\/products\/([^/?#]+)/);
  return match?.[1] ?? null;
}

async function resolveVariationId(item: CartItem): Promise<number | null> {
  if (item.variationId) return item.variationId;

  const slug = slugFromHref(item.href);
  if (!slug) return null;

  try {
    const res = await apiFetch<{ data: ProductDetail }>(`/products/${slug}`);
    return res.data.variations?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function buildCheckoutItems(items: CartItem[]) {
  const resolved = await Promise.all(
    items.map(async (item) => ({
      item,
      variationId: await resolveVariationId(item),
    })),
  );

  const missing = resolved.filter((entry) => !entry.variationId).map((entry) => entry.item.title);
  if (missing.length > 0) {
    throw new Error(`ไม่พบ SKU สำหรับ: ${missing.join(", ")}`);
  }

  return resolved.map((entry) => ({
    variation_id: entry.variationId as number,
    quantity: entry.item.quantity,
  }));
}

export type CheckoutOrder = {
  id: number;
  order_number: string;
  total: number;
  channel: string;
  status: string;
};

export async function submitMemberCheckout(
  items: CartItem[],
  paymentMethod: string,
  token: string,
  couponCode?: string | null,
  pointsToRedeem?: number,
) {
  const payload: Record<string, unknown> = {
    items: await buildCheckoutItems(items),
    payment_method: paymentMethod,
  };

  if (couponCode) {
    payload.coupon_code = couponCode;
  }

  if (pointsToRedeem && pointsToRedeem > 0) {
    payload.points_to_redeem = pointsToRedeem;
  }

  return apiFetch<{ data: CheckoutOrder }>("/member/checkout", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
