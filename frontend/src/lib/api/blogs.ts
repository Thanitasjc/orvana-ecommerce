import { apiFetch } from "@/lib/api/client";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  tags: string[];
  author: string;
  is_published: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type BlogsResponse = {
  data: BlogPost[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function fetchBlogs(params?: { search?: string; page?: number; per_page?: number; tag?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  if (params?.tag) query.set("tag", params.tag);

  const suffix = query.toString() ? `?${query.toString()}` : "";

  try {
    return await apiFetch<BlogsResponse>(`/blogs${suffix}`, { cache: "no-store" });
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 9, total: 0 } };
  }
}

export async function fetchBlogBySlug(slug: string) {
  const res = await apiFetch<{ data: BlogPost }>(`/blogs/${slug}`, { cache: "no-store" });
  return res.data;
}

export function formatBlogDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function blogHref(slug: string) {
  return `/blog/${slug}`;
}
