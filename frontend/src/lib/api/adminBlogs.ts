import { apiFetch, apiUpload } from "@/lib/api/client";
import type { BlogPost } from "@/lib/api/blogs";

export type AdminBlog = BlogPost;

export type AdminBlogPayload = {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  tags?: string[];
  author?: string;
  is_published?: boolean;
  published_at?: string;
};

type BlogsResponse = {
  data: AdminBlog[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function fetchAdminBlogs(
  token: string,
  params?: { search?: string; page?: number; status?: "published" | "draft" | "" },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.status) query.set("status", params.status);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<BlogsResponse>(`/admin/blogs${suffix}`, { token });
}

export async function createAdminBlog(payload: AdminBlogPayload, token: string) {
  return apiFetch<{ data: AdminBlog }>("/admin/blogs", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlog(id: number, payload: AdminBlogPayload, token: string) {
  return apiFetch<{ data: AdminBlog }>(`/admin/blogs/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlog(id: number, token: string) {
  return apiFetch<{ message: string }>(`/admin/blogs/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadAdminBlogImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<{ path: string; url: string }>("/admin/blogs/upload-image", formData, token);
}
