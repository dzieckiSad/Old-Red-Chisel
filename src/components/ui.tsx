import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { SketchIcon } from "@/components/sketch/icons";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`} {...props} />;
}

type ButtonVariant = "primary" | "outline" | "light" | "dark";

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; arrow?: boolean };

export function ButtonLink({ variant = "primary", arrow, className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`btn btn--${variant} ${className}`} {...props}>
      {children}
      {arrow && <ButtonArrow />}
    </Link>
  );
}

export function ButtonArrow() {
  return (
    <svg className="btn__arrow" viewBox="0 0 20 12" width="18" height="11" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6h17 M13 1l5 5-5 5" />
    </svg>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-brand uppercase">
      <span aria-hidden className="h-0.5 w-6 bg-brand" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg text-graphite">{intro}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: ReactNode; intro?: string }) {
  return (
    <div className="border-b border-line bg-sand/60">
      <Container className="py-12 sm:py-16">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-graphite">{intro}</p>}
      </Container>
    </div>
  );
}

/** Wood-textured box shown where a photo will go. */
export function PhotoPlaceholder({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ?? "Photo coming soon"}
      className={`wood-placeholder flex items-end ${className}`}
    >
      {label && (
        <span className="m-3 bg-ink/60 px-2 py-1 text-xs font-medium text-white">{label}</span>
      )}
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-graphite">
          <SketchIcon name="tick" size={20} className="mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}
