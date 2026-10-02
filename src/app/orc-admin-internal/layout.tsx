import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: { absolute: "Workshop admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = await adminBase();
  const admin = await currentAdmin();
  return (
    <div className="min-h-full bg-sand/50">
      <header className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={base} className="flex items-center gap-3">
            <Logo variant="dark" height={36} />
            <span className="font-hand text-2xl text-white/80">workshop admin</span>
          </Link>
          {admin && (
            <form action={logoutAdmin} className="flex items-center gap-4 text-sm">
              <span className="hidden text-white/70 sm:inline">{admin.email}</span>
              <button type="submit" className="font-semibold hover:text-brand">Sign out</button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
