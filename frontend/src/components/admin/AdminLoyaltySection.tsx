"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { fetchAdminLoyaltySettings, updateAdminLoyaltySettings } from "@/lib/loyalty/api";
import { calcEarnPoints, calcRedeemDiscount } from "@/lib/loyalty/calc";
import type { LoyaltySettings } from "@/lib/loyalty/types";
import { DEFAULT_LOYALTY_SETTINGS } from "@/lib/loyalty/types";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

const EXAMPLE_TOTAL = 1250;

export function AdminLoyaltySection() {
  const [form, setForm] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    fetchAdminLoyaltySettings(token)
      .then((res) => setForm(res.data))
      .catch(() => setError("โหลดการตั้งค่าแต้มไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  const exampleEarn = useMemo(() => calcEarnPoints(EXAMPLE_TOTAL, form), [form]);
  const exampleRedeem = useMemo(
    () => calcRedeemDiscount(form.min_redeem_points, 500, EXAMPLE_TOTAL, form),
    [form],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    if (form.platinum_threshold < form.gold_threshold) {
      setError("เกณฑ์ Platinum ต้องมากกว่าหรือเท่ากับ Gold");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateAdminLoyaltySettings(token, form);
      setForm(res.data);
      setSuccess("บันทึกการตั้งค่าแต้มสะสมแล้ว");
    } catch (err: unknown) {
      const message = (err as { message?: string }).message ?? "บันทึกไม่สำเร็จ";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">กำลังโหลด...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <h3 className="mb-4 text-base font-bold text-white">สะสมแต้ม (Phase 1)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
              className="rounded border-slate-600"
            />
            เปิดระบบสะสมแต้ม
          </label>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ทุกกี่บาท = 1 แต้ม</label>
            <input
              type="number"
              min={1}
              value={form.baht_per_point}
              onChange={(event) =>
                setForm((current) => ({ ...current, baht_per_point: Number(event.target.value) || 1 }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ยอดขั้นต่ำก่อนได้แต้ม (บาท)</label>
            <input
              type="number"
              min={0}
              value={form.min_spend}
              onChange={(event) =>
                setForm((current) => ({ ...current, min_spend: Number(event.target.value) || 0 }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Gold — ยอดสะสมขั้นต่ำ (บาท)</label>
            <input
              type="number"
              min={0}
              value={form.gold_threshold}
              onChange={(event) =>
                setForm((current) => ({ ...current, gold_threshold: Number(event.target.value) || 0 }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Platinum — ยอดสะสมขั้นต่ำ (บาท)</label>
            <input
              type="number"
              min={0}
              value={form.platinum_threshold}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  platinum_threshold: Number(event.target.value) || 0,
                }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          ตัวอย่าง: ยอด ฿{EXAMPLE_TOTAL.toLocaleString("th-TH")} → ได้{" "}
          <span className="font-semibold text-emerald-300">{exampleEarn}</span> แต้ม
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <h3 className="mb-4 text-base font-bold text-white">แลกแต้ม (Phase 2)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.redeem_enabled}
              onChange={(event) =>
                setForm((current) => ({ ...current, redeem_enabled: event.target.checked }))
              }
              className="rounded border-slate-600"
            />
            เปิดใช้แต้มแลกส่วนลด
          </label>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">กี่แต้ม = ส่วนลด 1 บาท</label>
            <input
              type="number"
              min={1}
              value={form.redeem_points_per_baht}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  redeem_points_per_baht: Number(event.target.value) || 1,
                }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-xs text-slate-500">เช่น 10 = ใช้ 10 แต้ม ลด ฿1</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ใช้แต้มขั้นต่ำต่อครั้ง</label>
            <input
              type="number"
              min={1}
              value={form.min_redeem_points}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  min_redeem_points: Number(event.target.value) || 1,
                }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">ลดสูงสุด (% ของยอดสินค้า)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.max_redeem_percent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  max_redeem_percent: Number(event.target.value) || 1,
                }))
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          ตัวอย่าง: ใช้ {form.min_redeem_points} แต้มบนยอด ฿{EXAMPLE_TOTAL.toLocaleString("th-TH")} → ลด ฿
          {exampleRedeem.discount.toLocaleString("th-TH")}
        </p>
      </section>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
