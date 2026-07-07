"use client";

import { AdminPaymentsSection } from "@/components/admin/AdminPaymentsSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPaymentsPage() {
  return (
    <AdminShell title="ชำระเงิน" subtitle="จัดการวิธีชำระเงินสำหรับร้านออนไลน์">
      <AdminPaymentsSection />
    </AdminShell>
  );
}
