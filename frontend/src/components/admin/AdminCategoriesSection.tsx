"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCategoryFormModal } from "@/components/admin/AdminCategoryFormModal";
import { AdminPanel } from "@/components/admin/AdminPanel";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategory,
  type AdminCategoryPayload,
} from "@/lib/api/adminCategories";
import { resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

export function AdminCategoriesSection() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadCategories = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminCategories(token, {
        search: search || undefined,
        page,
      });
      setCategories(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? res.data.length);
    } catch {
      setError("โหลดรายการหมวดหมู่ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadCategories, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  }

  function openCreateForm() {
    setEditingCategory(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(category: AdminCategory) {
    setEditingCategory(category);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
    setFormError(null);
  }

  async function handleSubmit(payload: AdminCategoryPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload, token);
        showMessage(`แก้ไข "${payload.name}" แล้ว`);
      } else {
        await createAdminCategory(payload, token);
        showMessage(`เพิ่มหมวดหมู่ "${payload.name}" แล้ว`);
      }

      closeForm();
      await loadCategories();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const productCount = category.products_count ?? 0;
    const warning =
      productCount > 0
        ? `หมวดหมู่ "${category.name}" มีสินค้า ${productCount} รายการ — ไม่สามารถลบได้`
        : `ลบหมวดหมู่ "${category.name}" ใช่หรือไม่?`;

    if (productCount > 0) {
      window.alert(warning);
      return;
    }

    const confirmed = window.confirm(warning);
    if (!confirmed) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(category.id);

    try {
      await deleteAdminCategory(category.id, token);
      showMessage(`ลบ ${category.name} แล้ว`);
      await loadCategories();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPanel
        title="หมวดหมู่สินค้า"
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            + เพิ่มหมวดหมู่
          </button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อหรือ slug..."
            className="min-w-[220px] w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
        {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {!loading && !error ? (
          <>
            <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} หมวดหมู่</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">รูป</th>
                    <th className="px-3 py-2 font-medium">ชื่อ</th>
                    <th className="px-3 py-2 font-medium">Slug</th>
                    <th className="px-3 py-2 font-medium">สินค้า</th>
                    <th className="px-3 py-2 font-medium">อัปเดตล่าสุด</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                        ไม่พบหมวดหมู่
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => {
                      const imageSrc = category.image ? resolveProductImage(category.image) : "";
                      const productCount = category.products_count ?? 0;

                      return (
                        <tr key={category.id} className="border-b border-slate-800 last:border-b-0">
                          <td className="px-3 py-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                              {imageSrc ? (
                                <img src={imageSrc} alt={category.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-medium text-white">{category.name}</td>
                          <td className="px-3 py-3 text-slate-300">{category.slug}</td>
                          <td className="px-3 py-3 text-slate-300">{productCount}</td>
                          <td className="px-3 py-3 text-slate-400">{formatDate(category.updated_at)}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(category)}
                                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                              >
                                แก้ไข
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === category.id || productCount > 0}
                                title={productCount > 0 ? "มีสินค้าในหมวดหมู่นี้ — ลบไม่ได้" : undefined}
                                onClick={() => void handleDelete(category)}
                                className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {lastPage > 1 ? (
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <span className="text-sm text-slate-400">
                  หน้า {page} / {lastPage}
                </span>
                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                  className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </AdminPanel>

      <AdminCategoryFormModal
        open={formOpen}
        category={editingCategory}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}
