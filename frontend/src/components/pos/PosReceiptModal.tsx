"use client";

import type { PosCartItem } from "@/components/pos/usePosCart";
import { formatBaht, VAT_PERCENT } from "@/lib/pricing/vat";

export type PosReceiptData = {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  paymentMethod: string;
  items: PosCartItem[];
  discount: number;
  subtotal: number;
  amountBeforeVat: number;
  vatAmount: number;
  total: number;
  amountPaid?: number;
  change?: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
};

type PosReceiptModalProps = {
  receipt: PosReceiptData | null;
  onClose: () => void;
};

export function PosReceiptModal({ receipt, onClose }: PosReceiptModalProps) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div
        id="pos-receipt-print"
        className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-150 bg-white p-6 font-mono text-xs shadow-2xl"
      >
        <div className="border-b border-dashed border-slate-300 pb-4 text-center">
          <h5 className="text-base font-black tracking-widest text-slate-900">AESTHETE</h5>
          <p className="text-[9px] text-slate-400">ห้างสรรพสินค้าแฟชั่นชั้นนำ</p>
          <p className="mt-1 text-[9px] text-slate-400">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
        </div>

        <div className="space-y-1 text-[10px] text-slate-500">
          <div className="flex justify-between">
            <span>เลขที่ใบอ้างอิง:</span>
            <span className="font-bold text-slate-800">{receipt.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>วันเวลาทำรายการ:</span>
            <span>{receipt.createdAt}</span>
          </div>
          <div className="flex justify-between">
            <span>ลูกค้าผู้ซื้อ:</span>
            <span>{receipt.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>ช่องทางชำระ:</span>
            <span>{receipt.paymentMethod}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-dashed border-slate-300 pt-3">
          {receipt.items.map((item) => (
            <div key={item.variationId} className="flex justify-between text-slate-800">
              <div className="max-w-[70%]">
                <p className="truncate font-bold">{item.name}</p>
                <p className="text-[9px] text-slate-400">
                  ({item.color} / {item.size}) x {item.quantity}
                </p>
              </div>
              <span className="font-bold">฿{(item.price * item.quantity).toLocaleString("th-TH")}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-dashed border-slate-300 pt-3 text-slate-700">
          {receipt.discount > 0 ? (
            <div className="flex justify-between font-bold text-rose-500">
              <span>ส่วนลดพิเศษ:</span>
              <span>-฿{formatBaht(receipt.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[10px]">
            <span>มูลค่าก่อน VAT:</span>
            <span>฿{formatBaht(receipt.amountBeforeVat)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>VAT {VAT_PERCENT}%:</span>
            <span>฿{formatBaht(receipt.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900">
            <span>รวมสุทธิ (รวม VAT):</span>
            <span>฿{formatBaht(receipt.total)}</span>
          </div>
          {receipt.paymentMethod === "เงินสด" && receipt.amountPaid !== undefined ? (
            <>
              <div className="flex justify-between text-[10px]">
                <span>ยอดรับชำระ:</span>
                <span>฿{receipt.amountPaid.toLocaleString("th-TH")}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-600">
                <span>เงินทอน:</span>
                <span>฿{(receipt.change ?? 0).toLocaleString("th-TH")}</span>
              </div>
            </>
          ) : null}
          {receipt.pointsRedeemed ? (
            <div className="flex justify-between text-[10px] text-indigo-700">
              <span>ใช้แต้ม:</span>
              <span>-{receipt.pointsRedeemed} แต้ม</span>
            </div>
          ) : null}
          {receipt.pointsEarned ? (
            <div className="flex justify-between text-[10px] text-emerald-700">
              <span>แต้มสะสม:</span>
              <span>+{receipt.pointsEarned} แต้ม</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-dashed border-slate-300 pt-4 text-center text-[10px] text-slate-400">
          <p>ขอบคุณที่วางใจเลือกช้อปสินค้า AESTHETE</p>
          <p className="mt-1">ข้อมูลยอดขายและแต้มสมาชิกเชื่อมต่อเข้าสู่ระบบส่วนกลางแล้ว</p>
        </div>

        <div className="flex gap-2 pt-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-lg border border-slate-200 py-2 font-bold text-slate-700 hover:bg-slate-50"
          >
            สั่งพิมพ์ (Print)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-950 py-2 font-bold text-white"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
