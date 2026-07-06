"use client";

import type { Order } from "@/lib/orders/types";
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/orders/types";
import { printOrderReceipt } from "@/lib/print/orderReceipt";
import { calculateVatFromInclusiveTotal, VAT_PERCENT } from "@/lib/pricing/vat";

function formatMoney(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString("th-TH") : "0";
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

type OrderInvoiceModalProps = {
  order: Order | null;
  onClose: () => void;
  adminMode?: boolean;
  saving?: boolean;
  onStatusChange?: (field: "status" | "payment_status", value: string) => void;
  statusLabel?: string;
  paymentLabel?: string;
};

export function OrderInvoiceModal({
  order,
  onClose,
  adminMode = false,
  saving = false,
  onStatusChange,
  statusLabel,
  paymentLabel,
}: OrderInvoiceModalProps) {
  if (!order) return null;

  const orderTotal = typeof order.total === "number" ? order.total : Number(order.total);
  const vat = calculateVatFromInclusiveTotal(Number.isFinite(orderTotal) ? orderTotal : 0);

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Invoice #{order.order_number}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="row mb-20">
              <div className="col-md-6">
                <p className="mb-5">
                  <strong>วันที่:</strong> {formatDate(order.created_at)}
                </p>
                <p className="mb-5">
                  <strong>ช่องทาง:</strong> {order.channel}
                </p>
                <p className="mb-0">
                  <strong>ชำระเงิน:</strong> {order.payment_method ?? "-"}
                </p>
              </div>
              <div className="col-md-6">
                {adminMode ? (
                  <>
                    <p className="mb-5">
                      <label className="d-block mb-1">
                        <strong>สถานะออเดอร์</strong>
                      </label>
                      <select
                        className="form-select form-select-sm"
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
                    </p>
                    <p className="mb-5">
                      <label className="d-block mb-1">
                        <strong>การชำระเงิน</strong>
                      </label>
                      <select
                        className="form-select form-select-sm"
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
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-5">
                      <strong>สถานะ:</strong> {statusLabel ?? order.status}
                    </p>
                    <p className="mb-5">
                      <strong>การชำระ:</strong> {paymentLabel ?? order.payment_status}
                    </p>
                  </>
                )}
                {order.customer ? (
                  <p className="mb-0">
                    <strong>ลูกค้า:</strong> {order.customer.name} ({order.customer.email})
                  </p>
                ) : null}
              </div>
            </div>

            <div className="profile__ticket table-responsive mb-20">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>ตัวเลือก</th>
                    <th>จำนวน</th>
                    <th>ราคา</th>
                    <th>รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item, index) => (
                    <tr key={`${order.id}-item-${index}`}>
                      <td>{item.product_name}</td>
                      <td>
                        {[item.color, item.size].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td>{item.quantity}</td>
                      <td>฿{formatMoney(item.price)}</td>
                      <td>฿{formatMoney(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-end">
              <p className="mb-5 text-muted small">
                มูลค่าก่อน VAT: ฿{formatMoney(vat.amountBeforeVat)} | VAT {VAT_PERCENT}%: ฿{formatMoney(vat.vatAmount)}
              </p>
              <h5 className="mb-0">ยอดรวม (รวม VAT): ฿{formatMoney(order.total)}</h5>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="tp-btn-border" onClick={onClose}>
              ปิด
            </button>
            <button type="button" className="tp-btn" onClick={() => printOrderReceipt(order)}>
              พิมพ์ใบเสร็จ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
