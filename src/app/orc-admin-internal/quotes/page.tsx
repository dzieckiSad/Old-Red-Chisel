import Link from "next/link";
import { redirect } from "next/navigation";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import type { QuoteStatus } from "@/lib/db/schema";
import { listQuotes, openQuoteStatuses, quoteStatusLabels } from "@/lib/quotes";

const filters: { key: string; label: string; statuses?: QuoteStatus[] }[] = [
  { key: "open", label: "Open", statuses: openQuoteStatuses },
  { key: "new", label: "New", statuses: ["new"] },
  { key: "won", label: "Won", statuses: ["won"] },
  { key: "lost", label: "Lost", statuses: ["lost"] },
  { key: "all", label: "All" },
];

export default async function AdminQuotesPage({ searchParams }: PageProps<"/orc-admin-internal/quotes">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { show, deleted } = await searchParams;
  const filter = filters.find((f) => f.key === show) ?? filters[0];
  const quotes = await listQuotes(filter.statuses);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold">Quote requests</h1>
        <nav className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`${base}/quotes?show=${f.key}`}
              className={`border px-3 py-1.5 text-sm font-medium ${f.key === filter.key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-2 text-sm text-graphite">Sent from “Get a free quote” on the website. Each one is also emailed to you.</p>
      {deleted && <p role="status" className="mt-4 text-sm font-medium">Request deleted.</p>}

      {quotes.length === 0 ? (
        <div className="mt-8 flex flex-col items-center border border-line bg-white p-12 text-center">
          <SketchIcon name="clipboard" size={64} />
          <p className="font-hand mt-3 text-2xl text-graphite">nothing here right now</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border border-line bg-white">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link href={`${base}/quotes/${q.id}`} className="grid gap-2 p-4 hover:bg-cream sm:grid-cols-[1.3fr_2fr_auto] sm:items-center">
                <span>
                  <span className="block font-semibold">{q.name}</span>
                  <span className="text-xs text-graphite">
                    {q.town} · {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Dublin" }).format(q.createdAt)}
                  </span>
                </span>
                <span className="text-sm">
                  <span className="block font-medium">{q.projectType}{q.photos.length > 0 && <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-graphite"><SketchIcon name="camera" size={18} />{q.photos.length}</span>}</span>
                  <span className="line-clamp-1 text-graphite">{q.description}</span>
                </span>
                <span className={`justify-self-start px-2 py-0.5 text-xs font-semibold uppercase sm:justify-self-end ${q.status === "new" ? "bg-brand text-white" : q.status === "won" ? "bg-ink text-white" : "bg-sand text-ink"}`}>
                  {quoteStatusLabels[q.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
