"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/shop/cart/CartProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  icon: "home" | "shop" | "wishlist" | "cart";
  badge?: number;
};

function NavIcon({ name, active }: { name: NavItem["icon"]; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
        </svg>
      );
    case "shop":
      return (
        <svg {...common}>
          <path d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
          <path d="M8 8a4 4 0 0 1 8 0" />
        </svg>
      );
    case "wishlist":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-9.2-8.4C1.2 8.5 2.7 5 6.2 4.3c1.8-.3 3.5.4 4.6 1.7 1.1-1.3 2.8-2 4.6-1.7 3.5.7 5 4.2 3.4 7.3C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M6.5 8h11l-.8 10.2a1.5 1.5 0 0 1-1.5 1.3H8.8a1.5 1.5 0 0 1-1.5-1.3L6.5 8Z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
      );
  }
}

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const items: NavItem[] = [
    {
      href: "/",
      label: "หน้าแรก",
      icon: "home",
      match: (p) => p === "/",
    },
    {
      href: "/shop",
      label: "ร้านค้า",
      icon: "shop",
      match: (p) => p === "/shop" || p.startsWith("/products"),
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: "wishlist",
      badge: wishlistCount,
      match: (p) => p.startsWith("/wishlist"),
    },
    {
      href: "/cart",
      label: "ตะกร้า",
      icon: "cart",
      badge: cartCount,
      match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"),
    },
  ];

  return (
    <nav
      className="tp-mobile-bottom-nav d-xl-none"
      aria-label="เมนูหลักมือถือ"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 0,
        padding: "8px 6px calc(8px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.96)",
        borderTop: "1px solid #ececec",
        backdropFilter: "blur(12px)",
        boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minHeight: 52,
              padding: "4px 2px",
              color: active ? "#0f172a" : "#94a3b8",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              lineHeight: 1.2,
            }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <NavIcon name={item.icon} active={active} />
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -10,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    borderRadius: 999,
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "16px",
                    textAlign: "center",
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
