import Link from "next/link";
import QRCode from "qrcode";
import { LoginForm, SetupForm } from "@/components/admin/forms";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, adminConfigIssues, adminCount, currentAdmin } from "@/lib/admin-auth";
import { TEMP_ADMIN_2FA_OFF } from "@/lib/admin-config";
import type { OrderStatus } from "@/lib/db/schema";
import { listOrders } from "@/lib/orders";
import { deliveryLabels, formatCents, formatDate, statusLabels } from "@/lib/order-status";
import { newTotpSecret, seal, totpUri } from "@/lib/security";

const filters: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "open", label: "To do", statuses: ["paid", "in_production", "ready", "out_for_delivery", "ready_for_collection"] },
  { key: "new", label: "New", statuses: ["paid"] },
  { key: "done", label: "Completed", statuses: ["delivered", "collected"] },
  { key: "all", label: "All" },
];

export default async function AdminHome({ searchParams }: PageProps<"/orc-admin-internal">) {
  const base = await adminBase();
  if (adminConfigIssues().length) return null; // the layout shows what's missing

  if ((await adminCount()) === 0) {
    if (!process.env.ADMIN_SETUP_KEY) {
      return <Card title="Admin not set up">Add ADMIN_SETUP_KEY in the Vercel environment variables, redeploy, then reload this page.</Card>;
    }
    let twoFactor = null;
    if (!TEMP_ADMIN_2FA_OFF) {
      const secret = newTotpSecret();
      const qrSvg = await QRCode.toString(totpUri(secret, "admin"), { type: "svg", margin: 0, color: { dark: "#24201d", light: "#ffffff" } });
      twoFactor = { sealed: seal(secret), qrSvg, secret };
    }
    return (
      <Card title="Set up the admin account" icon="shield">
        <p className="mb-6 text-sm text-graphite">
          This page only works once.{" "}
          {TEMP_ADMIN_2FA_OFF ? "While the site is being built, signing in needs only your email and password." : "After this, signing in needs your password and a code from the app."}
        </p>
        <SetupForm twoFactor={twoFactor} />
      </Card>
    );
  }

  const admin = await currentAdmin();
  if (!admin) {
    return (
      <Card title="Sign in" icon="shield">
        <LoginForm twoFactor={!TEMP_ADMIN_2FA_OFF} />
      </Card>
    );
  }

  const { show } = await searchParams;
  const filter = filters.find((f) => f.key === show) ?? filters[0];
  const orders = await listOrders(filter.statuses);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-3xl font-semibold">Orders</h1>
          <Link href={`${base}/orders/new`} className="btn btn--primary !py-2">+ New order</Link>
        </div>
        <nav className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`${base}?show=${f.key}`}
              className={`border px-3 py-1.5 text-sm font-medium ${f.key === filter.key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center border border-line bg-white p-12 text-center">
          <SketchIcon name="clipboard" size={64} />
          <p className="font-hand mt-3 text-2xl text-graphite">nothing here right now</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border border-line bg-white">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`${base}/orders/${o.id}`} className="grid gap-2 p-4 hover:bg-cream sm:grid-cols-[1.2fr_1.5fr_1fr_auto] sm:items-center">
                <span>
                  <span className="block font-mono font-semibold">{o.code}</span>
                  <span className="text-xs text-graphite">
                    {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(o.createdAt)}
                  </span>
                </span>
                <span className="text-sm">
                  <span className="block font-medium">{o.customerName}</span>
                  <span className="text-graphite">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</span>
                </span>
                <span className="text-sm">
                  <span className="block font-semibold">{statusLabels[o.status]}</span>
                  <span className="text-graphite">
                    {deliveryLabels[o.deliveryMethod]}
                    {o.etaDate && ` · ${formatDate(o.etaDate)}`}
                  </span>
                </span>
                <span className="font-semibold sm:text-right">{formatCents(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Card({ title, icon, children }: { title: string; icon?: "shield"; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl border border-line bg-white p-6 sm:p-8">
      {icon && <SketchIcon name={icon} size={48} />}
      <h1 className="mt-2 mb-5 font-serif text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}
