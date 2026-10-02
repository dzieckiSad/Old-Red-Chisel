import type { Metadata } from "next";
import { ServiceIndex } from "@/components/service-pages";

export const metadata: Metadata = {
  title: "Building & renovation",
  description:
    "Interior renovations, decking, garden rooms, extensions and small jobs across Athlone and the Midlands.",
};

export default function BuildRenovatePage() {
  return (
    <ServiceIndex
      group="build"
      eyebrow="Build & Renovate"
      title="Whatever your home needs"
      intro="From hanging a door to a full extension: interior and exterior work, big projects and small jobs, all from one team."
    />
  );
}
