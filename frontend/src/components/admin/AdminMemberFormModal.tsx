"use client";

import { useEffect, useState } from "react";
import type { AdminCustomer, AdminCustomerPayload } from "@/lib/api/admin";

const MEMBER_TIERS = ["Silver", "Gold", "Platinum"] as const;

type AdminMemberFormModalProps = {
  open: boolean;
  member: AdminCustomer | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminCustomerPayload) => void;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  points: "0",
  tier: "Silver",
};

export function AdminMemberFormModal({
  open,
  member,
  submitting,
  error,
  onClose,
  onSubmit,
}: AdminMemberFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone ?? "",
        password: "",
        points: String(member.points ?? 0),
        tier: member.tier ?? "Silver",
      });
      return;
    }

    setForm(emptyForm);
  }, [member, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password.trim() || undefined,
      points: Number(form.points) || 0,
      tier: form.tier,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{member ? "แก้ไขสมาชิก" : "เพิ่มสมาชิกใหม่"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ชื่อ-นามสกุล</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">อีเมล</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">เบอร์โทร</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">
              รหัสผ่าน {member ? "(เว้นว่างถ้าไม่เปลี่ยน)" : "(เว้นว่างเพื่อสุ่มให้)"}
            </label>
            <input
              type="password"
              minLength={member ? undefined : 8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">ระดับ</label>
              <select
                value={form.tier}
                onChange={(event) => setForm((current) => ({ ...current, tier: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {MEMBER_TIERS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">แต้ม</label>
              <input
                type="number"
                min={0}
                value={form.points}
                onChange={(event) => setForm((current) => ({ ...current, points: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : member ? "บันทึกการแก้ไข" : "เพิ่มสมาชิก"}
          </button>
        </form>
      </div>
    </div>
  );
}
