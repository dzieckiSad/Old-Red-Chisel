import type { Metadata } from "next";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { CornerMarks } from "@/components/sketch/ornaments";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { getContact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, email or WhatsApp Old Red Chisel in Athlone.",
};

export default async function ContactPage() {
  const site = await getContact();
  const items: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: "phone", label: "Phone", value: site.phone, href: site.phoneHref },
    { icon: "chat", label: "WhatsApp", value: "Send us a photo", href: site.whatsappHref },
    { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: "pin", label: "Workshop", value: site.address, href: site.mapsHref },
    { icon: "clock", label: "Workshop hours", value: site.hours },
    ...(site.facebook ? [{ icon: "facebook" as const, label: "Facebook", value: "Old Red Chisel", href: site.facebook }] : []),
  ];
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" intro="For a quote, the quickest way is our quote form. For anything else, here's how to reach us." />
      <Container className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="card p-6">
            <SketchIcon name={item.icon} size={44} />
            <p className="mt-3 text-sm text-graphite">{item.label}</p>
            {item.href ? (
              <a href={item.href} {...(item.href.startsWith("http") && { target: "_blank", rel: "noopener" })} className="mt-1 block font-semibold text-ink hover:text-brand">{item.value}</a>
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
