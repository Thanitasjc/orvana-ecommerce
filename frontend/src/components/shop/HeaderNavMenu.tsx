import Link from "next/link";
import { getMenuMegaMenu, getVisibleMenuItems, type HeaderCmsState } from "@/lib/cms/headerCms";
import { HeaderMegaMenuPanel } from "@/components/shop/HeaderMegaMenuPanel";

type HeaderNavMenuProps = {
  headerCms: HeaderCmsState;
};

export function HeaderNavMenu({ headerCms }: HeaderNavMenuProps) {
  return (
    <>
      <style>{`
        .main-menu .shop-mega-menu > li {
          width: 20%;
        }
        .tp-header-bottom-2 .container {
          position: relative;
        }
        .main-menu > nav > ul > li.has-mega-menu > .tp-mega-menu.shop-mega-menu {
          left: 0;
          right: 0;
          width: auto;
          z-index: 101;
        }
        .main-menu > nav > ul > li > .tp-submenu {
          z-index: 101;
        }
      `}</style>
      <nav className="tp-main-menu-content">
        <ul>
          {getVisibleMenuItems(headerCms).map((item) => {
            const megaMenu = getMenuMegaMenu(item);

            if (megaMenu) {
              return (
                <li key={item.id} className="has-dropdown has-mega-menu">
                  <Link href={item.href}>{item.label}</Link>
                  <ul className="tp-submenu tp-mega-menu mega-menu-style-2 shop-mega-menu">
                    <HeaderMegaMenuPanel config={megaMenu} />
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
