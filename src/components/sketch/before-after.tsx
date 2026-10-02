"use client";

import { type KeyboardEvent, type PointerEvent, type ReactNode, useRef, useState } from "react";

/**
 * Drag (mouse or finger) or use the arrow keys to compare a "before" and "after" view.
 * `before` and `after` are any visual (img, next/image, placeholder) sized to fill the box.
 */
export function BeforeAfter({
  before,
  after,
  label = "Before and after comparison",
  className = "",
}: {
  before: ReactNode;
  after: ReactNode;
  label?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  function moveTo(clientX: number) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    moveTo(e.clientX);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" ? pos - step
      : e.key === "ArrowRight" ? pos + step
      : e.key === "Home" ? 0
      : e.key === "End" ? 100
      : null;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
  }

  return (
    <div
      ref={box}
      className={`before-after relative isolate touch-pan-y overflow-hidden select-none ${dragging ? "cursor-grabbing" : "cursor-ew-resize"} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => dragging && moveTo(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>

      <span className="font-hand pointer-events-none absolute top-3 left-3 z-10 -rotate-3 bg-white/90 px-2 text-xl leading-tight text-ink shadow-sm">
        before
      </span>
      <span className="font-hand pointer-events-none absolute top-3 right-3 z-10 rotate-2 bg-white/90 px-2 text-xl leading-tight text-brand shadow-sm">
        after
      </span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before`}
        onKeyDown={onKeyDown}
        className="before-after__handle absolute inset-y-0 z-20 -ml-px w-0.5 bg-white focus-visible:outline-none"
        style={{ left: `${pos}%` }}
      >
        <span className="before-after__knob">
          <svg viewBox="0 0 32 16" width="28" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2L3 8l7 6 M22 2l7 6-7 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
