"use client";

import { useEffect, useState } from "react";
import { AdminBlogImagePicker } from "@/components/admin/AdminBlogImagePicker";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import type { AdminBlog, AdminBlogPayload } from "@/lib/api/adminBlogs";

type AdminBlogFormModalProps = {
  open: boolean;
  blog: AdminBlog | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminBlogPayload) => void;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  tags: "",
  author: "AESTHETE Editorial",
  is_published: true,
  published_at: "",
};

export function AdminBlogFormModal({
  open,
  blog,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminBlogFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (blog) {
      setForm({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? "",
        content: blog.content ?? "",
        image: blog.image ?? "",
        tags: (blog.tags ?? []).join(", "),
        author: blog.author ?? "AESTHETE Editorial",
        is_published: blog.is_published,
        published_at: blog.published_at ? blog.published_at.slice(0, 16) : "",
      });
      return;
    }

    setForm({
      ...emptyForm,
      published_at: new Date().toISOString().slice(0, 16),
    });
  }, [blog, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      content: form.content || undefined,
      image: form.image.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      author: form.author.trim() || undefined,
      is_published: form.is_published,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{blog ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              ปิด
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-400">หัวข้อ</label>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="auto-from-title"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ผู้เขียน</label>
              <input
                value={form.author}
                onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <AdminBlogImagePicker
                value={form.image}
                onChange={(image) => setForm((current) => ({ ...current, image }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-400">คำโปรย (Excerpt)</label>
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-400">แท็ก (คั่นด้วย comma)</label>
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="Fashion, News, Style"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">วันที่เผยแพร่</label>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
                  className="rounded border-slate-600"
                />
                เผยแพร่บนหน้าร้าน
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">เนื้อหาบทความ</label>
            <AdminRichTextEditor
              value={form.content}
              onChange={(content) => setForm((current) => ({ ...current, content }))}
              placeholder="เขียนเนื้อหาบทความ..."
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
