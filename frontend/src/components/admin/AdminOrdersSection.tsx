"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { exportAdminOrders } from "@/lib/api/admin";
import { updateAdminOrder } from "@/lib/api/adminOrders";
import { apiFetch } from "@/lib/api/client";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";
import {
  formatMoney,
  ORDER_STATUS_OPTIONS,
  orderProductTitle,
  PAYMENT_STATUS_OPTIONS,
  type Order,
} from "@/lib/orders/types";
import { AdminOrderDetailModal } from "@/components/admin/AdminOrderDetailModal";

type ChannelFilter = "all" | "online" | "pos";

type OrdersResponse = {
  data: Order[];
  current_page: number;
  last_page: number;
  total: number;
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

function channelBadge(channel: string) {
  if (channel === "Online Store") return "bg-sky-500/20 text-sky-300";
  if (channel.includes("POS")) return "bg-emerald-500/20 text-emerald-300";
  return "bg-slate-500/20 text-slate-300";
}

export function AdminOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<ChannelFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page) });
    if (filter !== "all") params.set("channel", filter);

    try {
      const res = await apiFetch<OrdersResponse>(`/admin/orders?${params.toString()}`, { token });
      setOrders(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? res.data.length);
    } catch {
      setError("โหลดรายการออเดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  function replaceOrder(updated: Order) {
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    setSelectedOrder((current) => (current?.id === updated.id ? updated : current));
  }

  async function handleStatusUpdate(order: Order, field: "status" | "payment_status", value: string) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token || order[field] === value) return;

    setSavingId(order.id);
    setActionMessage(null);

    try {
      const res = await updateAdminOrder(order.id, { [field]: value }, token);
      replaceOrder(res.data);
      setActionMessage(`อัปเดตออเดอร์ #${order.order_number} แล้ว`);
      window.setTimeout(() => setActionMessage(null), 2500);
    } catch {
      setActionMessage("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  }

  async function handleExport() {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setExporting(true);
    setActionMessage(null);

    try {
      await exportAdminOrders(filter, token);
      setActionMessage("ส่งออกไฟล์ Excel (CSV) แล้ว");
      window.setTimeout(() => setActionMessage(null), 2500);
    } catch {
      setActionMessage("ส่งออกไฟล์ไม่สำเร็จ");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
    <AdminPanel
      title="รายการออเดอร์"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {exporting ? "กำลังส่งออก..." : "ส่งออก Excel"}
          </button>
          {(
            [
              { key: "all", label: "ทั้งหมด" },
              { key: "online", label: "เว็บ" },
              { key: "pos", label: "POS" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === item.key
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
      {loading ? <p className="text-sm text-slate-400">กำลังโหลดออเดอร์...</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {!loading && !error ? (
        <>
          <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} รายการ</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">เลขออเดอร์</th>
                  <th className="px-3 py-2 font-medium">วันที่</th>
                  <th className="px-3 py-2 font-medium">ช่องทาง</th>
                  <th className="px-3 py-2 font-medium">ลูกค้า</th>
                  <th className="px-3 py-2 font-medium">สินค้า</th>
                  <th className="px-3 py-2 font-medium">สถานะ</th>
                  <th className="px-3 py-2 font-medium">ชำระเงิน</th>
                  <th className="px-3 py-2 font-medium">ยอดรวม</th>
                  <th className="px-3 py-2 font-medium">ดู</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                      ยังไม่มีออเดอร์ในหมวดนี้
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-800 last:border-b-0">
                      <td className="px-3 py-3 font-medium text-white">#{order.order_number}</td>
                      <td className="px-3 py-3 text-slate-400">{formatDate(order.created_at)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${channelBadge(order.channel)}`}>
                          {order.channel === "Online Store" ? "เว็บ" : order.channel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{order.customer?.name ?? "Walk-in"}</td>
                      <td className="px-3 py-3 text-slate-300">{orderProductTitle(order)}</td>
                      <td className="px-3 py-3">
                        <select
                          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                          value={order.status}
                          disabled={savingId === order.id}
                          onChange={(event) => handleStatusUpdate(order, "status", event.target.value)}
                        >
                          {ORDER_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                          value={order.payment_status}
                          disabled={savingId === order.id}
                          onChange={(event) => handleStatusUpdate(order, "payment_status", event.target.value)}
                        >
                          {PAYMENT_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 font-medium text-white">฿{formatMoney(order.total)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          ดู
                        </button>
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

    <AdminOrderDetailModal
      order={selectedOrder}
      onClose={() => setSelectedOrder(null)}
      saving={selectedOrder ? savingId === selectedOrder.id : false}
      onStatusChange={(field, value) => {
        if (!selectedOrder) return;
        void handleStatusUpdate(selectedOrder, field, value);
      }}
    />
    </>
  );
}
