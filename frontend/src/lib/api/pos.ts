import { apiFetch } from "@/lib/api/client";
import type { ProductGallerySlide } from "@/lib/api/products";

export type PosVariation = {
  id: number;
  color: string;
  size: string;
  stock: number;
  sku?: string;
};

export type PosProduct = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  images?: ProductGallerySlide[] | null;
  category_id?: number;
  category?: { id: number; name: string };
  variations: PosVariation[];
};

export type PosCustomer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: string | null;
};

export type PosCheckoutItem = {
  variation_id: number;
  quantity: number;
};

export type PosCheckoutPayload = {
  items: PosCheckoutItem[];
  customer_id?: number;
  discount?: number;
  coupon_code?: string;
  payment_method?: string;
  pos_session_id?: string;
};

export type PosOrderItem = {
  product_name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
};

export type PosOrder = {
  id: number;
  order_number: string;
  total: number;
  discount: number;
  payment_method?: string | null;
  created_at?: string;
  customer?: PosCustomer | null;
  items: PosOrderItem[];
};

export type Category = {
  id: number;
  name: string;
};

export async function fetchPosProducts(
  token: string,
  params?: { search?: string; categoryId?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("category_id", String(params.categoryId));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<{ data: PosProduct[] }>(`/pos/products${suffix}`, { token });
}

export async function fetchCategories() {
  return apiFetch<{ data: Category[] }>("/categories");
}

export async function searchPosCustomers(query: string, token: string) {
  return apiFetch<{ data: PosCustomer[] }>(`/pos/customers/search?q=${encodeURIComponent(query)}`, {
    token,
  });
}

export type CreatePosCustomerPayload = {
  name: string;
  phone: string;
  email?: string;
};

export async function createPosCustomer(payload: CreatePosCustomerPayload, token: string) {
  return apiFetch<{ data: PosCustomer }>("/pos/customers", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function submitPosCheckout(payload: PosCheckoutPayload, token: string) {
  return apiFetch<{ data: PosOrder }>("/pos/checkout", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
