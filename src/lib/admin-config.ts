// Shared by src/proxy.ts and the admin code. No secrets here: this file is public.

/** Internal route folder. Never reachable directly; src/proxy.ts answers 404 for it. */
export const ADMIN_INTERNAL = "/orc-admin-internal";

/** Public address of the admin panel. Protected by sign-in (see src/lib/admin-auth.ts). */
export const ADMIN_PATH = "/admin";

/**
 * TEMPORARY, at the owner's request while the site is being built: sign-in with the panel
 * password only. Set to false before launch; the panel then shows a QR code once for the
 * authenticator app, and every sign-in after that needs the password and a 6-digit code.
 */
export const TEMP_ADMIN_2FA_OFF = true;

/**
 * TEMPORARY, at the owner's request while the site is being built: the panel password when
 * ADMIN_PASSWORD isn't set in Vercel. Anyone who can read this repository can read it, so
 * remove it and set a strong ADMIN_PASSWORD before launch.
 */
export const TEMP_ADMIN_PASSWORD = "admin123";
