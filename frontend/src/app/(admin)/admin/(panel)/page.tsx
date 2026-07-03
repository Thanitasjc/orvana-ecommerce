"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_MODULES, ADMIN_QUICK_LINKS } from "@/components/admin/admin-nav";
import { AdminRecentMembers } from "@/components/admin/AdminMembersSection";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { fetchAdminDashboard, type AdminDashboard } from "@/lib/api/admin";
import { getCookie, STAFF_TOKEN_KEY } from "@/lib/auth/cookies";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    const token = getCookie(STAFF_TOKEN_KEY);
    if (!token) return;
    fetchAdminDashboard(token)
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <AdminShell title="แดชบอร์ด" subtitle="ภาพรวมธุรกิจ AESTHETE Omnichannel">
      {stats ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="ออเดอร์วันนี้" value={String(stats.orders_today)} />
            <AdminStatCard label="ออเดอร์เว็บ" value={String(stats.online_orders_today)} accent="green" />
            <AdminStatCard label="ออเดอร์ POS" value={String(stats.pos_orders_today)} accent="amber" />
            <AdminStatCard label="สมาชิกทั้งหมด" value={String(stats.customers_count)} accent="rose" />
            <AdminStatCard label="รายได้วันนี้" value={`฿${stats.revenue_today.toLocaleString("th-TH")}`} />
            <AdminStatCard label="กำไรวันนี้" value={`฿${stats.profit_today.toLocaleString("th-TH")}`} accent="green" />
            <AdminStatCard label="จำนวนสินค้า" value={String(stats.products_count)} />
            <AdminStatCard label="สต็อกต่ำ (<5)" value={String(stats.low_stock_count)} accent="amber" />
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-2">
            <AdminPanel title="ลิงก์ด่วน">
              <div className="grid gap-3 sm:grid-cols-2">
                {ADMIN_QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </AdminPanel>

            <AdminRecentMembers members={stats.recent_customers} />
          </div>

          <AdminPanel title="สถานะโมดูลในโปรเจกต์" className="mb-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ADMIN_MODULES.map((module) => (
                <div key={module.name} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{module.name}</p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      Active
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 w-full rounded-full bg-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </>
      ) : (
        <p className="text-slate-400">กำลังโหลดแดชบอร์ด...</p>
      )}
    </AdminShell>
  );
}
