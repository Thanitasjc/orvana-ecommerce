"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PosAddCustomerModal } from "@/components/pos/PosAddCustomerModal";
import { PosCartSidebar } from "@/components/pos/PosCartSidebar";
import { PosCheckoutModal } from "@/components/pos/PosCheckoutModal";
import { PosProductGrid } from "@/components/pos/PosProductGrid";
import { PosReceiptModal, type PosReceiptData } from "@/components/pos/PosReceiptModal";
import { PosVariationPickerModal } from "@/components/pos/PosVariationPickerModal";
import { usePosCart } from "@/components/pos/usePosCart";
import {
  fetchCategories,
  fetchPosProducts,
  submitPosCheckout,
  type Category,
  type PosCustomer,
  type PosProduct,
  type PosVariation,
} from "@/lib/api/pos";
import { getPosSessionId } from "@/lib/pos/session";
import { deleteCookie, getCookie, STAFF_ROLE_KEY, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";
import { calculatePosTotals } from "@/lib/pos/pricing";
import { fetchLoyaltySettings } from "@/lib/loyalty/api";
import { calcLoyaltyCheckout } from "@/lib/loyalty/calc";
import type { LoyaltySettings } from "@/lib/loyalty/types";
import { DEFAULT_LOYALTY_SETTINGS } from "@/lib/loyalty/types";
import { calculateTotalsWithDiscount } from "@/lib/pricing/vat";

export default function PosPage() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<PosReceiptData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pickerProduct, setPickerProduct] = useState<PosProduct | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(DEFAULT_LOYALTY_SETTINGS);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");

  const cart = usePosCart();

  const loyaltyCheckout = calcLoyaltyCheckout(
    cart.subtotal,
    cart.discount,
    pointsToRedeem,
    selectedCustomer?.points ?? 0,
    loyaltySettings,
  );

  const checkoutTotals = calculateTotalsWithDiscount(
    cart.subtotal,
    cart.discount + loyaltyCheckout.pointsDiscount,
  );

  const loadProducts = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    try {
      const res = await fetchPosProducts(token, {
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
      });
      setProducts(res.data ?? []);
    } catch {
      setToast("โหลดสินค้าไม่สำเร็จ");
    }
  }, [search, categoryId]);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchLoyaltySettings()
      .then((res) => setLoyaltySettings(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setPointsToRedeem(0);
  }, [selectedCustomer?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadProducts, search]);

  function logout() {
    deleteCookie(STAFF_TOKEN_KEY);
    deleteCookie(STAFF_ROLE_KEY);
    window.location.href = "/pos/login";
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function handleAddProduct(product: PosProduct) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    let freshProduct = product;

    try {
      const res = await fetchPosProducts(token, {
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
      });
      setProducts(res.data ?? []);
      freshProduct = res.data?.find((item) => item.id === product.id) ?? product;
    } catch {
      showToast("โหลดข้อมูลสินค้าล่าสุดไม่สำเร็จ");
    }

    const inStock = freshProduct.variations.filter((variation) => variation.stock > 0);
    if (inStock.length === 0) {
      showToast("สินค้าหมดสต็อก");
      return;
    }

    setPickerProduct(freshProduct);
  }

  function handleVariationConfirm(variation: PosVariation) {
    if (!pickerProduct) return;

    const added = cart.addVariation(pickerProduct, variation);
    if (!added) {
      showToast("สินค้าหมดสต็อก");
      return;
    }

    showToast(`เพิ่ม ${pickerProduct.name} (${variation.color}/${variation.size}) ลงตะกร้าแล้ว`);
  }

  async function handleCheckoutConfirm(payload: { paymentMethod: string; amountPaid?: number }) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setCheckoutError(null);

    const snapshotItems = [...cart.items];
    const snapshotTotals = { ...checkoutTotals };
    const snapshotTotal = snapshotTotals.total;
    const snapshotPointsToRedeem = loyaltyCheckout.pointsUsed;

    try {
      const checkoutPayload = {
        items: cart.items.map((item) => ({
          variation_id: item.variationId,
          quantity: item.quantity,
        })),
        customer_id: selectedCustomer?.id,
        payment_method: payload.paymentMethod,
        pos_session_id: getPosSessionId(),
        points_to_redeem: snapshotPointsToRedeem > 0 ? snapshotPointsToRedeem : undefined,
        ...(cart.appliedCoupon
          ? { coupon_code: cart.appliedCoupon.code }
          : { discount: cart.discount }),
      };

      const res = await submitPosCheckout(checkoutPayload, token);

      const order = res.data;
      const paid = payload.amountPaid ?? snapshotTotal;
      const change = payload.paymentMethod === "เงินสด" ? Math.max(0, paid - snapshotTotal) : 0;
      const orderTotal = Number(order.total);
      const combinedDiscount = (order.discount ?? snapshotTotals.discount) + (order.points_discount ?? 0);
      const receiptTotals = calculatePosTotals(snapshotTotals.subtotal, combinedDiscount);

      setReceipt({
        orderNumber: order.order_number,
        createdAt: order.created_at
          ? new Date(order.created_at).toLocaleString("th-TH")
          : new Date().toLocaleString("th-TH"),
        customerName: order.customer?.name ?? selectedCustomer?.name ?? "Walk-in",
        paymentMethod: order.payment_method ?? payload.paymentMethod,
        items: snapshotItems,
        discount: combinedDiscount,
        subtotal: snapshotTotals.subtotal,
        amountBeforeVat: receiptTotals.amountBeforeVat,
        vatAmount: receiptTotals.vatAmount,
        total: orderTotal,
        amountPaid: payload.paymentMethod === "เงินสด" ? paid : undefined,
        change: payload.paymentMethod === "เงินสด" ? change : undefined,
        pointsEarned: selectedCustomer ? (order.points_earned ?? loyaltyCheckout.pointsEarned) : undefined,
        pointsRedeemed: order.points_redeemed ?? undefined,
      });

      cart.clearCart();
      setSelectedCustomer(null);
      setPointsToRedeem(0);
      setShowCheckout(false);
      await loadProducts();
    } catch (error) {
      let message = "ชำระเงินไม่สำเร็จ";
      if (error && typeof error === "object") {
        const apiError = error as { message?: string; errors?: Record<string, string[]> };
        message = apiError.errors?.points_to_redeem?.[0] ?? apiError.errors?.stock?.[0] ?? apiError.message ?? message;
      }
      setCheckoutError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function closeReceipt() {
    setReceipt(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">AESTHETE POS</h1>
          <p className="text-sm text-emerald-700">ขายหน้าร้าน — ตัดสต็อกคลังกลาง</p>
        </div>
        <div className="flex items-center gap-3">
          {toast ? <span className="text-sm text-amber-700">{toast}</span> : null}
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            ร้านออนไลน์
          </Link>
          <button type="button" onClick={logout} className="rounded-lg border px-3 py-1.5 text-sm">
            ออกจากระบบ
          </button>
        </div>
      </header>

      <nav className="flex border-b border-slate-200 bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("products")}
          className={`flex-1 py-3 text-sm font-bold transition ${
            mobileTab === "products"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-slate-500"
          }`}
        >
          สินค้า
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-bold transition ${
            mobileTab === "cart"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-slate-500"
          }`}
        >
          ตะกร้า
          {cart.itemCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {cart.itemCount}
            </span>
          ) : null}
        </button>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div
          className={`min-h-0 flex-1 flex-col overflow-hidden ${
            mobileTab === "products" ? "flex" : "hidden lg:flex"
          }`}
        >
          <PosProductGrid
            products={products}
            categories={categories}
            search={search}
            categoryId={categoryId}
            onSearchChange={setSearch}
            onCategoryChange={setCategoryId}
            onAddProduct={handleAddProduct}
          />
        </div>

        <div
          className={`min-h-0 flex-col overflow-hidden lg:flex lg:w-[420px] lg:shrink-0 ${
            mobileTab === "cart" ? "flex flex-1" : "hidden"
          }`}
        >
          <PosCartSidebar
            items={cart.items}
            itemCount={cart.itemCount}
            totals={cart.totals}
            appliedCoupon={cart.appliedCoupon}
            couponError={cart.couponError}
            couponLoading={cart.couponLoading}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            onAddCustomer={() => setShowAddCustomer(true)}
            onDiscountChange={cart.setDiscount}
            onApplyCoupon={cart.applyCoupon}
            onRemoveCoupon={cart.removeCoupon}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
            onCheckout={() => {
              setCheckoutError(null);
              setShowCheckout(true);
            }}
          />
        </div>
      </div>

      <PosCheckoutModal
        open={showCheckout}
        totals={checkoutTotals}
        customer={selectedCustomer}
        loyaltySettings={loyaltySettings}
        pointsToRedeem={pointsToRedeem}
        pointsDiscount={loyaltyCheckout.pointsDiscount}
        pointsEarned={loyaltyCheckout.pointsEarned}
        onPointsToRedeemChange={setPointsToRedeem}
        submitting={submitting}
        error={checkoutError}
        onClose={() => setShowCheckout(false)}
        onConfirm={handleCheckoutConfirm}
      />

      <PosVariationPickerModal
        product={pickerProduct}
        onClose={() => setPickerProduct(null)}
        onConfirm={handleVariationConfirm}
      />

      <PosAddCustomerModal
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={(customer) => {
          setSelectedCustomer(customer);
          showToast(`เพิ่มสมาชิก ${customer.name} แล้ว`);
        }}
      />

      <PosReceiptModal receipt={receipt} onClose={closeReceipt} />
    </div>
  );
}
