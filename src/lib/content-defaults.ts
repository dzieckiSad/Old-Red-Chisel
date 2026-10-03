// Site content the owner can change in the admin panel (Content). These are the defaults; saved
// changes live in the database (see src/lib/content.ts). Safe to import in client components.

export type DeliveryZone = { name: string; area: string; delivery: number | null; assembly: number | null };

export type SiteContent = {
  contact: {
    phone: string;
    /** WhatsApp number in international format, digits only, e.g. 353894928771. */
    whatsapp: string;
    email: string;
    street: string;
    locality: string;
    county: string;
    hours: string;
    mapsHref: string;
    /** Facebook page link. Empty = not shown. */
    facebook: string;
  };
  surveyFee: number; // EUR, deducted from the order
  quoteResponseHours: number;
  home: {
    eyebrow: string;
    /** Words between *asterisks* get the pencil underline. */
    headline: string;
    intro: string;
  };
  deliveryZones: DeliveryZone[];
  /** "from" price shown on each service page, by service slug. Empty = not shown. */
  servicePrices: Record<string, string>;
};

export const defaultContent: SiteContent = {
  contact: {
    phone: "089 492 8771",
    whatsapp: "353894928771",
    email: "oldredchisel@gmail.com",
    street: "Golden Island",
    locality: "Athlone",
    county: "Co. Westmeath",
    hours: "Mon – Fri, 9:00 – 17:30",
    mapsHref: "https://maps.app.goo.gl/boCn4FWCBCWbT2wEA?g_st=ic",
    facebook: "https://www.facebook.com/share/1BrLMLQpPV/",
  },
  surveyFee: 75,
  quoteResponseHours: 48,
  home: {
    eyebrow: "Handmade in Athlone · Serving the Midlands",
    headline: "Joinery made *by hand.* Homes improved by the same hands.",
    intro: "From a single bedside locker to a bespoke kitchen or a full renovation, built in our own workshop and fitted by our own team.",
  },
  // TODO: confirm prices with the owner.
  deliveryZones: [
    { name: "Workshop collection", area: "Collect from our Athlone workshop", delivery: 0, assembly: null },
    { name: "Zone 1", area: "Athlone and up to 30 km", delivery: 30, assembly: 40 },
    { name: "Zone 2", area: "30–60 km: most of Westmeath, Roscommon, Longford, Offaly", delivery: 50, assembly: 50 },
    { name: "Zone 3", area: "60–100 km", delivery: 80, assembly: 60 },
    { name: "Further afield", area: "Over 100 km", delivery: null, assembly: null },
  ],
  servicePrices: {},
};

/** An Irish phone number in international form, e.g. 089 492 8771 → +353894928771. */
export function intlPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : digits.startsWith("00") ? `+${digits.slice(2)}` : digits.startsWith("0") ? `+353${digits.slice(1)}` : `+${digits}`;
}

/** Links built from the contact details. */
export function contactLinks(c: SiteContent["contact"]) {
  return {
    phoneHref: `tel:${intlPhone(c.phone)}`,
    whatsappHref: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`,
    address: [c.street, c.locality, c.county].filter(Boolean).join(", "),
  };
}

/** Zones customers can choose for delivery (not collection, not "on request"). */
export const servedZones = (zones: DeliveryZone[]) => zones.filter((z) => z.delivery !== null && z.delivery > 0);
