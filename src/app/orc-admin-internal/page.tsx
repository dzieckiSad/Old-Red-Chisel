import Link from "next/link";
import { LoginForm } from "@/components/admin/forms";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { adminBase, adminConfigIssues, currentAdmin } from "@/lib/admin-auth";
import { TEMP_ADMIN_2FA_OFF } from "@/lib/admin-config";
import { type MonthTotal, getDashboard } from "@/lib/dashboard";
import { formatCents, statusLabels } from "@/lib/order-status";

export default async function AdminHome() {
  const base = await adminBase();
  if (adminConfigIssues().length) return null; // the layout shows what's missing

  if (!(await currentAdmin())) {
    return (
      <div className="mx-auto max-w-xl border border-line bg-white p-6 sm:p-8">
        <SketchIcon name="shield" size={48} />
        <h1 className="mt-2 mb-5 font-serif text-2xl font-semibold">Sign in</h1>
        <LoginForm twoFactor={!TEMP_ADMIN_2FA_OFF} />
      </div>
    );
  }

  const d = await getDashboard();
  const change = d.lastMonth.total ? Math.round(((d.thisMonth.total - d.lastMonth.total) / d.lastMonth.total) * 100) : null;
  const attention = [
    ...d.lowStock.map((p) => ({
      href: `${base}/products/${p.id}`,
      text: p.stock === 0 ? `${p.name} is sold out` : `${p.name}: last one in stock`,
    })),
    ...(d.toCollect.orders
      ? [{ href: `${base}/orders?show=all`, text: `${d.toCollect.orders} manual ${d.toCollect.orders === 1 ? "order" : "orders"} still to be paid (${formatCents(d.toCollect.total)})` }]
      : []),
    ...(d.exampleProjects
      ? [{ href: `${base}/projects`, text: `${d.exampleProjects} of ${d.projects} projects still use example images` }]
      : []),
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-2xl leading-none text-graphite">{greeting()}</p>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${base}/orders/new`} className="btn btn--primary !py-2">+ New order</Link>
          <Link href={`${base}/products/new`} className="btn btn--outline !py-2">+ Product</Link>
          <Link href={`${base}/projects/new`} className="btn btn--outline !py-2">+ Project</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tile icon="cart" label="Order value this month" value={formatCents(d.thisMonth.total)}>
          {d.thisMonth.orders} {d.thisMonth.orders === 1 ? "order" : "orders"}
          {change !== null && (
            <> · {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% on {d.lastMonth.label}</>
          )}
        </Tile>
        <Tile icon="clipboard" label="New, not started" value={String(d.stages.new)} href={`${base}/orders?show=new`}>
          Paid and waiting for the workshop
        </Tile>
        <Tile icon="chisel" label="In the workshop" value={String(d.stages.workshop)} href={`${base}/orders?show=open`}>
          Being made now
        </Tile>
        <Tile icon="van" label="Ready or on the way" value={String(d.stages.ready)} href={`${base}/orders?show=open`}>
          To deliver or collect
        </Tile>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="border border-line bg-white p-5">
          <h2 className="font-serif text-lg font-semibold">Order value, last 6 months</h2>
          <p className="text-sm text-graphite">Orders placed each month, paid online or added by hand. Cancelled orders aren&apos;t counted.</p>
          <SalesChart months={d.months} />
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white p-5">
            <h2 className="font-serif text-lg font-semibold">Needs attention</h2>
            {attention.length ? (
              <ul className="mt-3 space-y-2">
                {attention.map((a) => (
                  <li key={a.text}>
                    <Link href={a.href} className="flex items-start gap-2 border-l-4 border-brand bg-cream p-2.5 text-sm hover:bg-sand">
                      {a.text} <span aria-hidden className="ml-auto text-brand">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-graphite"><SketchIcon name="tick" size={22} /> Nothing waiting. All good.</p>
            )}
          </section>

          <section className="border border-line bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold">Latest orders</h2>
              <Link href={`${base}/orders?show=all`} className="text-sm font-semibold text-brand">All orders →</Link>
            </div>
            {d.recent.length ? (
              <ul className="mt-3 divide-y divide-line">
                {d.recent.map((o) => (
                  <li key={o.id}>
                    <Link href={`${base}/orders/${o.id}`} className="grid grid-cols-[1fr_auto] gap-x-3 py-2.5 text-sm hover:text-brand">
                      <span className="font-medium">{o.customerName}</span>
                      <span className="font-semibold">{formatCents(o.total)}</span>
                      <span className="font-mono text-xs text-graphite">{o.code}</span>
                      <span className="text-right text-xs text-graphite">{statusLabels[o.status]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-hand mt-3 text-xl text-graphite">no orders yet</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IE", { hour: "numeric", hour12: false, timeZone: "Europe/Dublin" }).format(new Date()));
  return hour < 12 ? "good morning" : hour < 18 ? "good afternoon" : "good evening";
}

function Tile({ icon, label, value, href, children }: { icon: IconName; label: string; value: string; href?: string; children: React.ReactNode }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-graphite">{label}</p>
        <SketchIcon name={icon} size={36} />
      </div>
      <p className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-graphite">{children}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block border border-line bg-white p-4 hover:border-ink/40">{body}</Link>
  ) : (
    <div className="border border-line bg-white p-4">{body}</div>
  );
}

/** Bar chart in plain HTML: one series, hover or focus a bar for its figures. */
function SalesChart({ months }: { months: MonthTotal[] }) {
  if (months.every((m) => m.total === 0)) {
    return <p className="font-hand mt-6 text-2xl text-graphite">no orders in the last 6 months yet</p>;
  }
  const max = Math.max(...months.map((m) => m.total), 1);
  // A round top for the scale, so gridlines land on tidy amounts.
  const step = niceStep(max / 3);
  const top = Math.max(step * 3, step * Math.ceil(max / step));
  const ticks = [0, 1, 2, 3].map((i) => (top / 3) * i);
  return (
    <>
      <div className="relative mt-6 ml-14 h-52">
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="absolute -top-2 -left-14 w-12 text-right text-[11px] text-graphite tabular-nums">{shortEuro(t)}</span>
          </div>
        ))}
        <ol className="absolute inset-0 flex items-end gap-0.5">
          {months.map((m, i) => {
            const last = i === months.length - 1;
            return (
              <li key={m.month} tabIndex={0} className="group relative flex h-full flex-1 items-end justify-center outline-none" aria-label={`${m.label}: ${formatCents(m.total)}, ${m.orders} orders`}>
                <div
                  className={`w-full max-w-10 rounded-t-[4px] ${last ? "bg-brand" : "bg-brand/70"} transition-colors group-hover:bg-brand-dark group-focus-visible:bg-brand-dark`}
                  style={{ height: `${Math.max((m.total / top) * 100, m.total ? 1.5 : 0)}%` }}
                />
                {last && m.total > 0 && (
                  <span className="absolute text-xs font-semibold text-ink tabular-nums" style={{ bottom: `calc(${(m.total / top) * 100}% + 4px)` }}>
                    {shortEuro(m.total)}
                  </span>
                )}
                <span className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max border border-line bg-white px-2.5 py-1.5 text-xs shadow-lg group-hover:block group-focus-visible:block">
                  <b className="block text-ink">{m.label}</b>
                  <span className="text-graphite">{formatCents(m.total)} · {m.orders} {m.orders === 1 ? "order" : "orders"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <ol className="ml-14 flex gap-0.5 border-t border-ink/30 pt-1.5">
        {months.map((m, i) => (
          <li key={m.month} className={`flex-1 text-center text-xs ${i === months.length - 1 ? "font-semibold text-ink" : "text-graphite"}`}>{m.label}</li>
        ))}
      </ol>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-graphite">Show as a table</summary>
        <table className="mt-2 w-full text-left">
          <thead><tr className="border-b border-line text-graphite"><th className="py-1 font-medium">Month</th><th className="font-medium">Orders</th><th className="text-right font-medium">Value</th></tr></thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-line/60"><td className="py-1">{m.label}</td><td>{m.orders}</td><td className="text-right tabular-nums">{formatCents(m.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

function niceStep(raw: number) {
  const cents = Math.max(raw, 10000); // at least €100 a step
  const pow = 10 ** Math.floor(Math.log10(cents));
  const n = cents / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

function shortEuro(cents: number) {
  const eur = cents / 100;
  return eur >= 1000 ? `€${(eur / 1000).toFixed(eur % 1000 === 0 ? 0 : 1)}k` : `€${Math.round(eur)}`;
}
