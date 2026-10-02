import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, adminConfigIssues, currentAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: { absolute: "Workshop admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = await adminBase();
  const issues = adminConfigIssues();
  const admin = issues.length ? false : await currentAdmin();
  return (
    <div className="min-h-full bg-sand/50">
      <header className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={base} className="flex items-center gap-3">
            <Logo variant="dark" height={36} />
            <span className="font-hand text-2xl text-white/80">workshop admin</span>
          </Link>
          {admin && (
            <nav className="flex items-center gap-1 text-sm font-semibold">
              <Link href={base} className="px-3 py-1.5 hover:bg-white/10">Orders</Link>
              <Link href={`${base}/products`} className="px-3 py-1.5 hover:bg-white/10">Products</Link>
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
            <p className="mt-2 text-sm text-graphite">The panel needs these settings in Vercel. Add them, then Deployments → ⋯ → Redeploy.</p>
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
