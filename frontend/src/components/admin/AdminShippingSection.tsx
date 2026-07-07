"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminShippingFormModal } from "@/components/admin/AdminShippingFormModal";
import {
  createAdminShippingMethod,
  deleteAdminShippingMethod,
  fetchAdminShippingMethods,
  updateAdminShippingMethod,
  type AdminShippingMethodPayload,
} from "@/lib/api/adminShipping";
import type { ShippingMethod } from "@/lib/shipping/api";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

function formatFreeShipping(min: number | null) {
  if (min == null) return "-";
  return `≥ ฿${min.toLocaleString("th-TH")}`;
}

export function AdminShippingSection() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMethods = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminShippingMethods(token);
      setMethods(response.data ?? []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMethods();
  }, [loadMethods]);

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3000);
  }

  function openCreateForm() {
    setEditingMethod(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(method: ShippingMethod) {
    setEditingMethod(method);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMethod(null);
    setFormError(null);
  }

  async function handleSubmit(payload: AdminShippingMethodPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingMethod) {
        await updateAdminShippingMethod(token, editingMethod.id, payload);
        showMessage(`แก้ไข "${payload.name}" แล้ว`);
      } else {
        await createAdminShippingMethod(token, payload);
        showMessage(`เพิ่ม "${payload.name}" แล้ว`);
      }

      closeForm();
      await loadMethods();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(method: ShippingMethod) {
    const confirmed = window.confirm(`ลบวิธีจัดส่ง "${method.name}" ใช่หรือไม่?`);
    if (!confirmed) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(method.id);

    try {
      await deleteAdminShippingMethod(token, method.id);
      showMessage(`ลบ ${method.name} แล้ว`);
      await loadMethods();
    } catch (err) {
      window.alert(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPanel
      title="วิธีจัดส่ง"
      action={
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
        >
          + เพิ่มวิธีจัดส่ง
        </button>
      }
    >
      <p className="mb-4 text-sm text-slate-400">
        กำหนดค่าจัดส่ง ยอดขั้นต่ำ และเงื่อนไขส่งฟรี — ลูกค้าเลือกวิธีจัดส่งที่หน้า Checkout
      </p>
      {actionMessage ? (
        <p className="mb-4 rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-300">
          {actionMessage}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-400">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : methods.length === 0 ? (
        <p className="text-sm text-slate-400">ยังไม่มีวิธีจัดส่ง — กดเพิ่มเพื่อเริ่มต้น</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">ชื่อ</th>
                <th className="px-3 py-3">ค่าจัดส่ง</th>
                <th className="px-3 py-3">ยอดขั้นต่ำ</th>
                <th className="px-3 py-3">ส่งฟรีเมื่อ</th>
                <th className="px-3 py-3">ลำดับ</th>
                <th className="px-3 py-3">สถานะ</th>
                <th className="px-3 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-slate-900/50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{method.name}</p>
                    {method.description ? (
                      <p className="text-xs text-slate-500">{method.description}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">฿{method.price.toLocaleString("th-TH")}</td>
                  <td className="px-3 py-3">฿{method.min_order.toLocaleString("th-TH")}</td>
                  <td className="px-3 py-3">{formatFreeShipping(method.free_shipping_min)}</td>
                  <td className="px-3 py-3">{method.sort_order}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        method.is_active ? "bg-emerald-900/50 text-emerald-300" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {method.is_active ? "เปิด" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditForm(method)}
                      className="mr-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(method)}
                      disabled={deletingId === method.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === method.id ? "..." : "ลบ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminShippingFormModal
        open={formOpen}
        method={editingMethod}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={(payload) => void handleSubmit(payload)}
      />
    </AdminPanel>
  );
}
