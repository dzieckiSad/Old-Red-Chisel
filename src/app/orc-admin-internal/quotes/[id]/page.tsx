import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuoteStatusForm } from "@/components/admin/quote-status-form";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { intlPhone } from "@/lib/content-defaults";
import { getQuote, quoteStatusLabels } from "@/lib/quotes";
import { deleteQuoteAction } from "../actions";

export default async function AdminQuotePage({ params }: PageProps<"/orc-admin-internal/quotes/[id]">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { id } = await params;
  const q = /^[0-9a-f-]{36}$/i.test(id) ? await getQuote(id) : null;
  if (!q) notFound();

  // Photos kept on this server are served through the admin panel only.
  const photoSrc = (url: string) => (url.startsWith("/api/uploads/") ? `${base}/quotes/photo/${url.split("/").pop()}` : url);
  const phoneHref = `tel:${intlPhone(q.phone)}`;
  const whatsapp = `https://wa.me/${intlPhone(q.phone).slice(1)}`;
  const reply = `mailto:${q.email}?subject=${encodeURIComponent(`Your ${q.projectType.toLowerCase()} quote – Old Red Chisel`)}`;

  return (
    <>
      <Link href={`${base}/quotes`} className="text-sm font-semibold text-graphite hover:text-ink">← All quote requests</Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">{q.name}</h1>
        <p className="text-sm text-graphite">
          {quoteStatusLabels[q.status]} · sent {new Intl.DateTimeFormat("en-IE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Dublin" }).format(q.createdAt)}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={phoneHref} className="btn btn--dark !py-2">Call {q.phone}</a>
        <a href={whatsapp} target="_blank" rel="noopener" className="btn btn--outline !py-2">WhatsApp</a>
        <a href={reply} className="btn btn--outline !py-2">Reply by email</a>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="border border-line bg-white p-5">
            <h2 className="font-serif text-lg font-semibold">{q.projectType}</h2>
            <p className="mt-2 whitespace-pre-line">{q.description}</p>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              {[
                ["Product", q.product],
                ["Measurements", q.measurements],
                ["Budget", q.budget],
                ["When", q.timing],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-graphite">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section className="border border-line bg-white p-5">
            <h2 className="font-serif text-lg font-semibold">Photos</h2>
            {q.photos.length ? (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {q.photos.map((url, i) => (
                  <li key={url}>
                    <a href={photoSrc(url)} target="_blank" rel="noopener" className="block border border-line bg-cream p-1.5 hover:border-ink/40">
                      {/* Plain img: these come from the admin-only route, not the image optimiser. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoSrc(url)} alt={`Photo ${i + 1} from ${q.name}`} className="aspect-square w-full object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-graphite">No photos sent.</p>
            )}
          </section>

          <section className="border border-line bg-white p-5">
            <h2 className="font-serif text-lg font-semibold">Customer</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-graphite">Phone</dt><dd><a href={phoneHref} className="text-brand underline">{q.phone}</a></dd>
              <dt className="text-graphite">Email</dt><dd><a href={reply} className="text-brand underline">{q.email}</a></dd>
              <dt className="text-graphite">Area</dt><dd>{[q.town, q.eircode].filter(Boolean).join(", ")}</dd>
              {q.contactPreference && (<><dt className="text-graphite">Prefers</dt><dd>{q.contactPreference}</dd></>)}
            </dl>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <section className="border border-line bg-white p-5">
            <h2 className="mb-4 font-serif text-lg font-semibold">Progress</h2>
            <QuoteStatusForm id={q.id} status={q.status} notes={q.notes} version={q.updatedAt.toISOString()} />
          </section>
          <form action={deleteQuoteAction.bind(null, q.id)}>
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-brand">Delete this request…</summary>
              <p className="mt-2 text-sm text-graphite">Removes the request and the customer&apos;s photos for good (e.g. if they ask you to delete their data).</p>
              <button type="submit" className="btn btn--dark mt-3">Delete permanently</button>
            </details>
          </form>
        </div>
      </div>
    </>
  );
}
