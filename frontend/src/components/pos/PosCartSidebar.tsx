"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { getPosSessionId } from "@/lib/pos/session";
import type { PosCustomer } from "@/lib/api/pos";
import { PosCouponScannerModal } from "@/components/pos/PosCouponScannerModal";
import { PosMemberSelector } from "@/components/pos/PosMemberSelector";
import { PosTotalsBreakdown } from "@/components/pos/PosTotalsBreakdown";
import type { PosCartItem, PosCouponApplyOptions } from "@/components/pos/usePosCart";
import type { VatBreakdown } from "@/lib/pricing/vat";
import { formatBaht } from "@/lib/pricing/vat";

type PosCartSidebarProps = {
  items: PosCartItem[];
  itemCount: number;
  totals: VatBreakdown;
  appliedCoupon: { code: string; name: string; discount: number } | null;
  couponError: string | null;
  couponLoading: boolean;
  selectedCustomer: PosCustomer | null;
  onSelectCustomer: (customer: PosCustomer | null) => void;
  onAddCustomer: () => void;
  onDiscountChange: (value: number) => void;
  onApplyCoupon: (code: string, options?: PosCouponApplyOptions) => Promise<boolean>;
  onRemoveCoupon: () => void;
  onUpdateQuantity: (variationId: number, quantity: number) => void;
  onRemoveItem: (variationId: number) => void;
  onCheckout: () => void;
};

export function PosCartSidebar({
  items,
  itemCount,
  totals,
  appliedCoupon,
  couponError,
  couponLoading,
  selectedCustomer,
  onSelectCustomer,
  onAddCustomer,
  onDiscountChange,
  onApplyCoupon,
  onRemoveCoupon,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: PosCartSidebarProps) {
  const [couponInput, setCouponInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const couponInputRef = useRef<HTMLInputElement>(null);

  const couponApplyOptions = {
    customerId: selectedCustomer?.id,
    posSessionId: getPosSessionId(),
  };

  const submitCoupon = useCallback(
    async (rawCode: string) => {
      const applied = await onApplyCoupon(rawCode, couponApplyOptions);
      if (applied) {
        setCouponInput("");
      }
      return applied;
    },
    [onApplyCoupon, selectedCustomer?.id],
  );

  useEffect(() => {
    if (items.length > 0 && !appliedCoupon && couponInputRef.current) {
      couponInputRef.current.focus();
    }
  }, [appliedCoupon, items.length]);

  async function handleCouponSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCoupon(couponInput);
  }

  async function handleScannedCode(code: string) {
    setCouponInput(code);
    await submitCoupon(code);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            ค้นหา/เลือก สมาชิกสะสมแต้ม
          </label>
          <button
            type="button"
            onClick={onAddCustomer}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            + เพิ่มสมาชิกใหม่
          </button>
        </div>
        <PosMemberSelector selected={selectedCustomer} onSelect={onSelectCustomer} />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <h4 className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>รายการตะกร้าหน้าร้าน</span>
          <span>({itemCount} ชิ้น)</span>
        </h4>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="mb-2 text-3xl">🛍️</div>
            <p className="text-sm">ตะกร้าว่างเปล่า กดเลือกสินค้าเพื่อเริ่มการขาย</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.variationId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h6 className="text-sm font-bold text-slate-900">{item.name}</h6>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">สี: {item.color}</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">ไซส์: {item.size}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.variationId)}
                  className="text-xs text-slate-400 hover:text-rose-500"
                >
                  ลบ
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2">
                <span className="text-sm font-bold text-slate-800">
                  ฿{(item.price * item.quantity).toLocaleString("th-TH")}
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={item.quantity <= 1}
                    onClick={() => onUpdateQuantity(item.variationId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-slate-800">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => onUpdateQuantity(item.variationId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4">
        <form onSubmit={(event) => void handleCouponSubmit(event)} className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">รหัสคูปอง</label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <span className="font-medium text-emerald-800">
                {appliedCoupon.code} — −฿{formatBaht(appliedCoupon.discount)}
              </span>
              <button type="button" onClick={onRemoveCoupon} className="text-xs text-rose-600 hover:underline">
                ลบ
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  ref={couponInputRef}
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="SAVE10"
                  autoComplete="off"
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm uppercase focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  disabled={couponLoading}
                  title="สแกน QR / บาร์โค้ดจากกล้อง"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  📷
                </button>
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="rounded-md bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                >
                  {couponLoading ? "..." : "ใช้"}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                ปืนยิงบาร์โค้ด: โฟกัสช่องนี้แล้วยิง — ใช้คูปองอัตโนมัติเมื่อกด Enter
              </p>
            </div>
          )}
          {couponError ? <p className="text-xs text-rose-600">{couponError}</p> : null}
        </form>

        {!appliedCoupon ? (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>ส่วนลดหน้าร้าน (บาท)</span>
            <input
              type="number"
              min={0}
              value={totals.discount}
              onChange={(event) => onDiscountChange(Math.max(0, Number(event.target.value) || 0))}
              className="w-20 rounded-md border border-slate-200 px-2 py-1 text-right text-sm font-bold focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ) : null}

        <PosTotalsBreakdown totals={totals} emphasizeTotal />

        <p className="text-[10px] text-slate-400">* ราคาสินค้าและยอดชำระรวม VAT 7% แล้ว</p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-base font-bold text-slate-800">เก็บเงินลูกค้า</span>
          <span className="text-2xl font-black text-emerald-600">฿{formatBaht(totals.total)}</span>
        </div>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onCheckout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ดำเนินการชำระเงิน
        </button>
      </div>

      <PosCouponScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(code) => void handleScannedCode(code)}
      />
    </div>
  );
}
