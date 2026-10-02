import type { Metadata } from "next";
import { BeforeAfter } from "@/components/sketch/before-after";
import { SketchIcon, iconNames } from "@/components/sketch/icons";
import { CornerMarks, Frame, PencilNote, RulerDivider, SketchCircle, SketchUnderline } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonArrow, ButtonLink, CheckList, Container, Eyebrow, PageHeader, PhotoPlaceholder } from "@/components/ui";

// Internal catalogue of our own UI elements, used to review the design. Not linked or indexed.
export const metadata: Metadata = { title: "Design elements", robots: { index: false, follow: false } };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <>
      <PageHeader eyebrow="Internal" title="Design elements" intro="Every visual element on the site, in one place." />
      <Container>
        <Block title="Sketch icons">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {iconNames.map((name) => (
              <div key={name} className="flex flex-col items-center gap-2 border border-line bg-white p-4">
                <SketchIcon name={name} size={56} />
                <span className="text-xs text-graphite">{name}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="#">Primary</ButtonLink>
            <ButtonLink href="#" arrow>
              With arrow
            </ButtonLink>
            <ButtonLink href="#" variant="outline">
              Outline
            </ButtonLink>
            <ButtonLink href="#" variant="dark">
              Dark
            </ButtonLink>
            <span className="bg-brand p-4">
              <ButtonLink href="#" variant="light" arrow>
                Light on red
              </ButtonLink>
            </span>
            <button type="button" className="btn btn--primary" disabled style={{ opacity: 0.5 }}>
              Disabled <ButtonArrow />
            </button>
          </div>
        </Block>

        <Block title="Cards & frames (hover the card)">
          <div className="grid gap-8 md:grid-cols-3">
            <a href="#" className="card block p-6">
              <SketchIcon name="wardrobe" size={44} />
              <h3 className="mt-3 font-serif text-xl font-semibold">Card</h3>
              <p className="mt-2 text-graphite">Lifts and draws corner marks on hover.</p>
              <CornerMarks />
            </a>
            <Frame caption="pencilled caption">
              <PhotoPlaceholder className="aspect-[4/3]" />
            </Frame>
            <Frame className="rotate-1">
              <PhotoPlaceholder className="aspect-[4/3]" />
            </Frame>
          </div>
        </Block>

        <Block title="Before / after slider">
          <div className="max-w-2xl">
            <Frame caption="drag the handle">
              <BeforeAfter
                className="aspect-[16/10]"
                before={<div className="plaster-placeholder h-full w-full" />}
                after={<PhotoPlaceholder className="h-full w-full" />}
              />
            </Frame>
          </div>
        </Block>

        <Block title="Pencil accents">
          <Reveal className="space-y-6">
            <h2 className="font-serif text-4xl font-semibold">
              Joinery made <SketchUnderline>by hand.</SketchUnderline>
            </h2>
            <p className="text-2xl font-semibold">
              Fitted wardrobes <SketchCircle>from €1,800</SketchCircle>
            </p>
            <PencilNote>handwritten note, e.g. “made in our workshop”</PencilNote>
            <div className="max-w-sm">
              <CheckList items={["Sketched tick list", "Used on service pages", "And in the quote sidebar"]} />
            </div>
          </Reveal>
        </Block>

        <Block title="Ruler divider">
          <RulerDivider />
        </Block>
      </Container>
    </>
  );
}
