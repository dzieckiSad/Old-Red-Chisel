import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/service-pages";
import { getService, getServices } from "@/lib/services";

export function generateStaticParams() {
  return getServices("build").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/build-renovate/[slug]">): Promise<Metadata> {
  const service = getService("build", (await params).slug);
  return service ? { title: service.name, description: service.summary } : {};
}

export default async function BuildRenovateServicePage({ params }: PageProps<"/build-renovate/[slug]">) {
  const service = getService("build", (await params).slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
