import { apiFetch } from "@/lib/api/client";

export type ShippingMethod = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_order: number;
  free_shipping_min: number | null;
  sort_order: number;
  is_active: boolean;
  fee: number;
  is_free: boolean;
};

export async function fetchShippingMethods(subtotal: number) {
  return apiFetch<{ data: ShippingMethod[] }>(`/shipping/methods?subtotal=${subtotal}`);
}

export function formatShippingMethodLabel(method: ShippingMethod) {
  if (method.is_free) {
    return `${method.name} — ฟรี`;
  }

  return `${method.name} — ฿${method.fee.toLocaleString("th-TH")}`;
}
