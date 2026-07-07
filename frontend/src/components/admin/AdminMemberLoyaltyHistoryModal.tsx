"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminCustomer } from "@/lib/api/admin";
import { fetchAdminCustomerLoyaltyTransactions } from "@/lib/loyalty/api";
import type { LoyaltyTransaction } from "@/lib/loyalty/types";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

type AdminMemberLoyaltyHistoryModalProps = {
  open: boolean;
  member: AdminCustomer | null;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("th-TH");
}

function typeLabel(type: LoyaltyTransaction["type"]) {
  if (type === "earn") return "ได้รับแต้ม";
  if (type === "redeem") return "แลกแต้ม";
  if (type === "cancel") return "ยกเลิกออเดอร์";
  return "ปรับโดย Admin";
}

export function AdminMemberLoyaltyHistoryModal({
  open,
  member,
  onClose,
}: AdminMemberLoyaltyHistoryModalProps) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = useCallback(async () => {
    if (!member) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminCustomerLoyaltyTransactions(member.id, token, page);
      setTransactions(response.data ?? []);
      setLastPage(response.last_page ?? 1);
      setTotal(response.total ?? response.data?.length ?? 0);
    } catch {
      setError("โหลดประวัติแต้มไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [member, page]);

  useEffect(() => {
    if (!open || !member) return;
    void loadTransactions();
  }, [open, member, loadTransactions]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setTransactions([]);
      setError(null);
    }
  }, [open]);

  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">ประวัติแต้มสะสม</h3>
            <p className="text-sm text-slate-300">
              {member.name} — คงเหลือ{" "}
              <span className="font-semibold text-emerald-300">{member.points ?? 0}</span> แต้ม ·{" "}
              {member.tier ?? "Silver"}
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
                      <th className="px-3 py-2 font-medium">ประเภท</th>
                      <th className="px-3 py-2 font-medium">รายละเอียด</th>
                      <th className="px-3 py-2 font-medium">ออเดอร์</th>
                      <th className="px-3 py-2 font-medium">แต้ม</th>
                      <th className="px-3 py-2 font-medium">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                          ยังไม่มีประวัติแต้ม
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-800 last:border-b-0">
                          <td className="px-3 py-3 text-slate-300">{formatDate(tx.created_at)}</td>
                          <td className="px-3 py-3 text-slate-300">{typeLabel(tx.type)}</td>
                          <td className="px-3 py-3 text-slate-300">
                            {tx.description ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-white">
                            {tx.order?.order_number ?? "—"}
                          </td>
                          <td
                            className={`px-3 py-3 font-medium ${
                              tx.points >= 0 ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {tx.points >= 0 ? "+" : ""}
                            {tx.points}
                          </td>
                          <td className="px-3 py-3 text-slate-300">{tx.balance_after}</td>
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
