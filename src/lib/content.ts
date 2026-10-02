import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { type DeliveryZone, type SiteContent, contactLinks, defaultContent } from "@/lib/content-defaults";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { type Service, services } from "@/lib/services";

// Content edited in the admin panel is stored as one JSON document in admin_settings
// ("content") and merged over the defaults, so new fields always have a value.

const KEY = "content";

// Same rule as products: local builds render the defaults (see src/lib/products.ts).
const dbEnabled = () =>
  isDatabaseConfigured() && !(process.env.NEXT_PHASE === "phase-production-build" && !process.env.DATABASE_URL);

function merge(saved: Partial<SiteContent> | null): SiteContent {
  if (!saved) return defaultContent;
  return {
    contact: { ...defaultContent.contact, ...saved.contact },
    surveyFee: typeof saved.surveyFee === "number" ? saved.surveyFee : defaultContent.surveyFee,
    quoteResponseHours: typeof saved.quoteResponseHours === "number" ? saved.quoteResponseHours : defaultContent.quoteResponseHours,
    home: { ...defaultContent.home, ...saved.home },
    deliveryZones: Array.isArray(saved.deliveryZones) && saved.deliveryZones.length ? saved.deliveryZones : defaultContent.deliveryZones,
    servicePrices: { ...defaultContent.servicePrices, ...saved.servicePrices },
  };
}

/** The site's editable content, read once per request. */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!dbEnabled()) return defaultContent;
  try {
    const db = await getDb();
    const [row] = await db.select().from(adminSettings).where(eq(adminSettings.key, KEY));
    return merge(row ? (JSON.parse(row.value) as Partial<SiteContent>) : null);
  } catch (err) {
    console.error("Could not read site content, using defaults", err);
    return defaultContent;
  }
});

export async function saveContent(content: SiteContent) {
  const db = await getDb();
  const value = JSON.stringify(content);
  await db.insert(adminSettings).values({ key: KEY, value }).onConflictDoUpdate({ target: adminSettings.key, set: { value } });
}

/** Contact details plus the links built from them. */
export async function getContact() {
  const { contact } = await getContent();
  return { ...contact, ...contactLinks(contact) };
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  return (await getContent()).deliveryZones;
}

/** Services with the "from" prices set in the admin panel. */
export async function getServicesWithPrices(): Promise<Service[]> {
  const { servicePrices } = await getContent();
  return services.map((s) => (s.slug in servicePrices ? { ...s, fromPrice: servicePrices[s.slug] || undefined } : s));
}
