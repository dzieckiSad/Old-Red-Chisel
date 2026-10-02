import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/shop", "/bespoke", "/build-renovate", "/projects", "/how-we-work", "/about", "/contact", "/quote", "/delivery", "/track"];
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}` })),
    ...getProducts().map((p) => ({ url: `${site.url}/shop/${p.slug}` })),
    ...services.map((s) => ({ url: `${site.url}/${s.group === "bespoke" ? "bespoke" : "build-renovate"}/${s.slug}` })),
  ];
}
