"use client";

import { AdminCouponsSection } from "@/components/admin/AdminCouponsSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCouponsPage() {
  return (
    <AdminShell title="คูปองส่วนลด" subtitle="จัดการรหัสคูปองสำหรับออนไลน์และหน้าร้าน (POS)">
      <AdminCouponsSection />
    </AdminShell>
  );
}
