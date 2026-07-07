import { apiFetch } from "@/lib/api/client";
import type { PaymentMethod, PaymentMethodType } from "@/lib/payment/api";

export type AdminPaymentMethodPayload = {
  name: string;
  type: PaymentMethodType;
  description?: string | null;
  instructions?: string | null;
  config?: Record<string, unknown> | null;
  channel: "online" | "pos" | "both";
  sort_order: number;
  is_active: boolean;
};

export async function fetchAdminPaymentMethods(token: string) {
  return apiFetch<{ data: PaymentMethod[] }>("/admin/payment-methods", { token });
}

export async function createAdminPaymentMethod(token: string, payload: AdminPaymentMethodPayload) {
  return apiFetch<{ data: PaymentMethod }>("/admin/payment-methods", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPaymentMethod(
  token: string,
  id: number,
  payload: Partial<AdminPaymentMethodPayload>,
) {
  return apiFetch<{ data: PaymentMethod }>(`/admin/payment-methods/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPaymentMethod(token: string, id: number) {
  return apiFetch<{ message: string }>(`/admin/payment-methods/${id}`, {
    method: "DELETE",
    token,
  });
}
