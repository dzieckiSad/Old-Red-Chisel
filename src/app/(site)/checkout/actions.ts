"use server";

import { isDatabaseConfigured } from "@/lib/db";
import type { DeliveryMethod } from "@/lib/db/schema";
import { CheckoutError, createPendingOrder, getOrder, markPaid, priceCart, setPaymentRef } from "@/lib/orders";
import { paymentMode, stripe } from "@/lib/payments";
import { isValidEircode } from "@/lib/quote";
import { allowAttempt, clientIp } from "@/lib/rate-limit";
import { getContact } from "@/lib/content";

export type CheckoutInput = {
  cart: { slug: string; options: Record<string, string>; quantity: number }[];
  name: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryZone: string;
  address: string;
  town: string;
  eircode: string;
  notes: string;
  acceptTerms: boolean;
};

export type CheckoutResult =
  | { ok: true; orderId: string; total: number; clientSecret?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const methods: DeliveryMethod[] = ["collection", "delivery", "delivery_assembly"];

export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const { phone } = await getContact();
  const mode = paymentMode();
  if (mode === "off" || !isDatabaseConfigured()) {
    return { ok: false, message: `Online payment isn't available yet. Please call us on ${phone} to order.` };
  }

  const v = {
    name: String(input.name ?? "").trim().slice(0, 200),
    email: String(input.email ?? "").trim().slice(0, 200),
    phone: String(input.phone ?? "").trim().slice(0, 50),
    address: String(input.address ?? "").trim().slice(0, 500),
    town: String(input.town ?? "").trim().slice(0, 200),
    eircode: String(input.eircode ?? "").trim().toUpperCase().slice(0, 10),
    notes: String(input.notes ?? "").trim().slice(0, 1000),
  };
  const method = methods.includes(input.deliveryMethod) ? input.deliveryMethod : null;
  const delivering = method !== "collection";

  const fieldErrors: Record<string, string> = {};
  if (!v.name) fieldErrors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) fieldErrors.email = "Enter a valid email address. Your order details are sent here.";
  if (v.phone.replace(/\D/g, "").length < 7) fieldErrors.phone = "Enter a phone number for delivery.";
  if (!method) fieldErrors.deliveryMethod = "Choose delivery or collection.";
  if (delivering && !v.address) fieldErrors.address = "Enter the delivery address.";
  if (delivering && !v.town) fieldErrors.town = "Enter the town.";
  if (v.eircode && !isValidEircode(v.eircode)) fieldErrors.eircode = "That Eircode doesn't look right.";
  if (!input.acceptTerms) fieldErrors.acceptTerms = "Please accept the terms to continue.";
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Please check the highlighted fields.", fieldErrors };

  try {
    if (!(await allowAttempt(`checkout:${await clientIp()}`, 15, 60 * 60))) {
      return { ok: false, message: `Too many checkout attempts. Please try again later or call us on ${phone}.` };
    }
    const items = await priceCart(Array.isArray(input.cart) ? input.cart : []);
    const order = await createPendingOrder({
      customerName: v.name,
      email: v.email,
      phone: v.phone,
      deliveryMethod: method!,
      deliveryZone: delivering ? String(input.deliveryZone ?? "") : null,
      address: delivering ? v.address : null,
      town: delivering ? v.town : null,
      eircode: v.eircode || null,
      notes: v.notes || null,
      items,
    });

    if (mode === "demo") return { ok: true, orderId: order.id, total: order.total };

    const intent = await stripe().paymentIntents.create({
      amount: order.total,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      receipt_email: order.email,
      description: `Old Red Chisel order ${order.code}`,
      metadata: { orderId: order.id, orderCode: order.code },
    });
    await setPaymentRef(order.id, intent.id);
    return { ok: true, orderId: order.id, total: order.total, clientSecret: intent.client_secret ?? undefined };
  } catch (err) {
    if (err instanceof CheckoutError) return { ok: false, message: err.message };
    console.error("Checkout failed", err);
    return { ok: false, message: `Something went wrong starting the payment. Please try again or call us on ${phone}.` };
  }
}

/** Development and preview only: completes an order without a real payment. */
export async function simulatePayment(orderId: string) {
  if (paymentMode() !== "demo") throw new Error("Simulated payments are disabled.");
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending_payment") throw new Error("Order not found.");
  await markPaid(order.id, `demo_${Date.now()}`);
}
