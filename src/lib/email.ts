import "server-only";
import type { orders } from "@/lib/db/schema";
import { formatCents, paymentSummary } from "@/lib/order-status";
import { getContact } from "@/lib/content";
import { site } from "@/lib/site";

type Order = typeof orders.$inferSelect;

export type Attachment = { filename: string; content: string /* base64 */ };

// Sent through Resend (https://resend.com) when RESEND_API_KEY is set; otherwise logged,
// so local development and previews work without an email account. Until a domain is verified
// in Resend, EMAIL_FROM stays unset: Resend's test sender only delivers to the account's own
// address, which is enough for the workshop notifications.
/** Returns false when email isn't set up (nothing was sent); throws if sending failed. */
async function send(to: string, subject: string, html: string, text: string, opts: { replyTo?: string; attachments?: Attachment[] } = {}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`;
  if (!key) {
    console.info(`[email not sent: RESEND_API_KEY missing] to=${to} subject="${subject}"\n${text}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text, reply_to: opts.replyTo ?? (await getContact()).email, attachments: opts.attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

/** Where links in emails point: the live Vercel address until the domain in site.url is set up. */
const siteUrl = () =>
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : site.url;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendOrderCredentialsEmail(order: Order, password: string) {
  const { phone } = await getContact();
  const trackUrl = `${siteUrl()}/track`;
  const lines = order.items.map((i) => `${i.quantity} × ${i.name} — ${formatCents(i.unitPrice * i.quantity)}`);
  const payment = paymentSummary(order.paymentRef);
  const totalLine = payment.paid ? `Total paid: ${formatCents(order.total)}` : `Order total: ${formatCents(order.total)} (${payment.label.toLowerCase()})`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Thank you for your order. Keep these details to follow it at ${trackUrl}:`,
    "",
    `Order number: ${order.code}`,
    `Password: ${password}`,
    "",
    ...lines,
    totalLine,
    "",
    `Questions? Reply to this email or call ${phone}.`,
    site.name,
  ].join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;color:#24201d;max-width:520px">
    <p>Hi ${escape(order.customerName)},</p>
    <p>Thank you for your order. Keep these details to follow it at <a href="${trackUrl}" style="color:#b33938">${trackUrl}</a>:</p>
    <table style="border:2px solid #b33938;padding:12px 16px;margin:16px 0;font-size:16px">
      <tr><td style="padding:4px 12px 4px 0">Order number</td><td style="font-family:monospace;font-size:18px"><b>${order.code}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Password</td><td style="font-family:monospace;font-size:18px"><b>${escape(password)}</b></td></tr>
    </table>
    <p>${lines.map(escape).join("<br>")}<br><b>${escape(totalLine)}</b></p>
    <p>Questions? Reply to this email or call ${phone}.</p>
    <p>${site.name}</p>
  </div>`;

  return send(order.email, `Your order ${order.code}`, html, text);
}

// ---------- Notifications to the workshop (sent to the email in Admin → Content) ----------

const row = (label: string, value: string | null | undefined) =>
  value ? `<tr><td style="padding:3px 12px 3px 0;color:#4e4e4e;vertical-align:top">${escape(label)}</td><td>${escape(value).replace(/\n/g, "<br>")}</td></tr>` : "";

function notice(title: string, rows: [string, string | null | undefined][], link?: { href: string; label: string }) {
  const html = `
  <div style="font-family:Arial,sans-serif;color:#24201d;max-width:560px">
    <h2 style="margin:0 0 12px;color:#b33938">${escape(title)}</h2>
    <table style="font-size:15px;border-collapse:collapse">${rows.map(([l, v]) => row(l, v)).join("")}</table>
    ${link ? `<p style="margin-top:16px"><a href="${link.href}" style="color:#b33938;font-weight:bold">${escape(link.label)}</a></p>` : ""}
  </div>`;
  const text = [title, "", ...rows.filter(([, v]) => v).map(([l, v]) => `${l}: ${v}`), ...(link ? ["", `${link.label}: ${link.href}`] : [])].join("\n");
  return { html, text };
}

/** Tells the workshop about a new order (paid online, or added in the panel). Never throws. */
export async function notifyWorkshopOfOrder(order: Order) {
  try {
    const { email } = await getContact();
    const { html, text } = notice(
      `New order ${order.code}: ${formatCents(order.total)}`,
      [
        ["Customer", order.customerName],
        ["Phone", order.phone],
        ["Email", order.email],
        ["Items", order.items.map((i) => `${i.quantity} × ${i.name}${Object.keys(i.options).length ? ` (${Object.values(i.options).join(", ")})` : ""}`).join("\n")],
        ["Delivery", [order.deliveryMethod === "collection" ? "Workshop collection" : order.deliveryMethod === "delivery_assembly" ? "Delivery and assembly" : "Delivery", order.deliveryZone].filter(Boolean).join(", ")],
        ["Address", [order.address, order.town, order.eircode].filter(Boolean).join(", ")],
        ["Notes", order.notes],
        ["Payment", paymentSummary(order.paymentRef).label],
      ],
      { href: `${siteUrl()}/admin`, label: "Open the admin panel" },
    );
    await send(email, `New order ${order.code} – ${order.customerName}`, html, text, { replyTo: order.email });
  } catch (err) {
    console.error("Workshop order email failed", order.code, err);
  }
}

export type QuoteRequest = {
  projectType: string;
  product: string;
  description: string;
  measurements: string;
  budget: string;
  timing: string;
  name: string;
  email: string;
  phone: string;
  town: string;
  eircode: string;
  contactPreference: string;
};

/** Sends a quote request from the website to the workshop, with the customer's photos attached. */
export async function notifyWorkshopOfQuote(q: QuoteRequest, attachments: Attachment[]) {
  const { email } = await getContact();
  const { html, text } = notice(`Quote request: ${q.projectType}`, [
    ["Name", q.name],
    ["Phone", q.phone],
    ["Email", q.email],
    ["Town", [q.town, q.eircode].filter(Boolean).join(", ")],
    ["Prefers", q.contactPreference],
    ["Product", q.product],
    ["Job", q.description],
    ["Measurements", q.measurements],
    ["Budget", q.budget],
    ["When", q.timing],
    ["Photos", attachments.length ? `${attachments.length} attached` : "none"],
  ]);
  return send(email, `Quote request – ${q.name}, ${q.town}`, html, text, { replyTo: q.email, attachments });
}
