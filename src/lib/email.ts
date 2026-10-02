import "server-only";
import type { orders } from "@/lib/db/schema";
import { formatCents, paymentSummary } from "@/lib/order-status";
import { getContact } from "@/lib/content";
import { site } from "@/lib/site";

type Order = typeof orders.$inferSelect;

// Sent through Resend (https://resend.com) when RESEND_API_KEY is set; otherwise logged,
// so local development and previews work without an email account.
/** Returns false when email isn't set up (nothing was sent); throws if sending failed. */
async function send(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${site.name} <orders@oldredchisel.ie>`;
  if (!key) {
    console.info(`[email not sent: RESEND_API_KEY missing] to=${to} subject="${subject}"\n${text}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text, reply_to: (await getContact()).email }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendOrderCredentialsEmail(order: Order, password: string) {
  const { phone } = await getContact();
  const trackUrl = `${site.url}/track`;
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
