// Shared by src/proxy.ts and the admin code. No secrets here: this file is public.

/** Internal route folder. Never reachable directly; src/proxy.ts answers 404 for it. */
export const ADMIN_INTERNAL = "/orc-admin-internal";

/** Public address of the admin panel. Protected by sign-in (see src/lib/admin-auth.ts). */
export const ADMIN_PATH = "/admin";

/**
 * TEMPORARY, at the owner's request while the site is being built: sign-in with password
 * only, no authenticator code. Set to false before launch; each admin then adds the
 * authenticator app on their next sign-in.
 */
export const TEMP_ADMIN_2FA_OFF = true;
