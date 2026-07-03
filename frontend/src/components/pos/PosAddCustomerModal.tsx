"use client";

import { useState } from "react";
import { createPosCustomer, type PosCustomer } from "@/lib/api/pos";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type PosAddCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: PosCustomer) => void;
};

export function PosAddCustomerModal({ open, onClose, onCreated }: PosAddCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await createPosCustomer(
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        token,
      );

      onCreated(res.data);
      setName("");
      setPhone("");
      setEmail("");
      onClose();
    } catch (err) {
      let message = "บันทึกสมาชิกไม่สำเร็จ";
      if (err && typeof err === "object") {
        const apiError = err as { message?: string; errors?: Record<string, string[]> };
        const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
        message = firstFieldError ?? apiError.message ?? message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-base font-extrabold text-slate-950">ลงทะเบียนสมาชิกหน้าร้าน</h5>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">ชื่อ-นามสกุลสมาชิก</label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="เช่น สมชาย สุขสบาย"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">เบอร์โทรศัพท์มือถือ</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="เช่น 0812345678"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">อีเมลผู้สมัคร (ถ้ามี)</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="เช่น customer@mail.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกและผูกออเดอร์ทันที"}
          </button>
        </form>
      </div>
    </div>
  );
}
