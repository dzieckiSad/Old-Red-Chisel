import type { Metadata } from "next";
import { ServiceIndex } from "@/components/service-pages";

export const metadata: Metadata = {
  title: "Bespoke kitchens, fitted wardrobes & built-in joinery",
  description:
    "Kitchens, fitted wardrobes, alcove units and built-in storage designed, handmade and fitted by our Athlone workshop.",
};

export default function BespokePage() {
  return (
    <ServiceIndex
      group="bespoke"
      eyebrow="Bespoke"
      title="Made to measure, made by hand"
      intro="Kitchens, wardrobes and built-in storage designed for your room, built in our workshop and fitted by the same team."
    />
  );
}
