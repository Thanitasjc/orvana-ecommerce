"use client";

import { useEffect, useState } from "react";
import type { AdminShippingMethodPayload } from "@/lib/api/adminShipping";
import type { ShippingMethod } from "@/lib/shipping/api";

type AdminShippingFormModalProps = {
  open: boolean;
  method: ShippingMethod | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminShippingMethodPayload) => void;
};

const emptyForm = {
  name: "",
  description: "",
  price: "0",
  min_order: "0",
  free_shipping_min: "",
  sort_order: "0",
  is_active: true,
};

export function AdminShippingFormModal({
  open,
  method,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminShippingFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (method) {
      setForm({
        name: method.name,
        description: method.description ?? "",
        price: String(method.price),
        min_order: String(method.min_order),
        free_shipping_min: method.free_shipping_min != null ? String(method.free_shipping_min) : "",
        sort_order: String(method.sort_order),
        is_active: method.is_active,
      });
      return;
    }

    setForm(emptyForm);
  }, [method, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      min_order: Number(form.min_order) || 0,
      free_shipping_min: form.free_shipping_min ? Number(form.free_shipping_min) : null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{method ? "แก้ไขวิธีจัดส่ง" : "เพิ่มวิธีจัดส่ง"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อวิธีจัดส่ง</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">คำอธิบาย (ถ้ามี)</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ค่าจัดส่ง (บาท)</label>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ยอดขั้นต่ำ (บาท)</label>
              <input
                required
                type="number"
                min={0}
                value={form.min_order}
                onChange={(event) => setForm((current) => ({ ...current, min_order: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ส่งฟรีเมื่อยอด ≥ (บาท)</label>
              <input
                type="number"
                min={0}
                placeholder="ว่าง = ไม่มี"
                value={form.free_shipping_min}
                onChange={(event) => setForm((current) => ({ ...current, free_shipping_min: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ลำดับแสดงผล</label>
              <input
                required
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            เปิดใช้งาน
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : method ? "บันทึก" : "เพิ่ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
