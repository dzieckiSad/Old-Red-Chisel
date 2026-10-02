// Private preview while the shop is being built: when SITE_PASSWORD is set, every page asks
// for that password first (src/proxy.ts). Remove the variable in Vercel to open the site.

export const SITE_LOCK_COOKIE = "orc_site";
export const UNLOCK_PATH = "/unlock";

export function sitePassword() {
  const value = process.env.SITE_PASSWORD?.trim();
  return value && value.length >= 6 ? value : null;
}

/** Cookie value for an unlocked browser. Changing the password locks everyone out again. */
export async function unlockToken(password: string) {
  const data = new TextEncoder().encode(`orc-site-lock-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
