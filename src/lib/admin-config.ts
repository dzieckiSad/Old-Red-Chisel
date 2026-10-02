// Shared by src/proxy.ts and the admin code. No secrets here: this file is public.

/** Internal route folder. Never reachable directly; src/proxy.ts answers 404 for it. */
export const ADMIN_INTERNAL = "/orc-admin-internal";

/**
 * TEMPORARY, at the owner's request while the site is being built: the panel is also
 * reachable at this simple address, without the terminal step (signing in is still
 * required). Set to null before launch, so the only way in is
 * `npm run admin` on the owner's computer.
 */
export const TEMP_SIMPLE_ADMIN_PATH: string | null = "/admin";

/**
 * TEMPORARY, at the owner's request while the site is being built: sign-in with password
 * only, no authenticator code. Set to false before launch; each admin then adds the
 * authenticator app on their next sign-in.
 */
export const TEMP_ADMIN_2FA_OFF = true;

/** The secret path from the environment, if it's set and long enough. */
export function secretAdminPath() {
  const slug = process.env.ADMIN_PATH?.replace(/^\/+|\/+$/g, "");
  return slug && /^[A-Za-z0-9_-]{12,}$/.test(slug) ? `/${slug}` : null;
}
