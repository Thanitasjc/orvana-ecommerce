import { apiDownload, apiFetch } from "@/lib/api/client";

export type AdminDashboard = {
  orders_today: number;
  online_orders_today: number;
  pos_orders_today: number;
  revenue_today: number;
  profit_today: number;
  products_count: number;
  low_stock_count: number;
  customers_count: number;
  recent_customers: AdminCustomer[];
};

export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  points: number;
  tier: string | null;
  total_spent?: number;
  created_at?: string;
};

type CustomersResponse = {
  data: AdminCustomer[];
  current_page: number;
  last_page: number;
  total: number;
};

export type AdminCustomerPayload = {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  points?: number;
  tier?: string;
};

export async function fetchAdminDashboard(token: string) {
  return apiFetch<{ data: AdminDashboard }>("/admin/dashboard", { token });
}

export async function fetchAdminCustomers(
  token: string,
  params?: { search?: string; tier?: string; page?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.tier) query.set("tier", params.tier);
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<CustomersResponse>(`/admin/customers${suffix}`, { token });
}

export async function createAdminCustomer(payload: AdminCustomerPayload, token: string) {
  return apiFetch<{ data: AdminCustomer }>("/admin/customers", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCustomer(
  customerId: number,
  payload: Partial<AdminCustomerPayload>,
  token: string,
) {
  return apiFetch<{ data: AdminCustomer }>(`/admin/customers/${customerId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCustomer(customerId: number, token: string) {
  return apiFetch<{ message: string }>(`/admin/customers/${customerId}`, {
    method: "DELETE",
    token,
  });
}

export async function exportAdminOrders(channel: "all" | "online" | "pos", token: string) {
  const params = new URLSearchParams();
  if (channel !== "all") params.set("channel", channel);

  const query = params.toString();
  const path = query ? `/admin/orders/export?${query}` : "/admin/orders/export";
  const filename = `orders-${channel}-${new Date().toISOString().slice(0, 10)}.csv`;

  await apiDownload(path, filename, token);
}
