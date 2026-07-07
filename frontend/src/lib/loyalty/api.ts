import { apiFetch } from "@/lib/api/client";
import type { LoyaltyPreview, LoyaltySettings, LoyaltyTransaction } from "@/lib/loyalty/types";

export async function fetchLoyaltySettings() {
  return apiFetch<{ data: LoyaltySettings }>("/loyalty/settings");
}

export async function previewLoyalty(payload: {
  total: number;
  coupon_discount?: number;
  points_to_redeem?: number;
  customer_id?: number;
}) {
  return apiFetch<{ data: LoyaltyPreview }>("/loyalty/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

type PaginatedTransactions = {
  data: LoyaltyTransaction[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function fetchMemberLoyaltyTransactions(token: string, page = 1) {
  return apiFetch<PaginatedTransactions>(`/member/loyalty/transactions?page=${page}`, { token });
}

export async function fetchAdminLoyaltySettings(token: string) {
  return apiFetch<{ data: LoyaltySettings }>("/admin/loyalty", { token });
}

export async function updateAdminLoyaltySettings(token: string, payload: Partial<LoyaltySettings>) {
  return apiFetch<{ data: LoyaltySettings }>("/admin/loyalty", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminCustomerLoyaltyTransactions(
  customerId: number,
  token: string,
  page = 1,
) {
  return apiFetch<PaginatedTransactions>(
    `/admin/customers/${customerId}/loyalty-transactions?page=${page}`,
    { token },
  );
}
