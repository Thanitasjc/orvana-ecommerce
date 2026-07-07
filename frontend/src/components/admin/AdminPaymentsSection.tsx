"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminPaymentFormModal } from "@/components/admin/AdminPaymentFormModal";
import {
  createAdminPaymentMethod,
  deleteAdminPaymentMethod,
  fetchAdminPaymentMethods,
  updateAdminPaymentMethod,
  type AdminPaymentMethodPayload,
} from "@/lib/api/adminPayments";
import type { PaymentMethod } from "@/lib/payment/api";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

const typeLabels: Record<string, string> = {
  bank_transfer: "โอนธนาคาร",
  cod: "เก็บปลายทาง",
  omise_card: "บัตร (Omise)",
  omise_promptpay: "PromptPay",
};

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

export function AdminPaymentsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMethods = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminPaymentMethods(token);
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

  async function handleSubmit(payload: AdminPaymentMethodPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingMethod) {
        await updateAdminPaymentMethod(token, editingMethod.id, payload);
        showMessage(`แก้ไข "${payload.name}" แล้ว`);
      } else {
        await createAdminPaymentMethod(token, payload);
        showMessage(`เพิ่ม "${payload.name}" แล้ว`);
      }

      setFormOpen(false);
      setEditingMethod(null);
      await loadMethods();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(method: PaymentMethod) {
    if (!window.confirm(`ลบ "${method.name}" ใช่หรือไม่?`)) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(method.id);
    try {
      await deleteAdminPaymentMethod(token, method.id);
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
      title="วิธีชำระเงิน"
      action={
        <button
          type="button"
          onClick={() => {
            setEditingMethod(null);
            setFormError(null);
            setFormOpen(true);
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
        >
          + เพิ่มวิธีชำระ
        </button>
      }
    >
      <p className="mb-4 text-sm text-slate-400">
        กำหนดโอนธนาคาร เก็บปลายทาง และ Omise (บัตร/PromptPay) — ใส่ OMISE_PUBLIC_KEY / OMISE_SECRET_KEY ใน backend .env
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
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">ชื่อ</th>
                <th className="px-3 py-3">ประเภท</th>
                <th className="px-3 py-3">ช่องทาง</th>
                <th className="px-3 py-3">ลำดับ</th>
                <th className="px-3 py-3">สถานะ</th>
                <th className="px-3 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {methods.map((method) => (
                <tr key={method.id}>
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{method.name}</p>
                    {method.description ? <p className="text-xs text-slate-500">{method.description}</p> : null}
                  </td>
                  <td className="px-3 py-3">{typeLabels[method.type] ?? method.type}</td>
                  <td className="px-3 py-3">{method.channel}</td>
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
                      onClick={() => {
                        setEditingMethod(method);
                        setFormError(null);
                        setFormOpen(true);
                      }}
                      className="mr-2 text-xs text-blue-400"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(method)}
                      disabled={deletingId === method.id}
                      className="text-xs text-red-400 disabled:opacity-50"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPaymentFormModal
        open={formOpen}
        method={editingMethod}
        submitting={submitting}
        error={formError}
        onClose={() => {
          setFormOpen(false);
          setEditingMethod(null);
          setFormError(null);
        }}
        onSubmit={(payload) => void handleSubmit(payload)}
      />
    </AdminPanel>
  );
}
