"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PosCouponScannerModalProps = {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
};

export function normalizeScannedCouponCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("code") ?? url.searchParams.get("coupon");
    if (fromQuery) return fromQuery.toUpperCase();
  } catch {
    // plain text code
  }

  return trimmed.toUpperCase();
}

export function PosCouponScannerModal({ open, onClose, onScan }: PosCouponScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLockRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleDetected = useCallback(
    (raw: string) => {
      if (scanLockRef.current) return;

      const code = normalizeScannedCouponCode(raw);
      if (!code) return;

      scanLockRef.current = true;
      onScan(code);
      stopCamera();
      onClose();
    },
    [onClose, onScan, stopCamera],
  );

  useEffect(() => {
    if (!open) {
      scanLockRef.current = false;
      setError(null);
      stopCamera();
      return;
    }

    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      setSupported(false);
      setError("เบราว์เซอร์นี้ไม่รองรับสแกนจากกล้อง — ใช้ปืนยิงบาร์โค้ดหรือพิมพ์รหัสแทน");
      return;
    }

    setSupported(true);
    let cancelled = false;
    let frameId = 0;

    async function startScanner() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        const Detector = window.BarcodeDetector;
        if (!Detector) return;

        const detector = new Detector({
          formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8"],
        });

        const tick = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            frameId = window.requestAnimationFrame(() => void tick());
            return;
          }

          try {
            const barcodes = await detector.detect(videoRef.current);
            const match = barcodes[0]?.rawValue;
            if (match) {
              handleDetected(match);
              return;
            }
          } catch {
            // ignore single-frame detection errors
          }

          frameId = window.requestAnimationFrame(() => void tick());
        };

        frameId = window.requestAnimationFrame(() => void tick());
      } catch {
        setError("ไม่สามารถเปิดกล้องได้ — อนุญาตการใช้กล้องในเบราว์เซอร์ หรือใช้ปืนยิงบาร์โค้ดแทน");
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      stopCamera();
    };
  }, [handleDetected, open, stopCamera]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">สแกนคูปอง</h3>
            <p className="text-xs text-slate-500">ชี้กล้องที่ QR หรือบาร์โค้ด — ใช้คูปองอัตโนมัติ</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800">
            ปิด
          </button>
        </div>

        <div className="p-4">
          {supported ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
              <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

          {!error && supported ? (
            <p className="mt-3 text-center text-xs text-slate-500">สแกนสำเร็จแล้วจะใช้คูปองทันที</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
