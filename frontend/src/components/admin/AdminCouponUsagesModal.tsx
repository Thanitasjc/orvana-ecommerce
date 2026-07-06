"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminCoupon, CouponUsageLog } from "@/lib/api/adminCoupons";
import { fetchCouponUsages } from "@/lib/api/adminCoupons";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminCouponUsagesModalProps = {
  open: boolean;
  coupon: AdminCoupon | null;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("th-TH");
}

function formatCustomerLabel(log: CouponUsageLog) {
  if (log.customer) {
    return log.customer.name;
  }
  if (log.metadata?.pos_session_id) {
    return `Walk-in (${log.metadata.pos_session_id.slice(0, 8)}…)`;
  }
  return "Walk-in";
}

export function AdminCouponUsagesModal({ open, coupon, onClose }: AdminCouponUsagesModalProps) {
  const [logs, setLogs] = useState<CouponUsageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = useCallback(async () => {
    if (!coupon) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchCouponUsages(token, coupon.id, page);
      setLogs(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch {
      setError("โหลดประวัติการใช้งานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [coupon, page]);

  useEffect(() => {
    if (!open || !coupon) return;
    void loadLogs();
  }, [open, coupon, loadLogs]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setLogs([]);
      setError(null);
    }
  }, [open]);

  if (!open || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">ประวัติการใช้คูปอง</h3>
            <p className="font-mono text-sm text-blue-300">
              {coupon.code} — {coupon.name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ปิด
          </button>
        </div>

        <div className="p-6">
          {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          {!loading && !error ? (
            <>
              <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} รายการ</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">วันที่</th>
                      <th className="px-3 py-2 font-medium">ออเดอร์</th>
                      <th className="px-3 py-2 font-medium">ลูกค้า</th>
                      <th className="px-3 py-2 font-medium">ช่องทาง</th>
                      <th className="px-3 py-2 font-medium">ยอดก่อนลด</th>
                      <th className="px-3 py-2 font-medium">ส่วนลด</th>
                      <th className="px-3 py-2 font-medium">ส่งฟรี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                          ยังไม่มีการใช้งาน
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-800 last:border-b-0">
                          <td className="px-3 py-3 text-slate-300">{formatDate(log.created_at)}</td>
                          <td className="px-3 py-3 font-mono text-white">
                            {log.order?.order_number ?? `#${log.order?.id ?? "—"}`}
                          </td>
                          <td className="px-3 py-3 text-slate-300">{formatCustomerLabel(log)}</td>
                          <td className="px-3 py-3 text-slate-300">{log.channel}</td>
                          <td className="px-3 py-3 text-slate-300">
                            ฿{log.order_subtotal.toLocaleString("th-TH")}
                          </td>
                          <td className="px-3 py-3 text-emerald-300">
                            ฿{log.discount_amount.toLocaleString("th-TH")}
                          </td>
                          <td className="px-3 py-3 text-blue-300">
                            {log.shipping_discount > 0
                              ? `฿${log.shipping_discount.toLocaleString("th-TH")}`
                              : "—"}
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
        </div>
      </div>
    </div>
  );
}
