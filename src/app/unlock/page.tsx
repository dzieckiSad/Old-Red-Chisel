import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { CornerMarks, PencilNote } from "@/components/sketch/ornaments";
import { sitePassword } from "@/lib/site-lock";
import { UnlockForm } from "./unlock-form";

export const metadata: Metadata = { title: { absolute: "Old Red Chisel" }, robots: { index: false, follow: false } };

export default async function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  const { next } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!sitePassword()) redirect(target);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="relative w-full max-w-sm border border-line bg-white p-8 text-center">
        <CornerMarks />
        <Logo width={220} priority className="mx-auto" />
        <PencilNote className="mt-6 block">still in the workshop</PencilNote>
        <p className="mt-2 text-sm text-graphite">This site is being built. Enter the preview password to look around.</p>
        <UnlockForm next={target} />
      </div>
    </main>
  );
}
