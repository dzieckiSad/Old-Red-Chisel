import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`} {...props} />;
}

const buttonStyles = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-ink/20 bg-white text-ink hover:border-ink/40",
  light: "bg-white text-ink hover:bg-sand",
};

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles };

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition-colors ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
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

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
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
      className={`wood-placeholder flex items-end rounded-lg ${className}`}
    >
      {label && (
        <span className="m-3 rounded bg-ink/60 px-2 py-1 text-xs font-medium text-white">{label}</span>
      )}
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-graphite">
          <span aria-hidden className="mt-1 text-brand">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
