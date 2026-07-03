"use client";

import { AdminCmsEditor } from "@/components/admin/AdminCmsEditor";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCmsPage() {
  return (
    <AdminShell title="CMS หน้าร้าน" subtitle="จัดการ section หน้าแรก">
      <AdminCmsEditor />
    </AdminShell>
  );
}
