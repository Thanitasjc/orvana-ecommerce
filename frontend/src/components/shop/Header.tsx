/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/shop/cart/CartProvider";
import { useCompare } from "@/components/shop/compare/CompareProvider";
import { useWishlist } from "@/components/shop/wishlist/WishlistProvider";
import { formatBaht } from "@/lib/pricing/vat";
import { apiFetch } from "@/lib/api/client";
import { defaultHeaderCms, getVisibleMenuItems, type HeaderCmsState } from "@/lib/cms/headerCms";
import { resolveProductImage } from "@/lib/api/products";
import { MEMBER_TOKEN_KEY, deleteCookie, getCookie, setCookie } from "@/lib/auth/cookies";

type MemberSession = {
  name: string;
  points: number;
  tier: string;
};

type HeaderProps = {
  initialCms?: HeaderCmsState;
};

export function Header({ initialCms = defaultHeaderCms }: HeaderProps) {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [member, setMember] = useState<MemberSession | null>(null);
  const [headerCms] = useState<HeaderCmsState>(initialCms);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { cartCount, items: cartItems, subtotal, removeItem } = useCart();
  const { compareCount } = useCompare();
  const { wishlistCount } = useWishlist();
  const freeShippingTarget = 50;
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingTarget) * 100));

  useEffect(() => {
    document.body.style.overflow = isCartOpen || isLoginModalOpen || isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isLoginModalOpen, isMobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 120);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) return;

    apiFetch<{ data: { name: string; points: number; tier: string } }>("/member/me", { token })
      .then((res) =>
        setMember({
          name: res.data.name,
          points: res.data.points ?? 0,
          tier: res.data.tier ?? "Silver",
        }),
      )
      .catch(() => {
        deleteCookie(MEMBER_TOKEN_KEY);
        setMember(null);
      });
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const form = new FormData(event.currentTarget);

    try {
      const res = await apiFetch<{
        data: { token: string; user: { name: string; points: number; tier: string } };
      }>("/member/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      setCookie(MEMBER_TOKEN_KEY, res.data.token);
      setMember({
        name: res.data.user.name,
        points: res.data.user.points ?? 0,
        tier: res.data.user.tier ?? "Silver",
      });
      setIsAccountMenuOpen(false);
      setIsLoginModalOpen(false);
      router.push("/");
    } catch (err: unknown) {
      setLoginError((err as { message?: string }).message ?? "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function onLogout() {
    deleteCookie(MEMBER_TOKEN_KEY);
    setMember(null);
    setIsAccountMenuOpen(false);
    router.push("/");
  }

  return (
    <>
      <header className="tp-header-area tp-header-style-darkRed tp-header-height">
        <div
          id="header-sticky"
          className={`tp-header-bottom-2 tp-header-sticky ${isSticky ? "header-sticky" : ""}`}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-2 col-md-6 col-6">
                <div className="logo">
                  <Link href="/">
                    <img src={resolveProductImage(headerCms.logoUrl)} alt={headerCms.logoAlt} />
                  </Link>
                </div>
              </div>
              <div className="col-xl-7 d-none d-xl-block">
                <div className="main-menu menu-style-2">
                  <nav className="tp-main-menu-content">
                    <ul>
                      {getVisibleMenuItems(headerCms).map((item) => (
                        <li key={item.id}>
                          <Link href={item.href}>{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="col-xl-3 col-lg-10 col-md-6 col-6">
                <div className="d-flex align-items-center justify-content-end">
                  <div className="tp-header-login d-none d-lg-block" style={{ position: "relative" }} ref={accountMenuRef}>
                    <button
                      type="button"
                      className="d-flex align-items-center"
                      style={{ background: "transparent", border: 0 }}
                      onClick={() =>
                        member
                          ? setIsAccountMenuOpen((prev) => !prev)
                          : (setLoginError(null), setIsLoginModalOpen(true))
                      }
                    >
                      <span style={{ marginRight: "8px" }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M2.5 13.5C2.5 11.0147 4.51472 9 7 9H9C11.4853 9 13.5 11.0147 13.5 13.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span className="d-flex flex-column align-items-start" style={{ lineHeight: 1.25 }}>
                        <span>{member?.name ?? "บัญชีสมาชิก"}</span>
                        {member ? (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                            ⭐ {member.points.toLocaleString("th-TH")} แต้ม · {member.tier}
                          </span>
                        ) : null}
                      </span>
                    </button>

                    {member && isAccountMenuOpen ? (
                      <div
                        role="menu"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          zIndex: 60,
                          marginTop: "10px",
                          minWidth: "180px",
                          border: "1px solid #ececec",
                          borderRadius: "8px",
                          background: "#fff",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          padding: "8px 0",
                        }}
                      >
                        <Link
                          href="/account"
                          role="menuitem"
                          style={{ display: "block", padding: "10px 14px" }}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <div style={{ padding: "8px 14px", fontSize: "12px", color: "#059669" }}>
                          แต้มคงเหลือ: <strong>{member.points.toLocaleString("th-TH")}</strong> · {member.tier}
                        </div>
                        <Link
                          href="/wishlist"
                          role="menuitem"
                          style={{ display: "block", padding: "10px 14px" }}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/cart"
                          role="menuitem"
                          style={{ display: "block", padding: "10px 14px" }}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          Cart
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 14px",
                            background: "transparent",
                            border: 0,
                            color: "#d32f2f",
                          }}
                          onClick={onLogout}
                        >
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="tp-header-action d-flex align-items-center ml-30">
                    <div className="tp-header-action-item">
                      <Link href="/compare" className="tp-header-action-btn" aria-label="Compare products">
                        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M14.8396 17.3319V3.71411"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.1556 13L15.0778 17.0967L11 13"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.91115 1.00056V14.6183"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M0.833496 5.09667L4.91127 1L8.98905 5.09667"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {compareCount > 0 ? <span className="tp-header-action-badge">{compareCount}</span> : null}
                      </Link>
                    </div>
                    <div className="tp-header-action-item">
                      <Link href="/wishlist" className="tp-header-action-btn" aria-label="Wishlist">
                        <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.239 18.8538C13.4096 17.5179 15.4289 15.9456 17.2607 14.1652C18.5486 12.8829 19.529 11.3198 20.1269 9.59539C21.2029 6.25031 19.9461 2.42083 16.4289 1.28752C14.5804 0.692435 12.5616 1.03255 11.0039 2.20148C9.44567 1.03398 7.42754 0.693978 5.57894 1.28752C2.06175 2.42083 0.795919 6.25031 1.87187 9.59539C2.46978 11.3198 3.45021 12.8829 4.73806 14.1652C6.56988 15.9456 8.58917 17.5179 10.7598 18.8538L10.9949 19L11.239 18.8538Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.26062 5.05302C6.19531 5.39332 5.43839 6.34973 5.3438 7.47501"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {wishlistCount > 0 ? <span className="tp-header-action-badge">{wishlistCount}</span> : null}
                      </Link>
                    </div>
                    <div className="tp-header-action-item">
                      <button
                        className="tp-header-action-btn cartmini-open-btn"
                        type="button"
                        aria-label="Open cart"
                        onClick={() => setIsCartOpen(true)}
                      >
                        <svg
                          width="21"
                          height="22"
                          viewBox="0 0 21 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.48626 20.5H14.8341C17.9004 20.5 20.2528 19.3924 19.5847 14.9348L18.8066 8.89359C18.3947 6.66934 16.976 5.81808 15.7311 5.81808H5.55262C4.28946 5.81808 2.95308 6.73341 2.4771 8.89359L1.69907 14.9348C1.13157 18.889 3.4199 20.5 6.48626 20.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.34902 5.5984C6.34902 3.21232 8.28331 1.27803 10.6694 1.27803V1.27803C11.8184 1.27316 12.922 1.72619 13.7362 2.53695C14.5504 3.3477 15.0081 4.44939 15.0081 5.5984V5.5984"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.70365 10.1018H7.74942"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.5343 10.1018H13.5801"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="tp-header-action-badge">{cartCount}</span>
                      </button>
                    </div>
                    <div className="tp-header-action-item d-xl-none">
                      <button
                        type="button"
                        className="tp-header-action-btn tp-offcanvas-open-btn"
                        aria-label="Open menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(true)}
                      >
                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M0 1H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M0 8H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M0 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isLoginModalOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "12px",
              background: "#fff",
              padding: "24px",
              position: "relative",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close login modal"
              onClick={() => setIsLoginModalOpen(false)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                width: "32px",
                height: "32px",
                border: "1px solid #ddd",
                borderRadius: "50%",
                background: "#fff",
                lineHeight: 1,
              }}
            >
              x
            </button>

            <h4 style={{ marginBottom: "8px" }}>เข้าสู่ระบบ</h4>
            <p style={{ marginBottom: "18px", color: "#666" }}>กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>

            <form onSubmit={onLoginSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  style={{
                    width: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  style={{
                    width: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                />
              </div>
              {loginError ? (
                <p style={{ color: "#d32f2f", marginBottom: "12px", fontSize: "14px" }}>{loginError}</p>
              ) : null}
              <button type="submit" className="tp-btn w-100" disabled={isLoggingIn}>
                {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
            <div style={{ marginTop: "12px" }}>
              <Link
                href="/register"
                className="tp-btn tp-btn-border w-100"
                onClick={() => setIsLoginModalOpen(false)}
                style={{ textAlign: "center", display: "block" }}
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`cartmini__area cartmini__style-darkRed ${isCartOpen ? "cartmini-opened" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "100%",
          maxWidth: "420px",
          height: "100vh",
          zIndex: 1100,
          background: "#fff",
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s ease",
          boxShadow: "0 0 30px rgba(0,0,0,0.15)",
        }}
        aria-hidden={!isCartOpen}
      >
        <div className="cartmini__wrapper d-flex justify-content-between flex-column" style={{ height: "100%" }}>
          <div className="cartmini__top-wrapper">
            <div className="cartmini__top p-relative">
              <div className="cartmini__top-title">
                <h4>Shopping cart</h4>
              </div>
              <div className="cartmini__close">
                <button
                  type="button"
                  className="cartmini__close-btn cartmini-close-btn"
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                >
                  x
                </button>
              </div>
            </div>
            <div className="cartmini__shipping">
              <p>
                Free Shipping for all orders over <span>฿{formatBaht(freeShippingTarget, 0)}</span>
              </p>
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  aria-valuenow={shippingProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
            <div className="cartmini__widget">
              {cartItems.map((item) => (
                <div className="cartmini__widget-item" key={item.id}>
                  <div className="cartmini__thumb">
                    <Link href={item.href} onClick={() => setIsCartOpen(false)}>
                      <img src={item.image} alt={item.title} />
                    </Link>
                  </div>
                  <div className="cartmini__content">
                    <h5 className="cartmini__title">
                      <Link href={item.href} onClick={() => setIsCartOpen(false)}>
                        {item.title}
                      </Link>
                    </h5>
                    <div className="cartmini__price-wrapper">
                      <span className="cartmini__price">฿{formatBaht(item.price)}</span>
                      <span className="cartmini__quantity">x{item.quantity}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cartmini__del"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => removeItem(item.id)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="cartmini__checkout">
            <div className="cartmini__checkout-title mb-30">
              <h4>Subtotal:</h4>
              <span>฿{formatBaht(subtotal)}</span>
            </div>
            <div className="cartmini__checkout-btn">
              <Link href="/cart" className="tp-btn mb-10 w-100" onClick={() => setIsCartOpen(false)}>
                view cart
              </Link>
              <Link href="/checkout" className="tp-btn tp-btn-border w-100" onClick={() => setIsCartOpen(false)}>
                checkout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isCartOpen ? (
        <div
          onClick={() => setIsCartOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1090, backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={`offcanvas__area offcanvas__style-darkRed ${isMobileMenuOpen ? "offcanvas-opened" : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="offcanvas__wrapper">
          <div className="offcanvas__close">
            <button
              type="button"
              className="offcanvas__close-btn offcanvas-close-btn"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 1L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="offcanvas__content">
            <div className="offcanvas__top mb-40">
              <div className="offcanvas__logo">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={resolveProductImage(headerCms.logoUrl)} alt={headerCms.logoAlt} />
                </Link>
              </div>
            </div>

            <div className="tp-main-menu-mobile">
              <nav>
                <ul>
                  {getVisibleMenuItems(headerCms).map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="offcanvas__btn mt-30 d-lg-none">
              {member ? (
                <div className="d-flex flex-column gap-2">
                  <Link href="/account" className="tp-btn w-100" onClick={() => setIsMobileMenuOpen(false)}>
                    My Profile
                  </Link>
                  <Link href="/wishlist" className="tp-btn tp-btn-border w-100" onClick={() => setIsMobileMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    className="tp-btn tp-btn-border w-100"
                    style={{ color: "#d32f2f" }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="tp-btn w-100"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setLoginError(null);
                    setIsLoginModalOpen(true);
                  }}
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div
          className="body-overlay opened"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
