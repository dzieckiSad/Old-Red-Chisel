import "server-only";
import Stripe from "stripe";

/**
 * stripe: real card payments (STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set).
 * demo:   no keys, local development only (or ALLOW_DEMO_PAYMENTS=1): a "simulate payment" button.
 *         Never on Vercel by default, since previews can share the live database.
 * off:    no keys on Vercel: checkout explains that online payment isn't available yet.
 */
export type PaymentMode = "stripe" | "demo" | "off";

export function paymentMode(): PaymentMode {
  if (process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return "stripe";
  if (!process.env.VERCEL || process.env.ALLOW_DEMO_PAYMENTS === "1") return "demo";
  return "off";
}

let client: Stripe | null = null;

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key);
  return client;
}
