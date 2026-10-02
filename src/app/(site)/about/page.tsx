import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import locationMap from "@/assets/about/location-map.jpg";
import masterCarpenter from "@/assets/about/master-carpenter.jpg";
import showroom from "@/assets/about/showroom.jpg";
import workshopOutside from "@/assets/about/workshop-outside.jpg";
import { CtaBand } from "@/components/sections";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, Frame, PencilNote, RulerDivider, SketchCircle, SketchUnderline } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { getContact } from "@/lib/content";
import { ButtonArrow, Container, Eyebrow, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About us",
  description: "Meet Old Red Chisel — a small, master-led carpentry team in Athlone with 20 years of experience building bespoke furniture.",
};


/** Chamfered corners, same cut as the buttons. */
const chamfer = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

const stats: { icon: IconName; value: string; label: string }[] = [
  { icon: "clock", value: "20+", label: "Years on the market" },
  { icon: "chisel", value: "30+", label: "Years, master carpenter" },
  { icon: "tape", value: "100%", label: "Made to measure" },
];

const gallery: { photo: StaticImageData; alt: string; title: string; text: string; tilt: string }[] = [
  {
    photo: showroom,
    alt: "Inside the Old Red Chisel showroom, Athlone",
    title: "inside the showroom",
    text: "Browse finished pieces, finishes and material samples in person before you commit.",
    tilt: "md:-rotate-1",
  },
  {
    photo: workshopOutside,
    alt: "Old Red Chisel workshop and showroom exterior, Athlone",
    title: "our workshop, outside",
    text: "Our home on Golden Island, just off Bower Road in Athlone town.",
    tilt: "md:rotate-1",
  },
];


export default async function AboutPage() {
  const contact = await getContact();
  const directions = contact.mapsHref;
  const visit: { icon: IconName; title: string; text: string }[] = [
    { icon: "pin", title: "Workshop & showroom", text: contact.address },
    { icon: "clock", title: "Workshop hours", text: contact.hours },
  ];
  return (
    <>
      {/* Who we are */}
      <section className="relative overflow-hidden border-b border-line bg-sand/60">
        <Container className="grid items-center gap-14 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <Reveal>
            <Eyebrow>About us</Eyebrow>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold text-ink sm:text-5xl">
              Craft, patience &amp; <SketchUnderline>precision</SketchUnderline>
            </h1>
            <blockquote className="relative mt-7 border-l-4 border-brand bg-white/70 py-4 pr-4 pl-5">
              <span aria-hidden className="font-hand absolute -top-5 -left-1 text-6xl leading-none text-brand">“</span>
              <p className="font-serif text-xl text-ink italic sm:text-2xl">
                Experienced carpenter in Athlone specialising in tailored custom kitchens, wardrobes, and shelving units.
              </p>
            </blockquote>
            <div className="mt-6 space-y-4 text-lg text-graphite">
              <p>
                I provide comprehensive carpentry services, from design to installation. I also assist in sourcing
                budget-friendly materials for your project, so you get a premium result without an inflated price tag.
              </p>
              <p>
                For 20 years, Old Red Chisel has been building trusted, made-to-measure furniture for homes across the
                Irish Midlands. We remain a small, close-knit team led by a master carpenter with over 30 years behind the
                chisel — which means every project still gets a craftsman’s personal attention, from the first sketch to
                the final fitting.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} className="relative mx-auto w-full max-w-md pb-6">
            <Frame className="rotate-1">
              <Image
                src={masterCarpenter}
                alt="Master carpenter at work in the Old Red Chisel workshop, Athlone"
                placeholder="blur"
                priority
                sizes="(min-width: 768px) 40vw, 100vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </Frame>
            <div className={`absolute -bottom-1 -left-3 -rotate-3 bg-brand px-5 py-3 text-white shadow-lg sm:-left-6 ${chamfer}`}>
              <strong className="block font-serif text-5xl leading-none">20</strong>
              <span className="text-xs font-semibold tracking-[0.16em] uppercase">Years in business</span>
            </div>
            <PencilNote className="absolute -top-8 right-2 rotate-2 sm:top-auto sm:-bottom-4">30+ years behind the chisel</PencilNote>
          </Reveal>
        </Container>
      </section>

      {/* Numbers */}
      <div className="bg-white">
        <Container className="grid grid-cols-3 gap-3 py-8 sm:gap-6 sm:py-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-line bg-cream sm:h-16 sm:w-16">
                <SketchIcon name={s.icon} size={34} />
              </span>
              <span>
                <strong className="block pb-1.5 font-serif text-2xl font-semibold text-brand sm:text-3xl">
                  {i === 2 ? <SketchCircle>{s.value}</SketchCircle> : s.value}
                </strong>
                <span className="block text-xs text-graphite sm:text-sm">{s.label}</span>
              </span>
            </Reveal>
          ))}
        </Container>
      </div>

      <RulerDivider />

      {/* Showroom & workshop */}
      <section>
        <Container className="py-16">
          <Reveal>
            <div className="flex justify-center">
              <Eyebrow>Step inside</Eyebrow>
            </div>
            <SectionHeading
              align="center"
              title={<>Our showroom &amp; <SketchUnderline>workshop</SketchUnderline></>}
              intro="Drop by and see the quality for yourself — every piece starts life right here in Athlone."
            />
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8">
            {gallery.map((g, i) => (
              <Reveal key={g.title} delay={i * 120}>
                <Frame caption={g.title} className={`group ${g.tilt} transition-transform duration-500 hover:rotate-0`}>
                  <Image
                    src={g.photo}
                    alt={g.alt}
                    placeholder="blur"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </Frame>
                <p className="mt-4 px-1 text-graphite">{g.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Visit us */}
      <section className="border-t border-line bg-white">
        <Container className="grid gap-12 py-16 md:grid-cols-2 md:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Visit us"
              title={<>Find our <SketchUnderline>workshop</SketchUnderline></>}
              intro="We’re on Golden Island, just off Bower Road in Athlone — close to Centra Castlemaine St. Pop in during workshop hours to see finishes and samples in person and talk through your project face to face."
            />
            <ul className="relative mt-8 divide-y divide-line border border-line bg-cream/60">
              {visit.map((v) => (
                <li key={v.title} className="flex items-center gap-4 p-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center border border-line bg-white">
                    <SketchIcon name={v.icon} size={36} />
                  </span>
                  <span>
                    <strong className="block font-semibold text-ink">{v.title}</strong>
                    <span className="text-graphite">{v.text}</span>
                  </span>
                </li>
              ))}
              <CornerMarks />
            </ul>
            <a href={directions} target="_blank" rel="noopener" className="btn btn--primary mt-8">
              <SketchIcon name="pin" size={22} className="[--sketch-accent:white] [--sketch-ink:white]" />
              Get directions
              <ButtonArrow />
            </a>
          </Reveal>

          <Reveal delay={150} className="relative pb-8">
            <a href={directions} target="_blank" rel="noopener" aria-label="Open our location in Google Maps" className="group block">
              <Frame className="-rotate-1 transition-transform duration-500 group-hover:rotate-0">
                <Image
                  src={locationMap}
                  alt="Map marking the Old Red Chisel workshop and showroom location in Athlone"
                  placeholder="blur"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-square w-full object-cover"
                />
                <span className="btn btn--light absolute right-3 bottom-3 !py-2 shadow-lg group-hover:text-brand">
                  <SketchIcon name="pin" size={20} />
                  Open in Google Maps
                </span>
              </Frame>
            </a>
            <PencilNote className="absolute bottom-0 left-3 -rotate-2">close to Centra Castlemaine St</PencilNote>
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
