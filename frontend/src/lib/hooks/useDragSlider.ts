"use client";

import type { CSSProperties, MouseEvent, PointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type UseDragSliderOptions = {
  /** Element that clips the slides; used to measure one slide step when stepPx is not given. */
  viewportRef: RefObject<HTMLElement | null>;
  /** How many slides are visible at once (step = viewportWidth / slidesPerView). */
  slidesPerView?: number;
  /** Fixed pixel width of one slide step. Overrides slidesPerView when provided. */
  stepPx?: number;
  index: number;
  maxIndex: number;
  setIndex: (index: number) => void;
  enabled?: boolean;
};

type DragProps = {
  onPointerDown: (event: PointerEvent) => void;
  onClickCapture: (event: MouseEvent) => void;
  style: CSSProperties;
};

export function useDragSlider({
  viewportRef,
  slidesPerView = 1,
  stepPx,
  index,
  maxIndex,
  setIndex,
  enabled = true,
}: UseDragSliderOptions): { dragOffset: number; isDragging: boolean; dragProps: DragProps } {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const getStep = useCallback(() => {
    if (stepPx && stepPx > 0) return stepPx;
    const width = viewportRef.current?.clientWidth ?? 0;
    return width > 0 && slidesPerView > 0 ? width / slidesPerView : 0;
  }, [stepPx, slidesPerView, viewportRef]);

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      if (!enabled || maxIndex <= 0 || event.button !== 0) return;
      startXRef.current = event.clientX;
      movedRef.current = false;
      setIsDragging(true);
    },
    [enabled, maxIndex],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (event: globalThis.PointerEvent) => {
      const rawDelta = event.clientX - startXRef.current;
      if (Math.abs(rawDelta) > 4) movedRef.current = true;

      const step = getStep();
      if (step > 0) {
        const min = -(maxIndex - index) * step - step * 0.2;
        const max = index * step + step * 0.2;
        setDragOffset(Math.max(min, Math.min(max, rawDelta)));
      } else {
        setDragOffset(rawDelta);
      }
    };

    const onUp = () => {
      const step = getStep() || 1;
      const steps = Math.round(-dragOffset / step);
      setIndex(Math.min(maxIndex, Math.max(0, index + steps)));
      setDragOffset(0);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, dragOffset, index, maxIndex, setIndex, getStep]);

  const onClickCapture = useCallback((event: MouseEvent) => {
    if (movedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      movedRef.current = false;
    }
  }, []);

  const dragProps: DragProps = {
    onPointerDown,
    onClickCapture,
    style: {
      cursor: enabled && maxIndex > 0 ? (isDragging ? "grabbing" : "grab") : "default",
      touchAction: "pan-y",
      userSelect: isDragging ? "none" : undefined,
    },
  };

  return { dragOffset, isDragging, dragProps };
}
