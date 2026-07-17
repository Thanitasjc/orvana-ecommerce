"use client";

import type { CSSProperties, MouseEvent, PointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type LoopCarouselProps = {
  slides: ReactNode[];
  /** Visible slides when using responsive width (step = containerWidth / slidesPerView). */
  slidesPerView?: number;
  /** Fixed pixel width of one slide. Overrides slidesPerView when provided. */
  slideWidthPx?: number;
  /** Space between slides in px (applied as inner padding, so it also insets the edges). */
  gap?: number;
  autoPlayMs?: number;
  slideClassName?: string;
  ariaLabel?: string;
};

const arrowBaseStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.9)",
  color: "#0f172a",
  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
  cursor: "pointer",
};

export function LoopCarousel({
  slides,
  slidesPerView = 1,
  slideWidthPx,
  gap = 0,
  autoPlayMs = 3500,
  slideClassName = "",
  ariaLabel,
}: LoopCarouselProps) {
  const n = slides.length;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pos, setPos] = useState(n);
  const [transition, setTransition] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);

  const posRef = useRef(pos);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const movedRef = useRef(false);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const step =
    slideWidthPx && slideWidthPx > 0
      ? slideWidthPx
      : containerWidth > 0 && slidesPerView > 0
        ? containerWidth / slidesPerView
        : 0;
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const visible =
    slideWidthPx && slideWidthPx > 0
      ? step > 0
        ? Math.max(1, Math.floor(containerWidth / step))
        : 1
      : slidesPerView;
  const loopEnabled = n > 1 && n > visible;

  const move = useCallback(
    (dir: number) => {
      if (!loopEnabled) return;
      setTransition(true);
      setPos((prev) => prev + dir);
    },
    [loopEnabled],
  );

  const normalize = useCallback(() => {
    let p = posRef.current;
    if (p >= 2 * n) p -= n;
    else if (p < n) p += n;
    if (p !== posRef.current) {
      setTransition(false);
      setPos(p);
    }
  }, [n]);

  useEffect(() => {
    if (!loopEnabled || autoPlayMs <= 0 || dragging || hover) return;
    const timer = window.setInterval(() => move(1), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [loopEnabled, autoPlayMs, dragging, hover, move]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      if (!loopEnabled || event.button !== 0) return;
      dragStartXRef.current = event.clientX;
      dragStartPosRef.current = posRef.current;
      movedRef.current = false;
      setDragging(true);
      setTransition(false);
    },
    [loopEnabled],
  );

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: globalThis.PointerEvent) => {
      const dx = event.clientX - dragStartXRef.current;
      if (Math.abs(dx) > 4) movedRef.current = true;
      const s = stepRef.current || 1;
      let p = dragStartPosRef.current - dx / s;
      while (p < n * 0.5) p += n;
      while (p > n * 2.5) p -= n;
      setPos(p);
    };

    const onUp = () => {
      setDragging(false);
      setTransition(true);
      setPos(Math.round(posRef.current));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, n]);

  const onClickCapture = useCallback((event: MouseEvent) => {
    if (movedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      movedRef.current = false;
    }
  }, []);

  const rendered = loopEnabled ? [...slides, ...slides, ...slides] : slides;
  const translateX = loopEnabled && step > 0 ? -(pos * step) : 0;
  const slideWidthStyle = step > 0 ? `${step}px` : `${100 / Math.max(1, slidesPerView)}%`;

  return (
    <div
      ref={containerRef}
      className="swiper-container"
      style={{ position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="swiper-wrapper"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onTransitionEnd={normalize}
        style={{
          display: "flex",
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: transition ? "transform 0.5s ease" : "none",
          cursor: loopEnabled ? (dragging ? "grabbing" : "grab") : "default",
          touchAction: "pan-y",
          userSelect: dragging ? "none" : undefined,
        }}
      >
        {rendered.map((slide, idx) => (
          <div
            key={idx}
            className={slideClassName}
            style={{
              flex: `0 0 ${slideWidthStyle}`,
              maxWidth: slideWidthStyle,
              padding: gap > 0 ? `0 ${gap / 2}px` : undefined,
              boxSizing: "border-box",
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      {loopEnabled && (
        <>
          <button
            type="button"
            aria-label={ariaLabel ? `${ariaLabel} previous` : "Previous slide"}
            onClick={() => move(-1)}
            style={{ ...arrowBaseStyle, left: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={ariaLabel ? `${ariaLabel} next` : "Next slide"}
            onClick={() => move(1)}
            style={{ ...arrowBaseStyle, right: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
