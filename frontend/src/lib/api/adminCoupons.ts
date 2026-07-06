import { apiFetch } from "@/lib/api/client";
import type {
  CouponApplyTo,
  CouponChannel,
  CouponCustomerRule,
  CouponDiscountType,
  CouponRules,
} from "@/lib/coupons/constants";

export type AdminCoupon = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: CouponDiscountType;
  apply_to: CouponApplyTo;
  customer_rule: CouponCustomerRule;
  value: number;
  min_order: number;
  max_uses: number | null;
  per_user_limit: number | null;
  rules?: CouponRules | null;
  used_count: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  channel: CouponChannel;
  created_at?: string;
  updated_at?: string;
};

export type AdminCouponPayload = {
  code: string;
  name: string;
  description?: string | null;
  type: CouponDiscountType;
  apply_to?: CouponApplyTo;
  customer_rule?: CouponCustomerRule;
  value?: number;
  min_order?: number;
  max_uses?: number | null;
  per_user_limit?: number | null;
  rules?: CouponRules | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  channel?: CouponChannel;
};

export type CouponReportRow = {
  id: number;
  code: string;
  name: string;
  type: CouponDiscountType;
  used_count: number;
  max_uses: number | null;
  usage_logs: number;
  total_discount: number;
  total_shipping_saved: number;
  is_active: boolean;
};

export type CouponUsageLog = {
  id: number;
  discount_amount: number;
  shipping_discount: number;
  order_subtotal: number;
  channel: string;
  created_at?: string;
  metadata?: { pos_session_id?: string; type?: string; apply_to?: string } | null;
  customer?: { id: number; name: string; email: string } | null;
  order?: { id: number; order_number: string; total: number } | null;
};

type PaginatedCoupons = {
  data: AdminCoupon[];
  current_page: number;
  last_page: number;
  total: number;
};

type PaginatedUsages = {
  data: CouponUsageLog[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function fetchAdminCoupons(
  token: string,
  params?: { search?: string; page?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiFetch<PaginatedCoupons>(`/admin/coupons${suffix}`, { token });
}

export async function createAdminCoupon(token: string, payload: AdminCouponPayload) {
  return apiFetch<{ data: AdminCoupon }>("/admin/coupons", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCoupon(token: string, id: number, payload: Partial<AdminCouponPayload>) {
  return apiFetch<{ data: AdminCoupon }>(`/admin/coupons/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCoupon(token: string, id: number) {
  return apiFetch<{ message: string }>(`/admin/coupons/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function fetchCouponReportSummary(token: string) {
  return apiFetch<{ data: CouponReportRow[] }>("/admin/coupons/reports/summary", { token });
}

export async function fetchCouponUsages(token: string, couponId: number, page = 1) {
  return apiFetch<PaginatedUsages>(`/admin/coupons/${couponId}/usages?page=${page}`, { token });
}

export async function fetchCouponCodes(token: string, couponId: number) {
  return apiFetch<{ data: { code: string; qr_url: string; barcode_url: string } }>(
    `/admin/coupons/${couponId}/codes`,
    { token },
  );
}
