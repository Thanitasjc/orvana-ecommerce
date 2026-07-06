"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBlogFormModal } from "@/components/admin/AdminBlogFormModal";
import { AdminPanel } from "@/components/admin/AdminPanel";
import {
  createAdminBlog,
  deleteAdminBlog,
  fetchAdminBlogs,
  updateAdminBlog,
  type AdminBlog,
  type AdminBlogPayload,
} from "@/lib/api/adminBlogs";
import { resolveProductImage } from "@/lib/api/products";
import { formatBlogDate } from "@/lib/api/blogs";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

export function AdminBlogsSection() {
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "published" | "draft">("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<AdminBlog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadBlogs = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminBlogs(token, {
        search: search || undefined,
        page,
        status,
      });
      setBlogs(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? res.data.length);
    } catch {
      setError("โหลดรายการบทความไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBlogs();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadBlogs, search]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  }

  function openCreateForm() {
    setEditingBlog(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(blog: AdminBlog) {
    setEditingBlog(blog);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingBlog(null);
    setFormError(null);
  }

  async function handleSubmit(payload: AdminBlogPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingBlog) {
        await updateAdminBlog(editingBlog.id, payload, token);
        showMessage(`แก้ไขบทความ "${payload.title}" แล้ว`);
      } else {
        await createAdminBlog(payload, token);
        showMessage(`เพิ่มบทความ "${payload.title}" แล้ว`);
      }

      closeForm();
      await loadBlogs();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(blog: AdminBlog) {
    if (!window.confirm(`ลบบทความ "${blog.title}" ใช่หรือไม่?`)) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(blog.id);

    try {
      await deleteAdminBlog(blog.id, token);
      showMessage("ลบบทความแล้ว");
      await loadBlogs();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPanel
        title="บทความ / Blog"
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + เพิ่มบทความ
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาหัวข้อ / slug..."
            className="min-w-[220px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | "published" | "draft")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="">ทุกสถานะ</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="draft">แบบร่าง</option>
          </select>
        </div>

        {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
        {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-3 py-3">รูป</th>
                <th className="px-3 py-3">หัวข้อ</th>
                <th className="px-3 py-3">สถานะ</th>
                <th className="px-3 py-3">เผยแพร่</th>
                <th className="px-3 py-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                    ยังไม่มีบทความ
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                    <td className="px-3 py-3">
                      {blog.image ? (
                        <img
                          src={resolveProductImage(blog.image)}
                          alt=""
                          className="h-14 w-20 rounded-lg border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="h-14 w-20 rounded-lg border border-dashed border-slate-700 bg-slate-900" />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-white">{blog.title}</p>
                      <p className="text-xs text-slate-500">/blog/{blog.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          blog.is_published
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {blog.is_published ? "เผยแพร่" : "แบบร่าง"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">{formatBlogDate(blog.published_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          ดู
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditForm(blog)}
                          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === blog.id}
                          onClick={() => void handleDelete(blog)}
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-500 disabled:opacity-50"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>ทั้งหมด {total} บทความ</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span>
              หน้า {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </AdminPanel>

      <AdminBlogFormModal
        open={formOpen}
        blog={editingBlog}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}
