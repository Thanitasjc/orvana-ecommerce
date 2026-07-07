export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/products", label: "สินค้า", icon: "👕" },
  { href: "/admin/categories", label: "หมวดหมู่", icon: "🏷️" },
  { href: "/admin/coupons", label: "คูปอง", icon: "🎟️" },
  { href: "/admin/shipping", label: "จัดส่ง", icon: "🚚" },
  { href: "/admin/loyalty", label: "แต้มสะสม", icon: "⭐" },
  { href: "/admin/orders", label: "ออเดอร์", icon: "🧾" },
  { href: "/admin/members", label: "สมาชิก (CRM)", icon: "👥" },
  { href: "/admin/cms", label: "CMS หน้าร้าน", icon: "🖥️" },
  { href: "/admin/blogs", label: "บทความ", icon: "📰" },
];

export const ADMIN_QUICK_LINKS = [
  { href: "/admin/products", label: "จัดการสินค้า" },
  { href: "/admin/categories", label: "จัดการหมวดหมู่" },
  { href: "/admin/coupons", label: "จัดการคูปอง" },
  { href: "/admin/shipping", label: "จัดการจัดส่ง" },
  { href: "/admin/orders", label: "ดูออเดอร์ทั้งหมด" },
  { href: "/admin/members", label: "จัดการสมาชิก" },
  { href: "/admin/cms", label: "แก้ไขหน้าแรก" },
  { href: "/pos/login", label: "ไป POS" },
  { href: "/", label: "หน้าร้านออนไลน์" },
];

export const ADMIN_MODULES = [
  { name: "แดชบอร์ด & รายงาน", active: true },
  { name: "ออเดอร์ Omnichannel", active: true },
  { name: "สมาชิก / CRM", active: true },
  { name: "CMS หน้าร้าน", active: true },
  { name: "คลังสินค้า / สินค้า", active: true },
  { name: "POS หน้าร้าน", active: true },
];
