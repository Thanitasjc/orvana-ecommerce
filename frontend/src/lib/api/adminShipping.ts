import { apiFetch } from "@/lib/api/client";
import type { ShippingMethod } from "@/lib/shipping/api";

export type AdminShippingMethodPayload = {
  name: string;
  description?: string | null;
  price: number;
  min_order: number;
  free_shipping_min?: number | null;
  sort_order: number;
  is_active: boolean;
};

export async function fetchAdminShippingMethods(token: string) {
  return apiFetch<{ data: ShippingMethod[] }>("/admin/shipping-methods", { token });
}

export async function createAdminShippingMethod(token: string, payload: AdminShippingMethodPayload) {
  return apiFetch<{ data: ShippingMethod }>("/admin/shipping-methods", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminShippingMethod(
  token: string,
  id: number,
  payload: Partial<AdminShippingMethodPayload>,
) {
  return apiFetch<{ data: ShippingMethod }>(`/admin/shipping-methods/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminShippingMethod(token: string, id: number) {
  return apiFetch<{ message: string }>(`/admin/shipping-methods/${id}`, {
    method: "DELETE",
    token,
  });
}
