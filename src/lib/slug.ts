/** Web-address form of a product name: "Oak Bar 2.0" -> "oak-bar-2-0". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // accents split off by NFKD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
