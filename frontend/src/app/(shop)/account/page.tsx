/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { OrderInvoiceModal } from "@/components/shop/account/OrderInvoiceModal";
import { apiFetch } from "@/lib/api/client";
import { DEFAULT_AVATAR, resolveAvatarUrl, uploadMemberAvatar } from "@/lib/auth/avatar";
import { deleteCookie, getCookie, MEMBER_TOKEN_KEY } from "@/lib/auth/cookies";
import {
  formatMoney,
  orderProductTitle,
  orderStatusClass,
  orderStatusLabel,
  orderViewLabel,
  type Order,
} from "@/lib/orders/types";

type Member = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  points: number;
  tier: string;
  total_spent: number;
};

type TabKey = "profile" | "information" | "address" | "order" | "notification" | "password";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "profile", label: "Profile", icon: "fa-regular fa-user-pen" },
  { key: "information", label: "Information", icon: "fa-regular fa-circle-info" },
  { key: "address", label: "Address", icon: "fa-light fa-location-dot" },
  { key: "order", label: "My Orders", icon: "fa-light fa-clipboard-list-check" },
  { key: "notification", label: "Notification", icon: "fa-regular fa-bell" },
  { key: "password", label: "Change Password", icon: "fa-regular fa-lock" },
];

export default function AccountPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) return;

    Promise.all([
      apiFetch<{ data: Member }>("/member/me", { token }),
      apiFetch<{ data: Order[] }>("/member/orders", { token }),
    ])
      .then(([me, orderRes]) => {
        setMember(me.data);
        setAvatarUrl(resolveAvatarUrl(me.data.avatar));
        setOrders(orderRes.data ?? []);
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"));
  }, []);

  const orderCount = orders.length;

  const latestOrderTitle = useMemo(() => {
    const first = orders[0]?.items?.[0]?.product_name;
    return first ?? "No orders yet";
  }, [orders]);

  function logout() {
    deleteCookie(MEMBER_TOKEN_KEY);
    window.location.href = "/login";
  }

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !member) return;

    const token = getCookie(MEMBER_TOKEN_KEY);
    if (!token) return;

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const res = await uploadMemberAvatar(file, token);
      setMember(res.data);
      setAvatarUrl(resolveAvatarUrl(res.data.avatar));
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      const firstFieldError = apiErr.errors ? Object.values(apiErr.errors)[0]?.[0] : undefined;
      setAvatarError(firstFieldError ?? apiErr.message ?? "เปลี่ยนรูปไม่สำเร็จ");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (error) {
    return (
      <section className="profile__area pt-120 pb-120">
        <div className="container">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!member) {
    return (
      <section className="profile__area pt-120 pb-120">
        <div className="container">
          <p>กำลังโหลด...</p>
        </div>
      </section>
    );
  }

  return (
    <main>
      <section className="profile__area pt-120 pb-120">
        <div className="container">
          <div className="profile__inner p-relative">
            <div className="profile__shape">
              <img className="profile__shape-1" src="/assets/img/login/laptop.png" alt="" />
              <img className="profile__shape-2" src="/assets/img/login/man.png" alt="" />
              <img className="profile__shape-3" src="/assets/img/login/shape-1.png" alt="" />
              <img className="profile__shape-4" src="/assets/img/login/shape-2.png" alt="" />
              <img className="profile__shape-5" src="/assets/img/login/shape-3.png" alt="" />
              <img className="profile__shape-6" src="/assets/img/login/shape-4.png" alt="" />
            </div>

            <div className="row">
              <div className="col-xxl-4 col-lg-4">
                <div className="profile__tab mr-40">
                  <nav>
                    <div className="nav nav-tabs tp-tab-menu flex-column" role="tablist">
                      {TABS.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                          onClick={() => setActiveTab(tab.key)}
                          role="tab"
                          aria-selected={activeTab === tab.key}
                        >
                          <span>
                            <i className={tab.icon} />
                          </span>
                          {tab.label}
                        </button>
                      ))}
                      <span className="tp-tab-line d-none d-sm-inline-block" />
                    </div>
                  </nav>
                </div>
              </div>

              <div className="col-xxl-8 col-lg-8">
                <div className="profile__tab-content">
                  {activeTab === "profile" ? (
                    <div className="profile__main">
                      <div className="profile__main-top pb-80">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <div className="profile__main-inner d-flex flex-wrap align-items-center">
                              <div className="profile__main-thumb">
                                <img src={avatarUrl} alt={member.name} />
                                <div className="profile__main-thumb-edit">
                                  <input
                                    id="profile-thumb-input"
                                    className="profile-img-popup"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={onAvatarChange}
                                    disabled={uploadingAvatar}
                                  />
                                  <label htmlFor="profile-thumb-input" aria-busy={uploadingAvatar}>
                                    <i className="fa-light fa-camera" />
                                  </label>
                                </div>
                              </div>
                              {uploadingAvatar ? <p className="text-muted small mt-10 mb-0">กำลังอัปโหลด...</p> : null}
                              {avatarError ? <p className="text-danger small mt-10 mb-0">{avatarError}</p> : null}
                              <div className="profile__main-content">
                                <h4 className="profile__main-title">Welcome {member.name}!</h4>
                                <p>
                                  ระดับ <span>{member.tier}</span> | แต้ม {member.points}
                                </p>
                                <p className="mb-0 text-muted">
                                  พื้นที่นี้สำหรับลูกค้าเท่านั้น — ไม่ใช่ POS หรือ Admin
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="profile__main-logout text-sm-end">
                              <button type="button" className="tp-logout-btn" onClick={logout}>
                                Logout
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile__main-info">
                        <div className="row gx-3">
                          <div className="col-md-3 col-sm-6">
                            <div className="profile__main-info-item">
                              <div className="profile__main-info-icon">
                                <span>
                                  <span className="profile-icon-count profile-download">{member.points}</span>
                                  <svg enableBackground="new 0 0 512 512" viewBox="0 0 512 512">
                                    <path d="m334.52 286.41c3.21 3.21 3.21 8.42 0 11.63l-71.73 71.73c-1.48 2.16-3.97 3.59-6.79 3.59-.03 0-.07 0-.1 0s-.07 0-.1 0c-2.11 0-4.21-.8-5.82-2.41l-72.5-72.5c-3.21-3.21-3.21-8.42 0-11.63s8.42-3.21 11.63 0l58.66 58.66v-198.62c0-4.54 3.68-8.23 8.23-8.23 4.54 0 8.23 3.68 8.23 8.23v198.21l58.66-58.66c3.21-3.21 8.42-3.21 11.63 0zm117.29-226.22c39.34 38.21 58.47 100.39 60.19 195.66v.3c-1.72 95.28-20.85 157.46-60.19 195.66-38.21 39.34-100.39 58.47-195.66 60.19-.05 0-.1 0-.15 0s-.1 0-.15 0c-95.28-1.72-157.46-20.85-195.66-60.19-39.34-38.21-58.47-100.38-60.19-195.66 0-.1 0-.2 0-.3 1.72-95.28 20.85-157.46 60.19-195.66 38.21-39.34 100.39-58.47 195.66-60.19h.3c95.27 1.72 157.45 20.85 195.66 60.19zm43.73 195.81c-1.65-90.63-19.22-149.13-55.28-184.09-.06-.06-.12-.12-.18-.18-34.95-36.06-93.45-53.62-184.08-55.27-90.63 1.65-149.13 19.22-184.09 55.28-.06.06-.12.12-.18.18-36.06 34.95-53.62 93.44-55.27 184.08 1.65 90.63 19.22 149.13 55.28 184.09l.18.18c34.95 36.06 93.45 53.62 184.09 55.28 90.63-1.65 149.13-19.22 184.09-55.28l.18-.18c36.04-34.96 53.61-93.45 55.26-184.09z" />
                                  </svg>
                                </span>
                              </div>
                              <h4 className="profile__main-info-title">Points</h4>
                            </div>
                          </div>

                          <div className="col-md-3 col-sm-6">
                            <div className="profile__main-info-item">
                              <div className="profile__main-info-icon">
                                <span>
                                  <span className="profile-icon-count profile-order">{orderCount}</span>
                                  <svg viewBox="0 0 512 512">
                                    <path d="M472.916,224H448.007a24.534,24.534,0,0,0-23.417-18H398V140.976a6.86,6.86,0,0,0-3.346-6.062L207.077,26.572a6.927,6.927,0,0,0-6.962,0L12.48,134.914A6.981,6.981,0,0,0,9,140.976V357.661a7,7,0,0,0,3.5,6.062L200.154,472.065a7,7,0,0,0,3.5.938,7.361,7.361,0,0,0,3.6-.938L306,415.108v41.174A29.642,29.642,0,0,0,335.891,486H472.916A29.807,29.807,0,0,0,503,456.282v-202.1A30.2,30.2,0,0,0,472.916,224Z" />
                                  </svg>
                                </span>
                              </div>
                              <h4 className="profile__main-info-title">Orders</h4>
                            </div>
                          </div>

                          <div className="col-md-3 col-sm-6">
                            <div className="profile__main-info-item">
                              <div className="profile__main-info-icon">
                                <span>
                                  <span className="profile-icon-count profile-wishlist">0</span>
                                  <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m348 0c-43 .0664062-83.28125 21.039062-108 56.222656-24.71875-35.183594-65-56.1562498-108-56.222656-70.320312 0-132 65.425781-132 140 0 72.679688 41.039062 147.535156 118.6875 216.480469 35.976562 31.882812 75.441406 59.597656 117.640625 82.625 2.304687 1.1875 5.039063 1.1875 7.34375 0 42.183594-23.027344 81.636719-50.746094 117.601563-82.625 77.6875-68.945313 118.726562-143.800781 118.726562-216.480469 0-74.574219-61.679688-140-132-140z" />
                                  </svg>
                                </span>
                              </div>
                              <h4 className="profile__main-info-title">Wishlist</h4>
                            </div>
                          </div>

                          <div className="col-md-3 col-sm-6">
                            <div className="profile__main-info-item">
                              <div className="profile__main-info-icon">
                                <span>
                                  <span className="profile-icon-count profile-wishlist">{member.tier.slice(0, 2)}</span>
                                  <svg viewBox="0 0 512 512">
                                    <path d="m352.742 291.476h-263.963l228.58-145.334a6 6 0 0 0 1.844-8.284l-22.647-35.618a36.285 36.285 0 0 0 -50.033-11.14l-32.165 20.451 2.548-12.191a34.314 34.314 0 1 0 -66.987-14.914l-16.71 75.054-55.951-12.454a34.315 34.315 0 0 0 -21 65.026l-34.458 21.91a36.285 36.285 0 0 0 -11.14 50.032l22.647 35.619a6 6 0 0 0 8.283 1.845l21.08-13.4v151.888a36.285 36.285 0 0 0 36.246 36.244h223.584a36.285 36.285 0 0 0 36.244-36.244v-162.49a6 6 0 0 0 -6.002-6z" />
                                  </svg>
                                </span>
                              </div>
                              <h4 className="profile__main-info-title">Tier</h4>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-20">
                        ยอดสะสม: <strong>฿{formatMoney(member.total_spent)}</strong> | ออเดอร์ล่าสุด: {latestOrderTitle}
                      </p>
                      <Link href="/shop" className="tp-btn-border mt-20 d-inline-block">
                        กลับร้านค้า
                      </Link>
                    </div>
                  ) : null}

                  {activeTab === "information" ? (
                    <div className="profile__info">
                      <h3 className="profile__info-title">Personal Details</h3>
                      <div className="profile__info-content">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="row">
                            <div className="col-xxl-6 col-md-6">
                              <div className="profile__input-box">
                                <div className="profile__input">
                                  <input type="text" name="name" defaultValue={member.name} readOnly />
                                  <span>
                                    <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M9 9C11.2091 9 13 7.20914 13 5C13 2.79086 11.2091 1 9 1C6.79086 1 5 2.79086 5 5C5 7.20914 6.79086 9 9 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M15.5 17.6C15.5 14.504 12.3626 12 8.5 12C4.63737 12 1.5 14.504 1.5 17.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-xxl-6 col-md-6">
                              <div className="profile__input-box">
                                <div className="profile__input">
                                  <input type="email" name="email" defaultValue={member.email} readOnly />
                                  <span>
                                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13 14.6H5C2.6 14.6 1 13.4 1 10.6V5C1 2.2 2.6 1 5 1H13C15.4 1 17 2.2 17 5V10.6C17 13.4 15.4 14.6 13 14.6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M13 5.3999L10.496 7.3999C9.672 8.0559 8.32 8.0559 7.496 7.3999L5 5.3999" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-xxl-6 col-md-6">
                              <div className="profile__input-box">
                                <div className="profile__input">
                                  <input type="text" name="phone" defaultValue={member.phone ?? ""} readOnly />
                                  <span>
                                    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13.9148 5V13C13.9148 16.2 13.1076 17 9.87892 17H5.03587C1.80717 17 1 16.2 1 13V5C1 1.8 1.80717 1 5.03587 1H9.87892C13.1076 1 13.9148 1.8 13.9148 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-xxl-6 col-md-6">
                              <div className="profile__input-box">
                                <div className="profile__input">
                                  <input type="text" defaultValue={member.tier} readOnly />
                                </div>
                              </div>
                            </div>
                            <div className="col-xxl-12">
                              <div className="profile__input-box">
                                <div className="profile__input">
                                  <textarea defaultValue={`สมาชิก ${member.tier} | แต้มสะสม ${member.points} แต้ม`} readOnly />
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "address" ? (
                    <div className="profile__address">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="profile__address-item d-sm-flex align-items-start">
                            <div className="profile__address-icon">
                              <span>
                                <i className="fa-light fa-location-dot" />
                              </span>
                            </div>
                            <div className="profile__address-content">
                              <h3 className="profile__address-title">Billing Address</h3>
                              <p>
                                <span>Name:</span> {member.name}
                              </p>
                              <p>
                                <span>Email:</span> {member.email}
                              </p>
                              <p>
                                <span>Phone number:</span> {member.phone ?? "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="profile__address-item d-sm-flex align-items-start">
                            <div className="profile__address-icon">
                              <span>
                                <i className="fa-light fa-truck" />
                              </span>
                            </div>
                            <div className="profile__address-content">
                              <h3 className="profile__address-title">Shipping Address</h3>
                              <p>
                                <span>Name:</span> {member.name}
                              </p>
                              <p>
                                <span>Phone number:</span> {member.phone ?? "-"}
                              </p>
                              <p>
                                <span>Country:</span> Thailand
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "order" ? (
                    <div className="profile__ticket table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Order Id</th>
                            <th scope="col">Product Title</th>
                            <th scope="col">Status</th>
                            <th scope="col">View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={4}>ยังไม่มีออเดอร์</td>
                            </tr>
                          ) : (
                            orders.map((order) => {
                              const statusClass = orderStatusClass(order.status, order.payment_status);
                              const statusLabel = orderStatusLabel(order.status, order.payment_status);
                              const viewLabel = orderViewLabel(order.status, order.payment_status);

                              return (
                                <tr key={order.id}>
                                  <th scope="row">#{order.order_number}</th>
                                  <td data-info="title">{orderProductTitle(order)}</td>
                                  <td data-info={`status ${statusClass}`}>{statusLabel}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="tp-logout-btn"
                                      onClick={() => setSelectedOrder(order)}
                                    >
                                      {viewLabel}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {activeTab === "notification" ? (
                    <div className="profile__notification">
                      <div className="profile__notification-top mb-30">
                        <h3 className="profile__notification-title">My activity settings</h3>
                        <p>
                          Stay up to date with notification on activity that involves you including mentions,
                          messages, replies to your bids, new items, sale and administrative updates
                        </p>
                      </div>
                      <div className="profile__notification-wrapper">
                        {[
                          { id: "like", label: "Like & Follows Notifications" },
                          { id: "post", label: "Post, Comments & Replies Notifications" },
                          { id: "new", label: "New Product Notifications" },
                          { id: "sale", label: "Product on sale Notifications" },
                          { id: "payment", label: "Payment Notifications" },
                        ].map((item) => (
                          <div className="profile__notification-item mb-20" key={item.id}>
                            <div className="form-check form-switch d-flex align-items-center">
                              <input className="form-check-input" type="checkbox" role="switch" id={item.id} defaultChecked />
                              <label className="form-check-label" htmlFor={item.id}>
                                {item.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "password" ? (
                    <div className="profile__password">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="row">
                          <div className="col-xxl-12">
                            <div className="tp-profile-input-box">
                              <div className="tp-contact-input">
                                <input name="old_pass" id="old_pass" type="password" />
                              </div>
                              <div className="tp-profile-input-title">
                                <label htmlFor="old_pass">Old Password</label>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-6 col-md-6">
                            <div className="tp-profile-input-box">
                              <div className="tp-profile-input">
                                <input name="new_pass" id="new_pass" type="password" />
                              </div>
                              <div className="tp-profile-input-title">
                                <label htmlFor="new_pass">New Password</label>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-6 col-md-6">
                            <div className="tp-profile-input-box">
                              <div className="tp-profile-input">
                                <input name="con_new_pass" id="con_new_pass" type="password" />
                              </div>
                              <div className="tp-profile-input-title">
                                <label htmlFor="con_new_pass">Confirm Password</label>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-6 col-md-6">
                            <div className="profile__btn">
                              <button type="submit" className="tp-btn">
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OrderInvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </main>
  );
}
