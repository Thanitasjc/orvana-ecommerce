"use client";

import { AdminOrdersSection } from "@/components/admin/AdminOrdersSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminOrdersPage() {
  return (
    <AdminShell title="ออเดอร์" subtitle="จัดการออเดอร์จากเว็บและ POS">
      <AdminOrdersSection />
    </AdminShell>
  );
}
