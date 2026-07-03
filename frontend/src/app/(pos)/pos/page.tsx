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
import { deleteCookie, getCookie, STAFF_ROLE_KEY, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";
import { calculatePosTotals } from "@/lib/pos/pricing";

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

  const cart = usePosCart();

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
    const snapshotTotals = { ...cart.totals };
    const snapshotTotal = snapshotTotals.total;

    try {
      const res = await submitPosCheckout(
        {
          items: cart.items.map((item) => ({
            variation_id: item.variationId,
            quantity: item.quantity,
          })),
          customer_id: selectedCustomer?.id,
          discount: cart.discount,
          payment_method: payload.paymentMethod,
        },
        token,
      );

      const order = res.data;
      const paid = payload.amountPaid ?? snapshotTotal;
      const change = payload.paymentMethod === "เงินสด" ? Math.max(0, paid - snapshotTotal) : 0;
      const orderTotal = Number(order.total);
      const receiptTotals = calculatePosTotals(snapshotTotals.subtotal, order.discount ?? snapshotTotals.discount);

      setReceipt({
        orderNumber: order.order_number,
        createdAt: order.created_at
          ? new Date(order.created_at).toLocaleString("th-TH")
          : new Date().toLocaleString("th-TH"),
        customerName: order.customer?.name ?? selectedCustomer?.name ?? "Walk-in",
        paymentMethod: order.payment_method ?? payload.paymentMethod,
        items: snapshotItems,
        discount: order.discount ?? snapshotTotals.discount,
        subtotal: snapshotTotals.subtotal,
        amountBeforeVat: receiptTotals.amountBeforeVat,
        vatAmount: receiptTotals.vatAmount,
        total: orderTotal,
        amountPaid: payload.paymentMethod === "เงินสด" ? paid : undefined,
        change: payload.paymentMethod === "เงินสด" ? change : undefined,
        pointsEarned: selectedCustomer ? Math.floor(snapshotTotal / 100) : undefined,
      });

      cart.clearCart();
      setSelectedCustomer(null);
      setShowCheckout(false);
      await loadProducts();
    } catch (error) {
      let message = "ชำระเงินไม่สำเร็จ";
      if (error && typeof error === "object") {
        const apiError = error as { message?: string; errors?: Record<string, string[]> };
        message = apiError.errors?.stock?.[0] ?? apiError.message ?? message;
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

      <div className="flex max-h-[calc(100vh-80px)] flex-1 flex-col overflow-hidden lg:flex-row">
        <PosProductGrid
          products={products}
          categories={categories}
          search={search}
          categoryId={categoryId}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
          onAddProduct={handleAddProduct}
        />

        <PosCartSidebar
          items={cart.items}
          itemCount={cart.itemCount}
          totals={cart.totals}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          onAddCustomer={() => setShowAddCustomer(true)}
          onDiscountChange={cart.setDiscount}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onCheckout={() => {
            setCheckoutError(null);
            setShowCheckout(true);
          }}
        />
      </div>

      <PosCheckoutModal
        open={showCheckout}
        totals={cart.totals}
        customer={selectedCustomer}
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
