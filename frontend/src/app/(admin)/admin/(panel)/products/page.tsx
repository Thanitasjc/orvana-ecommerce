"use client";

import { AdminProductsSection } from "@/components/admin/AdminProductsSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminProductsPage() {
  return (
    <AdminShell title="สินค้า" subtitle="จัดการสินค้าและสต็อก — ใช้ร่วมกับร้านออนไลน์และ POS">
      <AdminProductsSection />
    </AdminShell>
  );
}
