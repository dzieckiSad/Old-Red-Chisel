import type { Metadata } from "next";
import { CtaBand, FaqList, ProcessSteps } from "@/components/sections";
import { Container, PageHeader, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we work",
  description: "From your first photo to the final fitting: how a bespoke or renovation project with Old Red Chisel works.",
};

export default function HowWeWorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="How we work"
        title="No surprises, start to finish"
        intro="Building work shouldn't be stressful. Here's exactly what happens when you work with us."
      />
      <Container className="py-12">
        <ProcessSteps />
      </Container>
      <section className="bg-white">
        <Container className="py-14">
          <SectionHeading title="Payments" />
          <div className="mt-8 max-w-3xl">
            <FaqList
              items={[
                { q: "Shop pieces", a: "Paid in full online at checkout. Made-to-order pieces show their lead time before you buy." },
                { q: "Survey", a: `€${site.surveyFee}, paid when you book. It comes off your order if you go ahead.` },
                { q: "Bespoke joinery and kitchens", a: "A deposit when you approve the design, and the balance once everything is fitted and you're happy." },
                { q: "Building and renovation", a: "A written quote and a staged payment schedule agreed before work starts." },
              ]}
            />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
