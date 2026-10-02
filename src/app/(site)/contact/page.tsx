import type { Metadata } from "next";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { CornerMarks } from "@/components/sketch/ornaments";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call, email or WhatsApp Old Red Chisel in ${site.address.locality}.`,
};

export default function ContactPage() {
  const items: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: "phone", label: "Phone", value: site.phone, href: site.phoneHref },
    { icon: "chat", label: "WhatsApp", value: "Send us a photo", href: site.whatsappHref },
    { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: "pin", label: "Workshop", value: `${site.address.locality}, ${site.address.county}` },
  ];
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" intro="For a quote, the quickest way is our quote form. For anything else, here's how to reach us." />
      <Container className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="card p-6">
            <SketchIcon name={item.icon} size={44} />
            <p className="mt-3 text-sm text-graphite">{item.label}</p>
            {item.href ? (
              <a href={item.href} className="mt-1 block font-semibold text-ink hover:text-brand">{item.value}</a>
            ) : (
              <p className="mt-1 font-semibold text-ink">{item.value}</p>
            )}
            <CornerMarks />
          </div>
        ))}
      </Container>
      <Container className="pb-16">
        <ButtonLink href="/quote" arrow>Get a free quote</ButtonLink>
      </Container>
    </>
  );
}
