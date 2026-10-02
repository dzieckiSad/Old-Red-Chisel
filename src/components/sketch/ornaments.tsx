import type { ReactNode } from "react";

/** A word underlined with a pencil stroke that draws itself when revealed. */
export function SketchUnderline({ children, color = "var(--color-brand)" }: { children: ReactNode; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="sketch-draw absolute -bottom-[0.18em] left-[-2%] h-[0.32em] w-[104%] overflow-visible"
      >
        <path
          d="M2 9C40 4 90 3 132 5s52 3 66 2 M10 12c46-4 104-5 176-3"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          filter="url(#sketch-line)"
        />
      </svg>
    </span>
  );
}

/** A loose pencil ring around a price, number or short word. */
export function SketchCircle({ children, color = "var(--color-brand)" }: { children: ReactNode; color?: string }) {
  return (
    <span className="relative inline-block px-[0.35em]">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 120 60"
        preserveAspectRatio="none"
        className="sketch-draw pointer-events-none absolute -inset-x-[0.15em] -inset-y-[0.3em] h-[calc(100%+0.6em)] w-[calc(100%+0.3em)] overflow-visible"
      >
        <path
          d="M64 4C30 3 4 13 5 31s30 26 60 25 52-10 50-28C113 12 88 4 58 6 44 7 34 10 28 13"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={1}
          filter="url(#sketch-line)"
        />
      </svg>
    </span>
  );
}

/** Section divider drawn as a carpenter's folding rule. */
export function RulerDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`ruler-divider ${className}`}>
      <div className="ruler-divider__rule" />
    </div>
  );
}

/** Carpenter's marking brackets on each corner of the parent (parent must be `relative`). */
export function CornerMarks({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`corner-marks ${className}`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/** Photo frame: a pale mount, mitred corner marks and an optional pencilled caption. */
export function Frame({ children, caption, className = "" }: { children: ReactNode; caption?: string; className?: string }) {
  return (
    <figure className={`frame relative bg-white p-2.5 shadow-[0_1px_0_var(--color-line),0_12px_30px_-18px_rgb(36_32_29/0.45)] ${className}`}>
      <div className="relative overflow-hidden">{children}</div>
      <CornerMarks />
      {caption && <figcaption className="font-hand px-1 pt-2 text-xl leading-none text-graphite">{caption}</figcaption>}
    </figure>
  );
}

/** Handwritten pencil note, e.g. next to a price or heading. */
export function PencilNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-hand text-2xl leading-none text-graphite ${className}`}>{children}</span>;
}
