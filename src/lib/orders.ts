import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentPrice } from "@/lib/catalog";
import { getProduct, takeFromStock } from "@/lib/products";
import { getDb } from "@/lib/db";
import { type DeliveryMethod, type OrderItem, type OrderStatus, orderEvents, orders } from "@/lib/db/schema";
import { deliveryZones } from "@/lib/delivery";
import { sendOrderCredentialsEmail } from "@/lib/email";
import type { ManualPayment } from "@/lib/order-status";
import { hashPassword, newOrderCode, newOrderPassword, seal, unseal } from "@/lib/security";

export type Order = typeof orders.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;

export class CheckoutError extends Error {}

const cents = (eur: number) => Math.round(eur * 100);

/** Re-prices the cart from the catalogue. Prices sent by the browser are never trusted. */
export async function priceCart(lines: { slug: string; options: Record<string, string>; quantity: number }[]): Promise<OrderItem[]> {
  if (lines.length === 0) throw new CheckoutError("Your cart is empty.");
  return Promise.all(lines.map(async (line) => {
    const product = await getProduct(String(line.slug));
    if (!product || product.mode === "quote_only") throw new CheckoutError("An item in your cart is no longer available.");
    const quantity = Math.floor(line.quantity);
    if (!(quantity >= 1 && quantity <= 20)) throw new CheckoutError("Please check the quantities in your cart.");
    if (product.mode === "in_stock" && quantity > (product.stock ?? 0)) {
      throw new CheckoutError(`Only ${product.stock ?? 0} of ${product.name} left in stock.`);
    }
    const options: Record<string, string> = {};
    let price = currentPrice(product);
    for (const option of product.options ?? []) {
      const choice = option.choices.find((c) => c.label === line.options?.[option.name]) ?? option.choices[0];
      options[option.name] = choice.label;
      price += choice.priceDelta;
    }
    return { slug: product.slug, name: product.name, options, unitPrice: cents(price), quantity };
  }));
}

export function deliveryFee(method: DeliveryMethod, zoneName: string | null) {
  if (method === "collection") return 0;
  const zone = deliveryZones.find((z) => z.name === zoneName);
  if (!zone || zone.delivery === null) throw new CheckoutError("Choose a delivery zone we cover, or workshop collection.");
  const assembly = method === "delivery_assembly" ? zone.assembly : 0;
  if (assembly === null) throw new CheckoutError("Assembly isn't available for that zone.");
  return cents(zone.delivery + assembly);
}

export type NewOrder = {
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryZone: string | null;
  address: string | null;
  town: string | null;
  eircode: string | null;
  notes: string | null;
  items: OrderItem[];
};

export async function createPendingOrder(input: NewOrder) {
  const db = await getDb();
  const subtotal = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const fee = deliveryFee(input.deliveryMethod, input.deliveryZone);
  const password = newOrderPassword();
  const passwordHash = await hashPassword(password);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [order] = await db
        .insert(orders)
        .values({
          ...input,
          code: newOrderCode(),
          passwordHash,
          passwordSealed: seal(password),
          subtotal,
          deliveryFee: fee,
          total: subtotal + fee,
        })
        .returning();
      await db.insert(orderEvents).values({ orderId: order.id, status: "pending_payment" });
      return order;
    } catch (err) {
      if (!String(err).includes("unique") && !String(err).includes("duplicate")) throw err;
      // order code collision: try another
    }
  }
  throw new Error("Could not allocate an order code.");
}

