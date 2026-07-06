"use client";

import { AdminBlogsSection } from "@/components/admin/AdminBlogsSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminBlogsPage() {
  return (
    <AdminShell title="บทความ / Blog" subtitle="จัดการบทความหน้าร้าน — รายการและรายละเอียด">
      <AdminBlogsSection />
    </AdminShell>
  );
}
