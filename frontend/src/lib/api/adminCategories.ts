import { apiFetch, apiUpload } from "@/lib/api/client";

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type AdminCategoryPayload = {
  name: string;
  slug?: string;
  image?: string;
};

type CategoriesResponse = {
  data: AdminCategory[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function fetchAdminCategories(
  token: string,
  params?: { search?: string; page?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<CategoriesResponse>(`/admin/categories${suffix}`, { token });
}

export async function createAdminCategory(payload: AdminCategoryPayload, token: string) {
  return apiFetch<{ data: AdminCategory }>("/admin/categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(id: number, payload: AdminCategoryPayload, token: string) {
  return apiFetch<{ data: AdminCategory }>(`/admin/categories/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCategory(id: number, token: string) {
  return apiFetch<{ message: string }>(`/admin/categories/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadAdminCategoryImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<{ path: string; url: string }>("/admin/categories/upload-image", formData, token);
}
