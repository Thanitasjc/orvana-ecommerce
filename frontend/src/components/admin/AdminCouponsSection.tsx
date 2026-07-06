"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminCouponFormModal } from "@/components/admin/AdminCouponFormModal";
import { AdminCouponQrModal } from "@/components/admin/AdminCouponQrModal";
import { AdminCouponUsagesModal } from "@/components/admin/AdminCouponUsagesModal";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  fetchCouponCodes,
  fetchCouponReportSummary,
  updateAdminCoupon,
  type AdminCoupon,
  type AdminCouponPayload,
  type CouponReportRow,
} from "@/lib/api/adminCoupons";
import { formatCouponSummary, formatCouponTypeLabel } from "@/lib/coupons/constants";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

function parseApiError(err: unknown) {
  if (err && typeof err === "object") {
    const apiError = err as { message?: string; errors?: Record<string, string[]> };
    const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
    return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
  }
  return "ดำเนินการไม่สำเร็จ";
}

const channelLabels: Record<string, string> = {
  both: "ออนไลน์ + POS",
  online: "ออนไลน์",
  pos: "หน้าร้าน",
};

type AdminCouponsTab = "list" | "reports";

export function AdminCouponsSection() {
  const [activeTab, setActiveTab] = useState<AdminCouponsTab>("list");
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [reports, setReports] = useState<CouponReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [qrCoupon, setQrCoupon] = useState<AdminCoupon | null>(null);
  const [usageCoupon, setUsageCoupon] = useState<AdminCoupon | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const loadCoupons = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminCoupons(token, { search: search || undefined, page });
      setCoupons(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadReports = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchCouponReportSummary(token);
      setReports(response.data ?? []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "list") {
      void loadCoupons();
    } else {
      void loadReports();
    }
  }, [activeTab, loadCoupons, loadReports]);

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3000);
  }

  function openCreateForm() {
    setEditingCoupon(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCoupon(null);
    setFormError(null);
  }

  async function openQrModal(coupon: AdminCoupon) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setQrCoupon(coupon);
    setQrLoading(true);
    setQrUrl(null);
    setBarcodeUrl(null);

    try {
      const response = await fetchCouponCodes(token, coupon.id);
      setQrUrl(response.data.qr_url);
      setBarcodeUrl(response.data.barcode_url);
    } catch {
      setError("โหลด QR/Barcode ไม่สำเร็จ");
      setQrCoupon(null);
    } finally {
      setQrLoading(false);
    }
  }

  async function handleSubmit(payload: AdminCouponPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingCoupon) {
        await updateAdminCoupon(token, editingCoupon.id, payload);
        showMessage(`แก้ไขคูปอง "${payload.code}" แล้ว`);
      } else {
        await createAdminCoupon(token, payload);
        showMessage(`เพิ่มคูปอง "${payload.code}" แล้ว`);
      }

      closeForm();
      await loadCoupons();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(coupon: AdminCoupon) {
    const confirmed = window.confirm(`ลบคูปอง "${coupon.code}" ใช่หรือไม่?`);
    if (!confirmed) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(coupon.id);

    try {
      await deleteAdminCoupon(token, coupon.id);
      showMessage(`ลบ ${coupon.code} แล้ว`);
      await loadCoupons();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "list" ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300"
          }`}
        >
          จัดการคูปอง
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            activeTab === "reports" ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300"
          }`}
        >
          รายงานการใช้งาน
        </button>
      </div>

      <AdminPanel
        title={activeTab === "list" ? "คูปองส่วนลด" : "รายงานคูปอง"}
        action={
          activeTab === "list" ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              + เพิ่มคูปอง
            </button>
          ) : null
        }
      >
        {activeTab === "list" ? (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ค้นหารหัสหรือชื่อคูปอง..."
              className="min-w-[220px] w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        ) : (
          <p className="mb-4 text-sm text-slate-400">สรุปยอดส่วนลดและจำนวนครั้งที่ใช้คูปอง</p>
        )}

        {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
        {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {!loading && !error && activeTab === "list" ? (
          <>
            <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} คูปอง</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">รหัส</th>
                    <th className="px-3 py-2 font-medium">ชื่อ / ประเภท</th>
                    <th className="px-3 py-2 font-medium">เงื่อนไข</th>
                    <th className="px-3 py-2 font-medium">ใช้แล้ว</th>
                    <th className="px-3 py-2 font-medium">ช่องทาง</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        ไม่พบคูปอง
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3 font-mono font-medium text-white">{coupon.code}</td>
                        <td className="px-3 py-3">
                          <div className="text-slate-200">{coupon.name}</div>
                          <div className="text-xs text-slate-500">{formatCouponTypeLabel(coupon.type)}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-300">{formatCouponSummary(coupon)}</td>
                        <td className="px-3 py-3 text-slate-300">
                          {coupon.used_count}
                          {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                          {coupon.per_user_limit ? (
                            <div className="text-xs text-slate-500">{coupon.per_user_limit}/user</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 text-slate-300">{channelLabels[coupon.channel] ?? coupon.channel}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              coupon.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {coupon.is_active ? "เปิด" : "ปิด"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setUsageCoupon(coupon)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Log
                            </button>
                            <button
                              type="button"
                              onClick={() => void openQrModal(coupon)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              QR
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm(coupon)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === coupon.id}
                              onClick={() => void handleDelete(coupon)}
                              className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
                            >
                              ลบ
                            </button>
                          </div>
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

        {!loading && !error && activeTab === "reports" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">รหัส</th>
                  <th className="px-3 py-2 font-medium">ชื่อ</th>
                  <th className="px-3 py-2 font-medium">ใช้แล้ว</th>
                  <th className="px-3 py-2 font-medium">ส่วนลดรวม</th>
                  <th className="px-3 py-2 font-medium">ส่งฟรีรวม</th>
                  <th className="px-3 py-2 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800">
                    <td className="px-3 py-3 font-mono text-white">{row.code}</td>
                    <td className="px-3 py-3 text-slate-300">{row.name}</td>
                    <td className="px-3 py-3 text-slate-300">
                      {row.used_count}
                      {row.max_uses ? ` / ${row.max_uses}` : ""}
                    </td>
                    <td className="px-3 py-3 text-emerald-300">฿{row.total_discount.toLocaleString("th-TH")}</td>
                    <td className="px-3 py-3 text-blue-300">฿{row.total_shipping_saved.toLocaleString("th-TH")}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          const match = coupons.find((coupon) => coupon.id === row.id);
                          if (match) {
                            setUsageCoupon(match);
                            return;
                          }
                          setUsageCoupon({
                            id: row.id,
                            code: row.code,
                            name: row.name,
                            type: row.type,
                            apply_to: "order",
                            customer_rule: "all",
                            value: 0,
                            min_order: 0,
                            max_uses: row.max_uses,
                            per_user_limit: null,
                            used_count: row.used_count,
                            is_active: row.is_active,
                            channel: "both",
                          });
                        }}
                        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        ดู Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>

      <AdminCouponFormModal
        open={formOpen}
        coupon={editingCoupon}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <AdminCouponQrModal
        open={Boolean(qrCoupon)}
        coupon={qrCoupon}
        qrUrl={qrUrl}
        barcodeUrl={barcodeUrl}
        loading={qrLoading}
        onClose={() => {
          setQrCoupon(null);
          setQrUrl(null);
          setBarcodeUrl(null);
        }}
      />

      <AdminCouponUsagesModal
        open={Boolean(usageCoupon)}
        coupon={usageCoupon}
        onClose={() => setUsageCoupon(null)}
      />
    </>
  );
}
