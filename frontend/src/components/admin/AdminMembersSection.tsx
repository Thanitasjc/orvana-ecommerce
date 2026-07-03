"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminMemberFormModal } from "@/components/admin/AdminMemberFormModal";
import { AdminPanel } from "@/components/admin/AdminPanel";
import {
  createAdminCustomer,
  deleteAdminCustomer,
  fetchAdminCustomers,
  updateAdminCustomer,
  type AdminCustomer,
  type AdminCustomerPayload,
} from "@/lib/api/admin";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

const TIER_OPTIONS = ["", "Silver", "Gold", "Platinum"];

function tierBadge(tier?: string | null) {
  const value = (tier ?? "Silver").toLowerCase();
  if (value === "platinum") return "bg-indigo-500/20 text-indigo-300";
  if (value === "gold") return "bg-amber-500/20 text-amber-300";
  return "bg-slate-500/20 text-slate-300";
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

export function AdminMembersSection() {
  const [members, setMembers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminCustomer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMembers = useCallback(async () => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminCustomers(token, {
        search: search || undefined,
        tier: tier || undefined,
        page,
      });
      setMembers(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? res.data.length);
    } catch {
      setError("โหลดรายชื่อสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [page, search, tier]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadMembers, search]);

  useEffect(() => {
    setPage(1);
  }, [search, tier]);

  function openCreateForm() {
    setEditingMember(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(member: AdminCustomer) {
    setEditingMember(member);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
    setFormError(null);
  }

  function showMessage(message: string) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  }

  function parseApiError(err: unknown) {
    if (err && typeof err === "object") {
      const apiError = err as { message?: string; errors?: Record<string, string[]> };
      const firstFieldError = Object.values(apiError.errors ?? {})[0]?.[0];
      return firstFieldError ?? apiError.message ?? "ดำเนินการไม่สำเร็จ";
    }
    return "ดำเนินการไม่สำเร็จ";
  }

  async function handleSubmit(payload: AdminCustomerPayload) {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingMember) {
        await updateAdminCustomer(editingMember.id, payload, token);
        showMessage(`แก้ไข ${payload.name} แล้ว`);
      } else {
        await createAdminCustomer(payload, token);
        showMessage(`เพิ่มสมาชิก ${payload.name} แล้ว`);
      }

      closeForm();
      await loadMembers();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(member: AdminCustomer) {
    const confirmed = window.confirm(`ลบสมาชิก "${member.name}" ใช่หรือไม่?`);
    if (!confirmed) return;

    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;

    setDeletingId(member.id);

    try {
      await deleteAdminCustomer(member.id, token);
      showMessage(`ลบ ${member.name} แล้ว`);
      await loadMembers();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPanel
        title="สมาชิกทั้งหมด"
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            + เพิ่มสมาชิก
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อ เบอร์ อีเมล..."
            className="min-w-[220px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={tier}
            onChange={(event) => setTier(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {TIER_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option ? `${option} Tier` : "ทุกระดับ"}
              </option>
            ))}
          </select>
        </div>

        {actionMessage ? <p className="mb-3 text-sm text-emerald-400">{actionMessage}</p> : null}
        {loading ? <p className="text-sm text-slate-400">กำลังโหลด...</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {!loading && !error ? (
          <>
            <p className="mb-3 text-sm text-slate-400">ทั้งหมด {total} สมาชิก</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">ชื่อ</th>
                    <th className="px-3 py-2 font-medium">อีเมล</th>
                    <th className="px-3 py-2 font-medium">เบอร์โทร</th>
                    <th className="px-3 py-2 font-medium">ระดับ</th>
                    <th className="px-3 py-2 font-medium">แต้ม</th>
                    <th className="px-3 py-2 font-medium">สมัครเมื่อ</th>
                    <th className="px-3 py-2 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        ไม่พบสมาชิก
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3 font-medium text-white">{member.name}</td>
                        <td className="px-3 py-3 text-slate-300">{member.email}</td>
                        <td className="px-3 py-3 text-slate-300">{member.phone ?? "-"}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tierBadge(member.tier)}`}>
                            {member.tier ?? "Silver"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-emerald-300">{member.points ?? 0}</td>
                        <td className="px-3 py-3 text-slate-400">{formatDate(member.created_at)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(member)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === member.id}
                              onClick={() => void handleDelete(member)}
                              className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
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
      </AdminPanel>

      <AdminMemberFormModal
        open={formOpen}
        member={editingMember}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export function AdminRecentMembers({ members }: { members: AdminCustomer[] }) {
  return (
    <AdminPanel
      title="สมาชิกที่เพิ่มล่าสุด"
      action={
        <Link href="/admin/members" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
          จัดการสมาชิก →
        </Link>
      }
    >
      {members.length === 0 ? (
        <p className="text-sm text-slate-400">ยังไม่มีสมาชิก</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
              <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-300">
                {member.tier ?? "Silver"}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
