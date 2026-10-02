// Company details used across the site. Values marked TODO must be filled in before launch.
// Contact details, prices and home page texts are edited in the admin panel: see content.ts.
export const site = {
  name: "Old Red Chisel",
  tagline: "Home Improvements",
  description:
    "Handmade joinery, bespoke kitchens and fitted wardrobes, and complete home renovations from our workshop in Athlone.",
  url: "https://www.oldredchisel.ie", // TODO: confirm once the domain is bought
  serviceArea: ["Athlone", "Westmeath", "Roscommon", "Longford", "Offaly", "East Galway"],
  social: {
    facebook: "", // TODO: add Facebook page URL
  },
  company: {
    cro: "", // TODO: CRO number
    vat: "", // TODO: VAT number
  },
} as const;

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/bespoke", label: "Bespoke" },
  { href: "/build-renovate", label: "Build & Renovate" },
  { href: "/projects", label: "Projects" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/about", label: "About" },
] as const;
