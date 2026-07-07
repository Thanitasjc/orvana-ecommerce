"use client";

import { AdminLoyaltySection } from "@/components/admin/AdminLoyaltySection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLoyaltyPage() {
  return (
    <AdminShell title="แต้มสะสม / Loyalty" subtitle="ตั้งค่าสะสมและแลกแต้ม — ใช้ได้ทั้ง POS และร้านออนไลน์">
      <AdminLoyaltySection />
    </AdminShell>
  );
}