export async function setPaymentRef(orderId: string, paymentRef: string) {
  const db = await getDb();
  await db.update(orders).set({ paymentRef, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

/** Marks an order paid once; safe to call from both the return page and the webhook. */
export async function markPaid(orderId: string, paymentRef: string) {
  const db = await getDb();
  const [updated] = await db
    .update(orders)
    .set({ status: "paid", paymentRef, paidAt: new Date(), updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")))
    .returning();
  if (updated) {
    await db.insert(orderEvents).values({ orderId, status: "paid", note: "Payment received" });
    await takeFromStock(updated.items);
    revalidatePath("/", "layout"); // stock levels on shop pages
  }
  const order = updated ?? (await getOrder(orderId));
  if (order) await emailCredentialsOnce(order);
  return order;
}

async function emailCredentialsOnce(order: Order) {
  if (order.credentialsEmailedAt || !order.passwordSealed) return;
  const db = await getDb();
  // Claim the send first so a webhook and the return page can't both send it.
  const [claimed] = await db
    .update(orders)
    .set({ credentialsEmailedAt: new Date() })
    .where(and(eq(orders.id, order.id), sql`${orders.credentialsEmailedAt} is null`))
    .returning();
  if (!claimed) return;
  try {
    await sendOrderCredentialsEmail(claimed, unseal(claimed.passwordSealed!));
  } catch (err) {
    await db.update(orders).set({ credentialsEmailedAt: null }).where(eq(orders.id, order.id));
    console.error("Order email failed", order.code, err);
    return;
  }
  await forgetPasswordIfDone(order.id);
}

/**
 * Returns the order password the first time it's asked for after payment, then never again.
 * The plain password is erased once it's been both shown and emailed.
 */
export async function revealCredentials(orderId: string) {
  const db = await getDb();
  const [order] = await db
    .update(orders)
    .set({ credentialsShownAt: new Date() })
    .where(and(eq(orders.id, orderId), sql`${orders.credentialsShownAt} is null`, sql`${orders.passwordSealed} is not null`))
    .returning();
  if (!order) return null;
  const password = unseal(order.passwordSealed!);
  await forgetPasswordIfDone(orderId);
  return password;
}

async function forgetPasswordIfDone(orderId: string) {
  const db = await getDb();
  await db
    .update(orders)
    .set({ passwordSealed: null })
    .where(and(eq(orders.id, orderId), sql`${orders.credentialsShownAt} is not null`, sql`${orders.credentialsEmailedAt} is not null`));
}

export async function getOrder(id: string) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order ?? null;
}

export async function getOrderByCode(code: string) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.code, code));
  return order ?? null;
}

export async function getOrderEvents(orderId: string) {
  const db = await getDb();
  return db.select().from(orderEvents).where(eq(orderEvents.orderId, orderId)).orderBy(orderEvents.createdAt);
}

export async function listOrders(statuses?: OrderStatus[]) {
  const db = await getDb();
  const query = db.select().from(orders);
  const filtered = statuses?.length ? query.where(inArray(orders.status, statuses)) : query.where(sql`${orders.status} <> 'pending_payment'`);
  return filtered.orderBy(desc(orders.createdAt)).limit(200);
}

export async function updateOrderStatus(orderId: string, update: { status: OrderStatus; etaDate: string | null; note: string | null }) {
  const db = await getDb();
  const current = await getOrder(orderId);
  if (!current) throw new Error("Order not found");
  await db
    .update(orders)
    .set({ status: update.status, etaDate: update.etaDate, statusNote: update.note, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  if (current.status !== update.status || (update.note && update.note !== current.statusNote)) {
    await db.insert(orderEvents).values({ orderId, status: update.status, note: update.note });
  }
}

export type ManualOrder = Omit<NewOrder, "deliveryZone"> & {
  deliveryFee: number; // cents
  status: OrderStatus;
  etaDate: string | null;
  statusNote: string | null;
  payment: ManualPayment;
  emailCustomer: boolean;
};

/**
 * An order added in the admin panel for a customer who didn't pay on the website. The
 * customer gets the same order number + password to follow it on /track.
 */
export async function createManualOrder(input: ManualOrder) {
  const db = await getDb();
  const subtotal = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const password = newOrderPassword();
  const passwordHash = await hashPassword(password);
  const { deliveryFee: fee, status, etaDate, statusNote, payment, emailCustomer, ...customer } = input;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [order] = await db
        .insert(orders)
        .values({
          ...customer,
          deliveryZone: null,
          code: newOrderCode(),
          passwordHash,
          status,
          etaDate,
          statusNote,
          subtotal,
          deliveryFee: fee,
          total: subtotal + fee,
          paymentRef: `manual:${payment}`,
          paidAt: payment.startsWith("paid_") ? new Date() : null,
          credentialsShownAt: new Date(),
        })
        .returning();
      await db.insert(orderEvents).values({ orderId: order.id, status, note: statusNote ?? "Order added by the workshop" });
      await takeFromStock(order.items.filter((i) => i.slug !== "custom"));
      if (emailCustomer) {
        try {
          if (!(await sendOrderCredentialsEmail(order, password))) return { order, password, emailFailed: true };
          await db.update(orders).set({ credentialsEmailedAt: new Date() }).where(eq(orders.id, order.id));
        } catch (err) {
          console.error("Manual order email failed", order.code, err);
          return { order, password, emailFailed: true };
        }
      }
      return { order, password, emailFailed: false };
    } catch (err) {
      if (!String(err).includes("unique") && !String(err).includes("duplicate")) throw err;
    }
  }
  throw new Error("Could not allocate an order code.");
}

/** New password for an order (e.g. the customer lost theirs). Returned once, stored hashed. */
export async function resetOrderPassword(orderId: string) {
  const db = await getDb();
  const password = newOrderPassword();
  const [order] = await db
    .update(orders)
    .set({ passwordHash: await hashPassword(password), passwordSealed: null, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return order ? password : null;
}
