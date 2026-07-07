"use client";

import type { Order } from "@/lib/orders/types";
import {
  formatMoney,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/orders/types";
import { OrderTotalsSummary } from "@/components/orders/OrderTotalsSummary";
import { OrderLoyaltySummary } from "@/components/orders/OrderLoyaltySummary";
import { printOrderReceipt } from "@/lib/print/orderReceipt";

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

function channelLabel(channel: string) {
  if (channel === "Online Store") return "เว็บ";
  return channel;
}

type AdminOrderDetailModalProps = {
  order: Order | null;
  saving?: boolean;
  onClose: () => void;
  onStatusChange?: (field: "status" | "payment_status", value: string) => void;
};

export function AdminOrderDetailModal({
  order,
  saving = false,
  onClose,
  onStatusChange,
}: AdminOrderDetailModalProps) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">ออเดอร์ #{order.order_number}</h3>
            <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            ปิด
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-500">ช่องทาง:</span> {channelLabel(order.channel)}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">ชำระเงิน:</span> {order.payment_method ?? "-"}
              </p>
              {order.customer ? (
                <p className="text-slate-300">
                  <span className="text-slate-500">ลูกค้า:</span> {order.customer.name}
                  <span className="block text-xs text-slate-500">{order.customer.email}</span>
                </p>
              ) : (
                <p className="text-slate-300">
                  <span className="text-slate-500">ลูกค้า:</span> Walk-in
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">สถานะออเดอร์</label>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={order.status}
                  disabled={saving}
                  onChange={(event) => onStatusChange?.("status", event.target.value)}
                >
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">การชำระเงิน</label>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={order.payment_status}
                  disabled={saving}
                  onChange={(event) => onStatusChange?.("payment_status", event.target.value)}
                >
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">สินค้า</th>
                  <th className="px-4 py-2 font-medium">ตัวเลือก</th>
                  <th className="px-4 py-2 font-medium">จำนวน</th>
                  <th className="px-4 py-2 font-medium">ราคา</th>
                  <th className="px-4 py-2 font-medium">รวม</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      ไม่มีรายการสินค้า
                    </td>
                  </tr>
                ) : (
                  (order.items ?? []).map((item, index) => (
                    <tr key={`${order.id}-item-${index}`} className="border-b border-slate-800 last:border-b-0">
                      <td className="px-4 py-3 text-white">{item.product_name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {[item.color, item.size].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-300">฿{formatMoney(item.price)}</td>
                      <td className="px-4 py-3 font-medium text-white">
                        ฿{formatMoney(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <OrderLoyaltySummary order={order} variant="admin" />

          <OrderTotalsSummary order={order} variant="admin" />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={() => printOrderReceipt(order)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  );
}
