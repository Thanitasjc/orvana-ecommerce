"use client";

import { AdminShippingSection } from "@/components/admin/AdminShippingSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminShippingPage() {
  return (
    <AdminShell title="จัดส่ง" subtitle="จัดการวิธีจัดส่งและค่าขนส่งสำหรับร้านออนไลน์">
      <AdminShippingSection />
    </AdminShell>
  );
}
