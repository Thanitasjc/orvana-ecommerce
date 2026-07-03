import { apiDownload, apiFetch } from "@/lib/api/client";
import type { Order } from "@/lib/orders/types";

type UpdateOrderPayload = {
  status?: string;
  payment_status?: string;
};

export async function updateAdminOrder(orderId: number, payload: UpdateOrderPayload, token: string) {
  return apiFetch<{ data: Order }>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function exportAdminOrders(channel: "all" | "online" | "pos", token: string) {
  const params = new URLSearchParams();
  if (channel !== "all") {
    params.set("channel", channel);
  }

  const query = params.toString();
  const path = query ? `/admin/orders/export?${query}` : "/admin/orders/export";
  const filename = `orders-${channel}-${new Date().toISOString().slice(0, 10)}.csv`;

  await apiDownload(path, filename, token);
}
