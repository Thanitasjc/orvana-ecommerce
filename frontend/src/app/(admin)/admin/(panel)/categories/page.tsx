"use client";

import { AdminCategoriesSection } from "@/components/admin/AdminCategoriesSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCategoriesPage() {
  return (
    <AdminShell title="หมวดหมู่สินค้า" subtitle="จัดการหมวดหมู่สำหรับร้านออนไลน์และ POS">
      <AdminCategoriesSection />
    </AdminShell>
  );
}
