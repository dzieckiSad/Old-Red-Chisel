"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { DeliveryMethod, OrderItem, OrderStatus } from "@/lib/db/schema";
import { orderStatuses } from "@/lib/db/schema";
import { type ManualPayment, manualPayments } from "@/lib/order-status";
import { createManualOrder, resetOrderPassword } from "@/lib/orders";
import { isValidEircode } from "@/lib/quote";

export type ManualOrderState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  created?: { id: string; code: string; password: string; emailed: boolean; emailFailed: boolean };
};

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const methods: DeliveryMethod[] = ["collection", "delivery", "delivery_assembly"];

function cents(value: string) {
  const n = Number(value.replace(",", ".").replace(/[€\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export async function createManualOrderAction(_prev: ManualOrderState, f: FormData): Promise<ManualOrderState> {
  await requireAdmin();

  const deliveryMethod = str(f, "deliveryMethod") as DeliveryMethod;
  const status = str(f, "status") as OrderStatus;
  const payment = str(f, "payment") as ManualPayment;
  const email = str(f, "email", 200);
  const eircode = str(f, "eircode", 10).toUpperCase();
  const fee = str(f, "deliveryFee") ? cents(str(f, "deliveryFee")) : 0;
  const etaDate = str(f, "etaDate");

  let items: OrderItem[] = [];
  try {
    const raw = JSON.parse(str(f, "items", 20000) || "[]") as { slug?: string; name?: string; details?: string; price?: string; quantity?: number }[];
    items = raw
      .filter((r) => String(r.name ?? "").trim())
      .slice(0, 50)
      .map((r) => ({
        slug: String(r.slug || "custom").slice(0, 100),
        name: String(r.name).trim().slice(0, 200),
        options: (r.details?.trim() ? { Details: r.details.trim().slice(0, 300) } : {}) as Record<string, string>,
        unitPrice: cents(String(r.price ?? "")),
        quantity: Math.floor(Number(r.quantity) || 0),
      }));
  } catch {
    items = [];
  }

  const fieldErrors: Record<string, string> = {};
  if (!str(f, "name")) fieldErrors.name = "Enter the customer's name.";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = "That email doesn't look right.";
  if (f.get("emailCustomer") === "on" && !email) fieldErrors.email = "Add an email to send the details to.";
  if (!methods.includes(deliveryMethod)) fieldErrors.deliveryMethod = "Choose delivery or collection.";
  if (eircode && !isValidEircode(eircode)) fieldErrors.eircode = "That Eircode doesn't look right.";
  if (Number.isNaN(fee) || fee < 0) fieldErrors.deliveryFee = "Enter a delivery price in euro, or leave empty.";
  if (!orderStatuses.includes(status) || status === "pending_payment") fieldErrors.status = "Choose a status.";
  if (!(payment in manualPayments)) fieldErrors.payment = "Choose how it's paid.";
  if (etaDate && !/^\d{4}-\d{2}-\d{2}$/.test(etaDate)) fieldErrors.etaDate = "Choose a valid date.";
  if (items.length === 0) fieldErrors.items = "Add at least one item.";
  else if (items.some((i) => Number.isNaN(i.unitPrice) || i.unitPrice < 0 || i.quantity < 1 || i.quantity > 999)) {
    fieldErrors.items = "Every item needs a price (0 or more) and a quantity of at least 1.";
  }
  if (Object.keys(fieldErrors).length) return { error: "Please check the highlighted fields.", fieldErrors };

  const delivering = deliveryMethod !== "collection";
  const result = await createManualOrder({
    customerName: str(f, "name", 200),
    email,
    phone: str(f, "phone", 50),
    deliveryMethod,
    address: delivering ? str(f, "address", 500) || null : null,
    town: delivering ? str(f, "town", 200) || null : null,
    eircode: eircode || null,
    notes: str(f, "notes", 1000) || null,
    items,
    deliveryFee: fee,
    status,
    etaDate: etaDate || null,
    statusNote: str(f, "statusNote", 1000) || null,
    payment,
    emailCustomer: f.get("emailCustomer") === "on",
  });

  revalidatePath("/orc-admin-internal");
  return {
    created: {
      id: result.order.id,
      code: result.order.code,
      password: result.password,
      emailed: f.get("emailCustomer") === "on" && !result.emailFailed,
      emailFailed: result.emailFailed,
    },
  };
}

export async function resetOrderPasswordAction(orderId: string): Promise<{ password?: string; error?: string }> {
  await requireAdmin();
  const password = await resetOrderPassword(orderId);
  return password ? { password } : { error: "Order not found." };
}
