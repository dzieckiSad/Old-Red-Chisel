// Shared definitions for the quote request form (used by the client form and the server action).

export const projectTypes = [
  { value: "kitchens", label: "Kitchen", group: "bespoke" },
  { value: "fitted-wardrobes", label: "Fitted wardrobes", group: "bespoke" },
  { value: "other-bespoke", label: "Other built-in joinery", group: "bespoke" },
  { value: "custom-product", label: "Custom shop piece", group: "bespoke" },
  { value: "interior", label: "Interior renovation", group: "build" },
  { value: "exterior", label: "Decking, fencing or garden", group: "build" },
  { value: "extensions-conversions", label: "Extension or conversion", group: "build" },
  { value: "small-jobs", label: "Small job", group: "build" },
] as const;

export const budgets = ["Under €1,000", "€1,000–€3,000", "€3,000–€10,000", "€10,000–€30,000", "Over €30,000", "Not sure yet"];
export const timings = ["As soon as possible", "Within 3 months", "3–6 months", "Just getting prices"];

export const MAX_PHOTOS = 5;
// Keep under the server action body limit in next.config.ts (form fields add a little overhead).
export const MAX_PHOTO_BYTES = 3.5 * 1024 * 1024;

const EIRCODE = /^([AC-FHKNPRTV-Y]\d{2}|D6W)\s?[0-9AC-FHKNPRTV-Y]{4}$/i;

export function isValidEircode(value: string) {
  return EIRCODE.test(value.trim());
}

/** Map links like /quote?type=bespoke&service=kitchens to a project type. */
export function initialProjectType(params: { type?: string; service?: string }) {
  const candidates = [params.service, params.type];
  return projectTypes.find((t) => candidates.includes(t.value))?.value ?? "";
}

export type QuoteState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; name: string };
