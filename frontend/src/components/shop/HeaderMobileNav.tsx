"use client";

import Link from "next/link";
import { useState } from "react";
import { getMenuMegaMenu, getVisibleMenuItems, type HeaderCmsState } from "@/lib/cms/headerCms";
import { HeaderMegaMenuPanel } from "@/components/shop/HeaderMegaMenuPanel";

type HeaderMobileNavProps = {
  headerCms: HeaderCmsState;
  onNavigate?: () => void;
};

export function HeaderMobileNav({ headerCms, onNavigate }: HeaderMobileNavProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  function toggleMenu(menuId: string) {
    setOpenMenuId((current) => (current === menuId ? null : menuId));
  }

  function handleNavigate() {
    setOpenMenuId(null);
    onNavigate?.();
  }

  return (
    <div className="tp-main-menu-mobile">
      <nav>
        <ul>
          {getVisibleMenuItems(headerCms).map((item) => {
            const megaMenu = getMenuMegaMenu(item);
            const isOpen = openMenuId === item.id;

            if (megaMenu) {
              return (
                <li key={item.id} className={`has-dropdown${isOpen ? " dropdown-opened" : ""}`}>
                  <Link
                    href={item.href}
                    className={isOpen ? "expanded" : undefined}
                    onClick={(event) => event.preventDefault()}
                  >
                    {item.label}
                    <button
                      type="button"
                      className={`dropdown-toggle-btn${isOpen ? " dropdown-opened" : ""}`}
                      aria-label={`Toggle ${item.label} submenu`}
                      aria-expanded={isOpen}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <i className="fa-regular fa-angle-right" aria-hidden="true" />
                    </button>
                  </Link>
                  <ul
                    className="tp-submenu tp-mega-menu shop-mega-menu"
                    style={{ display: isOpen ? "block" : "none" }}
                  >
                    <HeaderMegaMenuPanel config={megaMenu} onNavigate={handleNavigate} variant="mobile" />
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link href={item.href} onClick={handleNavigate}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
