"use client";

import { AdminMembersSection } from "@/components/admin/AdminMembersSection";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminMembersPage() {
  return (
    <AdminShell title="สมาชิก (CRM)" subtitle="รายชื่อสมาชิกทั้งหมดในระบบ">
      <AdminMembersSection />
    </AdminShell>
  );
}
