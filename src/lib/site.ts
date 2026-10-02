// Company details used across the site. Values marked TODO must be filled in before launch.
export const site = {
  name: "Old Red Chisel",
  tagline: "Home Improvements",
  description:
    "Handmade joinery, bespoke kitchens and fitted wardrobes, and complete home renovations from our workshop in Athlone.",
  url: "https://www.oldredchisel.ie", // TODO: confirm once the domain is bought
  phone: "+353 00 000 0000", // TODO
  phoneHref: "tel:+353000000000", // TODO
  whatsappHref: "https://wa.me/353000000000", // TODO
  email: "hello@oldredchisel.ie", // TODO
  address: {
    locality: "Athlone",
    county: "Co. Westmeath",
    country: "Ireland",
  },
  serviceArea: ["Athlone", "Westmeath", "Roscommon", "Longford", "Offaly", "East Galway"],
  social: {
    facebook: "", // TODO: add Facebook page URL
  },
  company: {
    cro: "", // TODO: CRO number
    vat: "", // TODO: VAT number
  },
  surveyFee: 75, // EUR, deducted from the order
  quoteResponseHours: 48,
} as const;

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/bespoke", label: "Bespoke" },
  { href: "/build-renovate", label: "Build & Renovate" },
  { href: "/projects", label: "Projects" },
  { href: "/how-we-work", label: "How we work" },
  { href: "/about", label: "About" },
] as const;
