"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type HeaderSearchProps = {
  /** Compact icon trigger for mobile / crowded header areas */
  compact?: boolean;
};

export function HeaderSearch({ compact = false }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pathname === "/shop") {
      setQ(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = q.trim();
    const href = value ? `/shop?q=${encodeURIComponent(value)}` : "/shop";
    setOpen(false);
    router.push(href);
  }

  if (compact) {
    return (
      <div className="tp-header-action-item" ref={wrapRef} style={{ position: "relative" }}>
        <button
          type="button"
          className="tp-header-action-btn"
          aria-label="ค้นหาสินค้า"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {open ? (
          <form
            onSubmit={submit}
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 10px)",
              zIndex: 80,
              width: "min(86vw, 320px)",
              display: "flex",
              gap: 8,
              padding: 10,
              background: "#fff",
              border: "1px solid #ececec",
              borderRadius: 10,
              boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
            }}
          >
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="ค้นหาสินค้า..."
              aria-label="ค้นหาสินค้า"
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            />
            <button type="submit" className="tp-btn" style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
              ค้นหา
            </button>
          </form>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="d-none d-xl-flex align-items-center"
      style={{ marginRight: 12, maxWidth: 260, flex: "1 1 auto" }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="ค้นหาสินค้า..."
          aria-label="ค้นหาสินค้า"
          style={{
            width: "100%",
            minHeight: 40,
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            padding: "8px 40px 8px 14px",
            background: "#fff",
          }}
        />
        <button
          type="submit"
          aria-label="ค้นหา"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            border: 0,
            borderRadius: "50%",
            background: "transparent",
            color: "#0f172a",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}
