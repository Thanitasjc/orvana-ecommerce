import { apiFetch, apiUpload } from "@/lib/api/client";

import type { AdminCategory } from "@/lib/api/adminCategories";
import type { ProductGallerySlide } from "@/lib/api/products";

export type { AdminCategory };

export type AdminProductVariation = {
  id: number;
  product_id: number;
  color: string;
  size: string;
  sku: string;
  stock: number;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  detail_content?: string | null;
  price: number;
  cost: number;
  image?: string | null;
  images?: ProductGallerySlide[] | null;
  is_featured: boolean;
  sales_count?: number;
  total_stock?: number;
  category?: AdminCategory | null;
  variations?: AdminProductVariation[];
  created_at?: string;
  updated_at?: string;
};

export type AdminProductVariationPayload = {
  id?: number;
  color: string;
  size: string;
  sku?: string;
  stock: number;
};

export type AdminProductPayload = {
  category_id: number;
  name: string;
  slug?: string;
  description?: string;
  detail_content?: string;
  price: number;
  cost?: number;
  image?: string;
  images?: ProductGallerySlide[];
  is_featured?: boolean;
  variations: AdminProductVariationPayload[];
};

type ProductsResponse = {
  data: AdminProduct[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function fetchCategories() {
  return apiFetch<{ data: AdminCategory[] }>("/categories");
}

export async function fetchAdminProducts(
  token: string,
  params?: { search?: string; category_id?: number; page?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category_id) query.set("category_id", String(params.category_id));
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<ProductsResponse>(`/admin/products${suffix}`, { token });
}

export async function createAdminProduct(payload: AdminProductPayload, token: string) {
  return apiFetch<{ data: AdminProduct }>("/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProduct(
  productId: number,
  payload: Partial<AdminProductPayload>,
  token: string,
) {
  return apiFetch<{ data: AdminProduct }>(`/admin/products/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminProduct(productId: number, token: string) {
  return apiFetch<{ message: string }>(`/admin/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadAdminProductImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);

  return apiUpload<{ path: string; url: string }>("/admin/products/upload-image", formData, token);
}
