"use client";

import { FormEvent, useEffect, useRef, useState, type RefObject } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type HeaderSearchProps = {
  /** Compact icon trigger for mobile / crowded header areas */
  compact?: boolean;
};

function SearchField({
  q,
  setQ,
  inputRef,
  compactInput,
}: {
  q: string;
  setQ: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  compactInput?: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="search"
      value={q}
      onChange={(event) => setQ(event.target.value)}
      placeholder="ค้นหาสินค้า..."
      aria-label="ค้นหาสินค้า"
      style={
        compactInput
          ? {
              flex: 1,
              minWidth: 0,
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 16,
            }
          : undefined
      }
    />
  );
}

export function HeaderSearch({ compact = false }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [barTop, setBarTop] = useState(0);
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

    const updateBarTop = () => {
      const header = document.getElementById("header-sticky");
      setBarTop(header ? header.getBoundingClientRect().bottom : 0);
    };

    updateBarTop();
    window.addEventListener("resize", updateBarTop);
    window.addEventListener("scroll", updateBarTop, { passive: true });

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-mobile-search-bar]")) return;
      setOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("resize", updateBarTop);
      window.removeEventListener("scroll", updateBarTop);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!compact || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [compact, open]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = q.trim();
    const href = value ? `/shop?q=${encodeURIComponent(value)}` : "/shop";
    setOpen(false);
    router.push(href);
  }

  if (compact) {
    return (
      <>
        <div className="tp-header-action-item" ref={wrapRef}>
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
        </div>

        {open ? (
          <>
            <button
              type="button"
              aria-label="ปิดการค้นหา"
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                border: 0,
                padding: 0,
                background: "rgba(15, 23, 42, 0.35)",
              }}
            />
            <form
              data-mobile-search-bar
              onSubmit={submit}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                width: "100%",
                top: barTop,
                zIndex: 9999,
                display: "flex",
                gap: 8,
                alignItems: "stretch",
                padding: "12px 16px",
                boxSizing: "border-box",
                background: "#fff",
                borderBottom: "1px solid #ececec",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
            >
              <SearchField q={q} setQ={setQ} inputRef={inputRef} compactInput />
              <button
                type="submit"
                className="tp-btn"
                style={{ flexShrink: 0, padding: "10px 16px", whiteSpace: "nowrap", minHeight: 44 }}
              >
                ค้นหา
              </button>
            </form>
          </>
        ) : null}
      </>
    );
  }

  return (
    <form onSubmit={submit} role="search" className="tp-header-search-2 d-none d-xl-block" style={{ width: "100%" }}>
      <SearchField q={q} setQ={setQ} />
      <button type="submit" aria-label="ค้นหา">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
