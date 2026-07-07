"use client";

import { useEffect, useState } from "react";
import type { AdminPaymentMethodPayload } from "@/lib/api/adminPayments";
import type { PaymentMethod, PaymentMethodType } from "@/lib/payment/api";

const TYPE_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: "bank_transfer", label: "โอนเงินผ่านธนาคาร" },
  { value: "cod", label: "เก็บเงินปลายทาง" },
  { value: "omise_card", label: "บัตรเครดิต (Omise)" },
  { value: "omise_promptpay", label: "PromptPay (Omise)" },
];

type AdminPaymentFormModalProps = {
  open: boolean;
  method: PaymentMethod | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminPaymentMethodPayload) => void;
};

const emptyForm = {
  name: "",
  type: "bank_transfer" as PaymentMethodType,
  description: "",
  instructions: "",
  channel: "online" as "online" | "pos" | "both",
  sort_order: "0",
  is_active: true,
  bank_name: "",
  account_name: "",
  account_number: "",
};

export function AdminPaymentFormModal({
  open,
  method,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminPaymentFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (method) {
      const config = (method.config ?? {}) as Record<string, string>;
      setForm({
        name: method.name,
        type: method.type,
        description: method.description ?? "",
        instructions: method.instructions ?? "",
        channel: method.channel as "online" | "pos" | "both",
        sort_order: String(method.sort_order),
        is_active: method.is_active,
        bank_name: config.bank_name ?? "",
        account_name: config.account_name ?? "",
        account_number: config.account_number ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [method, open]);

  if (!open) return null;

  function buildConfig() {
    if (form.type === "bank_transfer") {
      return {
        bank_name: form.bank_name.trim(),
        account_name: form.account_name.trim(),
        account_number: form.account_number.trim(),
      };
    }

    if (form.type === "cod") {
      return { instructions: form.instructions.trim() || undefined };
    }

    return {};
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || null,
      instructions: form.instructions.trim() || null,
      config: buildConfig(),
      channel: form.channel,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{method ? "แก้ไขวิธีชำระ" : "เพิ่มวิธีชำระ"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อที่แสดง</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ประเภท</label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value as PaymentMethodType }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ช่องทาง</label>
              <select
                value={form.channel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    channel: event.target.value as "online" | "pos" | "both",
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="online">ออนไลน์</option>
                <option value="pos">POS</option>
                <option value="both">ทั้งสอง</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">คำอธิบายสั้น</label>
            <input
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">คำแนะนำหลังสั่งซื้อ</label>
            <textarea
              value={form.instructions}
              onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          {form.type === "bank_transfer" ? (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <p className="text-xs font-semibold text-slate-400">ข้อมูลบัญชีธนาคาร</p>
              <input
                placeholder="ชื่อธนาคาร"
                value={form.bank_name}
                onChange={(event) => setForm((current) => ({ ...current, bank_name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                placeholder="ชื่อบัญชี"
                value={form.account_name}
                onChange={(event) => setForm((current) => ({ ...current, account_name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                placeholder="เลขบัญชี"
                value={form.account_number}
                onChange={(event) => setForm((current) => ({ ...current, account_number: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ลำดับ</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              เปิดใช้งาน
            </label>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
