import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getProjects } from "@/lib/projects";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

// Product data can change from the admin panel; saves also refresh pages immediately.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/shop", "/bespoke", "/build-renovate", "/projects", "/how-we-work", "/about", "/contact", "/quote", "/delivery", "/track"];
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}` })),
    ...(await getProducts()).map((p) => ({ url: `${site.url}/shop/${p.slug}` })),
    ...(await getProjects()).map((p) => ({ url: `${site.url}/projects/${p.slug}` })),
    ...services.map((s) => ({ url: `${site.url}/${s.group === "bespoke" ? "bespoke" : "build-renovate"}/${s.slug}` })),
  ];
}
