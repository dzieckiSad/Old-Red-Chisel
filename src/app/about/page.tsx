import type { Metadata } from "next";
import { CtaBand } from "@/components/sections";
import { CheckList, Container, PageHeader, PhotoPlaceholder } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Old Red Chisel is a joinery workshop and home improvement team based in Athlone.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About us" title="A workshop in Athlone" />
      {/* TODO: replace with the owner's own story, team names and photos. */}
      <Container className="grid gap-10 py-12 md:grid-cols-2 md:items-center">
        <div className="space-y-4 text-lg text-graphite">
          <p>
            Old Red Chisel started with a simple idea: a home should be built and fitted by people who
            care how it turns out. We make our joinery by hand in our own workshop in{" "}
            {site.address.locality}, and the same team fits it in your home.
          </p>
          <p>
            Some of our customers come for a single bedside locker. Others come back for a kitchen, then
            a wardrobe, then an extension. Big or small, every job gets the same attention.
          </p>
          <div className="pt-2 text-base">
            <CheckList
              items={[
                "Solid timber and proper joints, not flat-pack",
                "One team from survey to fitting",
                "Fully insured",
                `Working across ${site.serviceArea.join(", ")}`,
              ]}
            />
          </div>
        </div>
        <PhotoPlaceholder label="Team in the workshop" className="aspect-[4/5]" />
      </Container>
      <CtaBand />
    </>
  );
}
