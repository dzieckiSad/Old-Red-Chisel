"use client";

import { type ElementType, type ReactNode, useEffect, useRef } from "react";

/**
 * Fades and lifts its content into view the first time it scrolls on screen, and
 * triggers any `.sketch-draw` strokes inside it. Content is fully visible without JS
 * and for visitors who prefer reduced motion (see globals.css).
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Already on screen at load: don't hide it, just play the pencil strokes.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.dataset.reveal = "shown";
      return;
    }
    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
