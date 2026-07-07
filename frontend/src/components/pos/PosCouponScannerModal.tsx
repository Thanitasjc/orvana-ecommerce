"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserCodeReader, BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

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
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanLockRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    if (videoRef.current) {
      BrowserCodeReader.cleanVideoSource(videoRef.current);
    }
    BrowserCodeReader.releaseAllStreams();
    setCameraReady(false);
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

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("เบราว์เซอร์นี้ไม่รองรับกล้อง — ใช้ปืนยิงบาร์โค้ดหรือพิมพ์รหัสแทน");
      return;
    }

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    async function startScanner() {
      const video = videoRef.current;
      if (!video) return;

      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          video,
          (result, err) => {
            if (cancelled || scanLockRef.current) return;

            if (result) {
              handleDetected(result.getText());
              return;
            }

            if (err && !(err instanceof NotFoundException)) {
              console.debug("Barcode scan frame error:", err);
            }
          },
        );

        if (cancelled) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setCameraReady(true);
      } catch {
        if (!cancelled) {
          setError("ไม่สามารถเปิดกล้องได้ — อนุญาตการใช้กล้องในเบราว์เซอร์ หรือใช้ปืนยิงบาร์โค้ดแทน");
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
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
          {!error ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black">
              <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline autoPlay />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
              {!cameraReady ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
                  กำลังเปิดกล้อง...
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          {!error ? (
            <p className="mt-3 text-center text-xs text-slate-500">
              {cameraReady ? "สแกนสำเร็จแล้วจะใช้คูปองทันที" : "รออนุญาตการใช้กล้องจากเบราว์เซอร์"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
