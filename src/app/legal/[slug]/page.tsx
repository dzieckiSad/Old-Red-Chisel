import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";

// TODO: final wording must be written or reviewed by a solicitor before launch.
const pages = {
  terms: {
    title: "Terms & conditions",
    body: [
      "These terms cover purchases from our online shop and bespoke or building work quoted by Old Red Chisel.",
      "Bespoke and building work is carried out under the written quote you accept, which sets out the scope, price, payment stages and timeline.",
    ],
  },
  returns: {
    title: "Returns",
    body: [
      "In-stock shop items can be returned within 14 days of delivery under the Consumer Rights Act 2022. Contact us first so we can arrange collection.",
      "Made-to-order pieces built to your chosen size, timber or finish, and bespoke joinery, are made specifically for you and cannot be returned unless faulty.",
    ],
  },
  warranty: {
    title: "Warranty",
    body: [
      "Our joinery is guaranteed against defects in materials and workmanship. Warranty length and conditions will be confirmed here.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      "We use the details you send us only to reply to your enquiry, deliver your order or carry out your project. We don't sell your data.",
      "Photos you upload with a quote request are used only to prepare your quote.",
    ],
  },
} as const;

type Slug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const page = pages[(await params).slug as Slug];
  return page ? { title: page.title } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const page = pages[(await params).slug as Slug];
  if (!page) notFound();
  return (
    <>
      <PageHeader eyebrow="Help" title={page.title} />
      <Container className="max-w-3xl space-y-4 py-12 text-graphite">
        <p className="rounded-md bg-sand px-3 py-2 text-sm">Draft: full wording to follow.</p>
        {page.body.map((p) => <p key={p}>{p}</p>)}
      </Container>
    </>
  );
}
