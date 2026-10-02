import type { Metadata } from "next";
import Image from "next/image";
import locationMap from "@/assets/about/location-map.jpg";
import masterCarpenter from "@/assets/about/master-carpenter.jpg";
import showroom from "@/assets/about/showroom.jpg";
import workshopOutside from "@/assets/about/workshop-outside.jpg";
import { CtaBand } from "@/components/sections";
import { SketchIcon } from "@/components/sketch/icons";
import { ButtonArrow, Container, Eyebrow, PageHeader, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About us",
  description: "Meet Old Red Chisel — a small, master-led carpentry team in Athlone with 20 years of experience building bespoke furniture.",
};

const directions = "https://maps.app.goo.gl/boCn4FWCBCWbT2wEA?g_st=ic";

const stats = [
  { value: "20+", label: "Years on the market" },
  { value: "30+", label: "Years, master carpenter" },
  { value: "100%", label: "Made to measure" },
];

const gallery = [
  {
    photo: showroom,
    alt: "Inside the Old Red Chisel showroom, Athlone",
    title: "Inside the showroom",
    text: "Browse finished pieces, finishes and material samples in person before you commit.",
  },
  {
    photo: workshopOutside,
    alt: "Old Red Chisel workshop and showroom exterior, Athlone",
    title: "Our workshop, outside",
    text: "Our home on Golden Island, just off Bower Road in Athlone town.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About us" title="Craft, patience & precision" />

      <Container className="grid gap-10 py-12 md:grid-cols-2 md:items-center">
        <div className="relative">
          <Image
            src={masterCarpenter}
            alt="Master carpenter at work in the Old Red Chisel workshop, Athlone"
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute -bottom-4 left-4 bg-brand px-5 py-3 text-white shadow-lg">
            <strong className="block font-serif text-4xl leading-none">20</strong>
            <span className="text-xs font-semibold tracking-wider uppercase">Years in business</span>
          </div>
        </div>

        <div className="space-y-4 text-lg text-graphite">
          <Eyebrow>Who we are</Eyebrow>
          <p className="font-serif text-2xl text-ink italic">
            “Experienced carpenter in Athlone specialising in tailored custom kitchens, wardrobes, and shelving units.”
          </p>
          <p>
            I provide comprehensive carpentry services, from design to installation. I also assist in sourcing
            budget-friendly materials for your project, so you get a premium result without an inflated price tag.
          </p>
          <p>
            For 20 years, Old Red Chisel has been building trusted, made-to-measure furniture for homes across the Irish
            Midlands. We remain a small, close-knit team led by a master carpenter with over 30 years behind the chisel —
            which means every project still gets a craftsman’s personal attention, from the first sketch to the final
            fitting.
          </p>
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <strong className="block font-serif text-3xl text-brand">{s.value}</strong>
                  <span className="text-sm">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <section className="border-y border-line bg-sand/60 py-14">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Step inside"
            title="Our showroom & workshop"
            intro="Drop by and see the quality for yourself — every piece starts life right here in Athlone."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {gallery.map((g) => (
              <figure key={g.title} className="border border-line bg-white">
                <Image src={g.photo} alt={g.alt} placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-5">
                  <strong className="block font-serif text-xl text-ink">{g.title}</strong>
                  <span className="text-graphite">{g.text}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-14 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeading
            eyebrow="Visit us"
            title="Find our workshop"
            intro="We’re on Golden Island, just off Bower Road in Athlone — close to Centra Castlemaine St. Pop in during workshop hours to see finishes and samples in person and talk through your project face to face."
          />
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <SketchIcon name="pin" size={36} />
              <span>
                <strong className="block text-ink">Workshop &amp; showroom</strong>
                <span className="text-graphite">Golden Island, Athlone, Co. Westmeath</span>
              </span>
            </li>
            <li className="flex gap-3">
              <SketchIcon name="clock" size={36} />
              <span>
                <strong className="block text-ink">Workshop hours</strong>
                <span className="text-graphite">Mon – Fri, 9:00 – 17:30</span>
              </span>
            </li>
          </ul>
          <a href={directions} target="_blank" rel="noopener" className="btn btn--primary mt-6">
            Get directions <ButtonArrow />
          </a>
        </div>
        <a href={directions} target="_blank" rel="noopener" aria-label="Open our location in Google Maps" className="group relative block">
          <Image
            src={locationMap}
            alt="Map marking the Old Red Chisel workshop and showroom location in Athlone"
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-square w-full border border-line object-cover"
          />
          <span className="absolute right-3 bottom-3 flex items-center gap-2 bg-white px-3 py-2 text-sm font-semibold text-ink shadow group-hover:text-brand">
            <SketchIcon name="pin" size={20} /> Open in Google Maps
          </span>
        </a>
      </Container>

      <CtaBand />
    </>
  );
}
