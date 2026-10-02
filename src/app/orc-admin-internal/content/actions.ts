"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { saveContent } from "@/lib/content";
import type { DeliveryZone, SiteContent } from "@/lib/content-defaults";
import { services } from "@/lib/services";

export type ContentFormState = { error?: string; fieldErrors?: Record<string, string>; saved?: boolean };

const str = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);

/** "" → null (not offered), otherwise a euro amount. */
function euro(value: string): number | null {
  if (!value) return null;
  const n = Number(value.replace(",", ".").replace(/[€\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

export async function saveSiteContent(_prev: ContentFormState, f: FormData): Promise<ContentFormState> {
  await requireAdmin();
  const fieldErrors: Record<string, string> = {};

  const contact: SiteContent["contact"] = {
    phone: str(f, "phone", 40),
    whatsapp: str(f, "whatsapp", 20).replace(/\D/g, ""),
    email: str(f, "email", 120),
    street: str(f, "street", 120),
    locality: str(f, "locality", 80),
    county: str(f, "county", 80),
    hours: str(f, "hours", 120),
    mapsHref: str(f, "mapsHref", 500),
  };
  if (!/\d{6,}/.test(contact.phone.replace(/\D/g, ""))) fieldErrors.phone = "Enter a phone number.";
  if (contact.whatsapp.length < 9) fieldErrors.whatsapp = "Digits only, with the country code: 353 and the number without the first 0.";
  if (!/^\S+@\S+\.\S+$/.test(contact.email)) fieldErrors.email = "Enter a valid email.";
  if (!contact.locality) fieldErrors.locality = "Enter the town.";
  if (contact.mapsHref && !/^https:\/\//.test(contact.mapsHref)) fieldErrors.mapsHref = "Paste the full link, starting with https://";

  const surveyFee = euro(str(f, "surveyFee", 10));
  if (surveyFee === null || Number.isNaN(surveyFee)) fieldErrors.surveyFee = "Enter the survey fee in euro, e.g. 75.";
  const hours = Number(str(f, "quoteResponseHours", 4));
  if (!Number.isInteger(hours) || hours < 1 || hours > 240) fieldErrors.quoteResponseHours = "Enter a number of hours, e.g. 48.";

  const home: SiteContent["home"] = {
    eyebrow: str(f, "eyebrow", 120),
    headline: str(f, "headline", 160),
    intro: str(f, "intro", 400),
  };
  if (!home.headline) fieldErrors.headline = "The headline can't be empty.";
  if ((home.headline.match(/\*/g)?.length ?? 0) % 2) fieldErrors.headline = "Use the * in pairs, around the words to underline.";

  const zoneCount = Math.min(Number(str(f, "zoneCount", 3)) || 0, 12);
  const deliveryZones: DeliveryZone[] = [];
  for (let i = 0; i < zoneCount; i++) {
    const name = str(f, `zone${i}name`, 60);
    if (!name) continue;
    const delivery = euro(str(f, `zone${i}delivery`, 10));
    const assembly = euro(str(f, `zone${i}assembly`, 10));
    if (Number.isNaN(delivery)) fieldErrors[`zone${i}delivery`] = "Euro amount, or empty for “on request”.";
    if (Number.isNaN(assembly)) fieldErrors[`zone${i}assembly`] = "Euro amount, or empty for “not offered”.";
    deliveryZones.push({ name, area: str(f, `zone${i}area`, 160), delivery, assembly });
  }
  if (!deliveryZones.length) fieldErrors.zones = "Keep at least one delivery zone.";

  const servicePrices: Record<string, string> = {};
  for (const s of services) servicePrices[s.slug] = str(f, `price_${s.slug}`, 60);

  if (Object.keys(fieldErrors).length) return { error: "Please check the highlighted fields.", fieldErrors };

  await saveContent({
    contact,
    surveyFee: surveyFee as number,
    quoteResponseHours: hours,
    home,
    deliveryZones,
    servicePrices,
  });
  revalidatePath("/", "layout");
  return { saved: true };
}
