import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, adminConfigIssues, currentAdmin } from "@/lib/admin-auth";
import { countNewQuotes } from "@/lib/quotes";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: { absolute: "Workshop admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = await adminBase();
  const issues = adminConfigIssues();
  const admin = issues.length ? false : await currentAdmin();
  const newQuotes = admin ? await countNewQuotes().catch(() => 0) : 0;
  return (
    <div className="min-h-full bg-sand/50">
      <header className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href={base} className="flex items-center gap-3">
            <Logo variant="dark" height={36} />
            <span className="font-hand hidden text-2xl text-white/80 sm:inline">workshop admin</span>
          </Link>
          {admin && (
            <nav className="order-last -mx-3 flex w-full flex-wrap items-center gap-1 text-sm font-semibold md:order-none md:mx-0 md:w-auto">
              <Link href={base} className="px-3 py-1.5 hover:bg-white/10">Dashboard</Link>
              <Link href={`${base}/orders`} className="px-3 py-1.5 hover:bg-white/10">Orders</Link>
              <Link href={`${base}/quotes`} className="relative px-3 py-1.5 hover:bg-white/10">
                Quotes
                {newQuotes > 0 && <span className="ml-1.5 bg-brand px-1.5 py-0.5 text-[11px] leading-none">{newQuotes}</span>}
              </Link>
              <Link href={`${base}/products`} className="px-3 py-1.5 hover:bg-white/10">Products</Link>
              <Link href={`${base}/projects`} className="px-3 py-1.5 hover:bg-white/10">Projects</Link>
              <Link href={`${base}/content`} className="px-3 py-1.5 hover:bg-white/10">Content</Link>
            </nav>
          )}
          {admin && (
            <form action={logoutAdmin} className="flex items-center gap-4 text-sm">
              <button type="submit" className="font-semibold hover:text-brand">Sign out</button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {issues.length ? (
          <div className="mx-auto max-w-xl border border-line bg-white p-6 sm:p-8">
            <SketchIcon name="clipboard" size={48} />
            <h1 className="mt-2 font-serif text-2xl font-semibold">Almost there</h1>
            <p className="mt-2 text-sm text-graphite">The panel needs these settings. Add them to the server&apos;s environment variables, then restart or redeploy.</p>
            <ul className="mt-5 space-y-3">
              {issues.map((i) => (
                <li key={i.name} className="border-l-4 border-brand bg-cream p-3 text-sm">
                  <b>{i.name}</b>
                  <span className="block text-graphite">{i.how}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
