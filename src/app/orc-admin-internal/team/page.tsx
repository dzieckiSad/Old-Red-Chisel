import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AddAdminForm, ChangePasswordForm } from "@/components/admin/team-forms";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { removeAdmin } from "./actions";

export default async function TeamPage() {
  const base = await adminBase();
  const me = await currentAdmin();
  if (!me) redirect(base);
  const db = await getDb();
  const team = await db.select().from(adminUsers).orderBy(asc(adminUsers.createdAt));

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-graphite">Everyone here can sign in to the panel with their own email and password.</p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-white p-5">
          <h2 className="mb-3 font-serif text-lg font-semibold">People with access</h2>
          <ul className="divide-y divide-line">
            {team.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-medium">{a.email}</span>
                  {a.id === me.id && <span className="ml-2 bg-ink/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase">You</span>}
                  <span className="block text-xs text-graphite">
                    Added {new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric" }).format(a.createdAt)}
                  </span>
                </span>
                {a.id !== me.id && team.length > 1 && (
                  <form action={removeAdmin.bind(null, a.id)}>
                    <details className="text-right">
                      <summary className="cursor-pointer text-xs font-semibold text-brand">Remove access…</summary>
                      <button type="submit" className="btn btn--dark mt-2 !px-3 !py-1.5 text-xs">Remove {a.email}</button>
                    </details>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-6">
          <section className="border border-line bg-white p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">Add a person</h2>
            <AddAdminForm />
          </section>
          <section className="border border-line bg-white p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold">My password</h2>
            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </>
  );
}
