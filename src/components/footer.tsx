import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui";
import { categories } from "@/lib/catalog";
import { getServices } from "@/lib/services";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name })),
  },
  {
    title: "Services",
    links: [...getServices("bespoke"), ...getServices("build")].slice(0, 7).map((s) => ({
      href: `/${s.group === "bespoke" ? "bespoke" : "build-renovate"}/${s.slug}`,
      label: s.name,
    })),
  },
  {
    title: "Help",
    links: [
      { href: "/track", label: "Track your order" },
      { href: "/delivery", label: "Delivery & assembly" },
      { href: "/legal/returns", label: "Returns" },
      { href: "/legal/warranty", label: "Warranty" },
      { href: "/legal/terms", label: "Terms & conditions" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white/80">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo variant="dark" width={200} />
          <p className="mt-5 max-w-xs text-sm">{site.description}</p>
          <p className="mt-4 text-sm">
            {site.address.street}, {site.address.locality}, {site.address.county}
            <br />
            {site.hours}
            <br />
            <a href={site.phoneHref} className="hover:text-white">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-white">{col.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.name} {site.tagline}
            {site.company.cro && ` · CRO ${site.company.cro}`}
            {site.company.vat && ` · VAT ${site.company.vat}`}
          </span>
          <span>Serving {site.serviceArea.join(", ")}</span>
        </Container>
      </div>
    </footer>
  );
}
