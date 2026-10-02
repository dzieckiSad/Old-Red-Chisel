"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const count = cart.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="hidden bg-ink text-xs text-white/80 sm:block">
        <Container className="flex justify-between py-2">
          <span>Handmade in our Athlone workshop · Serving the Midlands</span>
          <a href={site.phoneHref} className="hover:text-white">
            {site.phone}
          </a>
        </Container>
      </div>
      <Container className="flex items-center justify-between gap-4 py-3">
        <Link href="/" aria-label="Old Red Chisel home" onClick={() => setOpen(false)}>
          <Logo height={56} priority />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium hover:text-brand ${
                pathname.startsWith(item.href) ? "text-brand" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative px-3 py-2 text-sm font-medium text-ink hover:bg-sand"
          >
            Cart
            {count > 0 && (
              <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/quote"
            className="btn btn--primary hidden !px-4 !py-2.5 sm:inline-flex"
          >
            Free quote
          </Link>
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line lg:hidden">
          <Container className="flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="btn btn--primary my-3"
            >
              Get a free quote
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
