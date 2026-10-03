"use server";

import { isDatabaseConfigured } from "@/lib/db";
import { notifyWorkshopOfQuote } from "@/lib/email";
import { saveQuote } from "@/lib/quotes";
import { saveImage, uploadsAvailable } from "@/lib/uploads";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  type QuoteState,
  budgets,
  isValidEircode,
  projectTypes,
  timings,
} from "@/lib/quote";

function text(formData: FormData, key: string, max = 2000) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  // Honeypot: real visitors never fill this hidden field.
  if (text(formData, "company")) return { status: "success", name: "" };

  const request = {
    projectType: text(formData, "projectType"),
    product: text(formData, "product", 200),
    description: text(formData, "description", 5000),
    measurements: text(formData, "measurements", 1000),
    budget: text(formData, "budget"),
    timing: text(formData, "timing"),
    name: text(formData, "name", 200),
    email: text(formData, "email", 200),
    phone: text(formData, "phone", 50),
    town: text(formData, "town", 200),
    eircode: text(formData, "eircode", 10).toUpperCase(),
    contactPreference: text(formData, "contactPreference"),
  };
  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const fieldErrors: Record<string, string> = {};
  if (!projectTypes.some((t) => t.value === request.projectType)) fieldErrors.projectType = "Choose what you're planning.";
  if (request.description.length < 10) fieldErrors.description = "Tell us a little about the job.";
  if (request.budget && !budgets.includes(request.budget)) fieldErrors.budget = "Choose a budget range.";
  if (request.timing && !timings.includes(request.timing)) fieldErrors.timing = "Choose a timeframe.";
  if (!request.name) fieldErrors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(request.email)) fieldErrors.email = "Enter a valid email address.";
  if (request.phone.replace(/\D/g, "").length < 7) fieldErrors.phone = "Enter a phone number.";
  if (!request.town) fieldErrors.town = "Enter your town or area.";
  if (request.eircode && !isValidEircode(request.eircode)) fieldErrors.eircode = "That Eircode doesn't look right.";
  if (formData.get("consent") !== "on") fieldErrors.consent = "Please agree so we can contact you.";
  if (photos.length > MAX_PHOTOS) fieldErrors.photos = `Up to ${MAX_PHOTOS} photos, please.`;
  if (photos.reduce((s, f) => s + f.size, 0) > MAX_PHOTO_BYTES) fieldErrors.photos = "Photos are too large in total.";
  if (photos.some((f) => !f.type.startsWith("image/"))) fieldErrors.photos = "Only image files can be attached.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  // Saved in the admin panel (Quotes) and emailed to the workshop with the photos attached.
  // Either one is enough; the customer only sees an error if both fail.
  const label = projectTypes.find((t) => t.value === request.projectType)?.label ?? request.projectType;
  const [saved, emailed] = await Promise.all([
    (async () => {
      if (!isDatabaseConfigured()) return false;
      const urls: string[] = [];
      if (uploadsAvailable()) {
        for (const p of photos) {
          try {
            urls.push(await saveImage(p, "quote", "quotes"));
          } catch (err) {
            console.warn("Quote photo not stored", err);
          }
        }
      }
      await saveQuote({ ...request, projectType: label, photos: urls });
      return true;
    })().catch((err) => {
      console.error("Quote not saved", err);
      return false;
    }),
    (async () => {
      const attachments = await Promise.all(
        photos.map(async (p, i) => ({ filename: p.name || `photo-${i + 1}.jpg`, content: Buffer.from(await p.arrayBuffer()).toString("base64") })),
      );
      return notifyWorkshopOfQuote({ ...request, projectType: label }, attachments);
    })().catch((err) => {
      console.error("Quote email failed", err);
      return false;
    }),
  ]);
  if (!saved && !emailed) {
    console.info("Quote request (not saved or emailed)", { ...request, photos: photos.map((p) => `${p.name} (${p.size} B)`) });
    if (isDatabaseConfigured() || process.env.RESEND_API_KEY) {
      return { status: "error", message: "Sorry, we couldn't send your request just now. Please try again, or call or WhatsApp us." };
    }
  }

  return { status: "success", name: request.name.split(" ")[0] };
}
