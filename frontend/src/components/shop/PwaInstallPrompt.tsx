"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "aesthete_pwa_install_dismissed";
const DISMISS_DAYS = 14;

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const ios = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    if (isStandaloneDisplay() || wasDismissedRecently()) {
      setVisible(false);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS never fires beforeinstallprompt — show banner after short delay
    let iosTimer: number | undefined;
    if (ios && !isStandaloneDisplay() && !wasDismissedRecently()) {
      iosTimer = window.setTimeout(() => setVisible(true), 1800);
    }

    const onAppInstalled = () => {
      setDeferred(null);
      setVisible(false);
      setIosGuideOpen(false);
      markDismissed();
    };
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, [ios]);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
    setIosGuideOpen(false);
  }, []);

  const onInstallClick = useCallback(async () => {
    if (ios) {
      setIosGuideOpen(true);
      return;
    }

    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        markDismissed();
      }
      setDeferred(null);
    } catch {
      // user closed prompt
    } finally {
      setInstalling(false);
    }
  }, [deferred, ios]);

  if (!visible) return null;

  return (
    <>
      <div
        className="d-xl-none"
        role="region"
        aria-label="ติดตั้งแอป"
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: "calc(76px + env(safe-area-inset-bottom))",
          zIndex: 1060,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 14,
          background: "#0f172a",
          color: "#fff",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.28)",
        }}
      >
        <img
          src="/icons/icon-192x192.png"
          alt=""
          width={40}
          height={40}
          style={{ borderRadius: 10, flexShrink: 0, background: "#fff" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>ติดตั้ง AESTHETE</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.78, lineHeight: 1.35 }}>
            เพิ่มลงหน้าจอโฮม ใช้งานเร็วขึ้นแบบแอป
          </p>
        </div>
        <button
          type="button"
          onClick={onInstallClick}
          disabled={installing || (!ios && !deferred)}
          style={{
            flexShrink: 0,
            border: 0,
            borderRadius: 999,
            padding: "8px 14px",
            background: "#fff",
            color: "#0f172a",
            fontSize: 12,
            fontWeight: 700,
            cursor: installing || (!ios && !deferred) ? "not-allowed" : "pointer",
            opacity: installing || (!ios && !deferred) ? 0.6 : 1,
          }}
        >
          {installing ? "..." : ios ? "วิธีติดตั้ง" : "ติดตั้ง"}
        </button>
        <button
          type="button"
          aria-label="ปิด"
          onClick={dismiss}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            border: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 16,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {iosGuideOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-pwa-title"
          onClick={() => setIosGuideOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 18,
              background: "#fff",
              padding: "22px 20px 28px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h3 id="ios-pwa-title" style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              เพิ่มลงหน้าจอโฮม (iPhone)
            </h3>
            <ol style={{ margin: "0 0 18px", paddingLeft: 18, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
              <li>
                แตะปุ่ม <strong>แชร์</strong> (□↑) ด้านล่าง Safari
              </li>
              <li>
                เลื่อนหาแล้วเลือก <strong>Add to Home Screen</strong> / เพิ่มไปยังหน้าโฮม
              </li>
              <li>
                กด <strong>Add</strong> เพื่อยืนยัน
              </li>
            </ol>
            <button type="button" className="tp-btn w-100" onClick={dismiss}>
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
