"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminProductFormModal } from "@/components/admin/AdminProductFormModal";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  fetchCategories,
  updateAdminProduct,
  type AdminCategory,
  type AdminProduct,
  type AdminProductPayload,
} from "@/lib/api/adminProducts";
import { defaultProductImageForId, formatPriceTHB, resolveProductImage } from "@/lib/api/products";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

export function AdminProductsSection() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    void fetchCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const loadProducts = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminProducts(token, {
        search: search || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        page,
      });
      setProducts(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? res.data.length);
    } catch {
      setError("โหลดรายการสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts, search]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  }

  function openCreateForm() {
    setEditingProduct(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(product: AdminProduct) {
    setEditingProduct(product);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingProduct(null);
    setFormError(null);
  }

  async function handleSubmit(payload: AdminProductPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload, token);
        showMessage(`แก้ไข ${payload.name} แล้ว`);
      } else {
        await createAdminProduct(payload, token);
        showMessage(`เพิ่มสินค้า ${payload.name} แล้ว`);
      }

      closeForm();
      await loadProducts();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(`ลบสินค้า "${product.name}" ใช่หรือไม่?`);
    if (!confirmed) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(product.id);

    try {
      await deleteAdminProduct(product.id, token);
      showMessage(`ลบ ${product.name} แล้ว`);
      await loadProducts();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPanel
        title="สินค้าทั้งหมด"
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            + เพิ่มสินค้า
          </button>
        }
      >
        <p className="mb-4 text-xs text-slate-500">
          สินค้าที่เพิ่มหรือแก้ไขที่นี่จะแสดงในร้านออนไลน์และ POS ทันที (สต็อกกลาง)
        </p>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อหรือ slug..."
            className="min-w-[220px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">ทุกหมวด</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
        {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {!loading && !error ? (
          <>
            <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} สินค้า</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">รูป</th>
                    <th className="px-3 py-2 font-medium">ชื่อ</th>
                    <th className="px-3 py-2 font-medium">หมวด</th>
                    <th className="px-3 py-2 font-medium">ราคา</th>
                    <th className="px-3 py-2 font-medium">สต็อก</th>
                    <th className="px-3 py-2 font-medium">SKU</th>
                    <th className="px-3 py-2 font-medium">Featured</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                        ไม่พบสินค้า
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3">
                          <img
                            src={resolveProductImage(product.image, defaultProductImageForId(product.id))}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.slug}</p>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{product.category?.name ?? "-"}</td>
                        <td className="px-3 py-3 text-emerald-300">{formatPriceTHB(product.price)}</td>
                        <td className="px-3 py-3 text-slate-300">{product.total_stock ?? 0}</td>
                        <td className="px-3 py-3 text-slate-400">{product.variations?.length ?? 0} รายการ</td>
                        <td className="px-3 py-3">
                          {product.is_featured ? (
                            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-300">ใช่</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === product.id}
                              onClick={() => void handleDelete(product)}
                              className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
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

      <AdminProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}
