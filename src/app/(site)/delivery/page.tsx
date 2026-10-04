import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { getDeliveryZones } from "@/lib/content";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery & assembly",
  description: "Delivery with our own van from Athlone, optional assembly, or free collection from the workshop.",
};

function price(value: number | null) {
  if (value === null) return "On request";
  return value === 0 ? "Free" : formatPrice(value);
}

export default async function DeliveryPage() {
  const deliveryZones = await getDeliveryZones();
  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Delivery & assembly"
        intro="We deliver with our own van, so your piece arrives with the people who made it. Assembly is optional."
      />
      <Container className="py-12">
        {/* Table on wider screens, one card per zone on phones. */}
        <div className="hidden border border-line bg-white sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-sand/60">
              <tr>
                <th className="p-4 font-semibold">Zone</th>
                <th className="p-4 font-semibold">Area</th>
                <th className="p-4 font-semibold">Delivery</th>
                <th className="p-4 font-semibold">Assembly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {deliveryZones.map((z) => (
                <tr key={z.name}>
                  <td className="p-4 font-medium">{z.name}</td>
                  <td className="p-4 text-graphite">{z.area}</td>
                  <td className="p-4">{price(z.delivery)}</td>
                  <td className="p-4">{z.delivery === 0 ? "—" : price(z.assembly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-3 sm:hidden">
          {deliveryZones.map((z) => (
            <li key={z.name} className="border border-line bg-white p-4 text-sm">
              <p className="font-semibold text-ink">{z.name}</p>
              <p className="text-graphite">{z.area}</p>
              <dl className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-xs text-graphite">Delivery</dt>
                  <dd className="font-semibold">{price(z.delivery)}</dd>
                </div>
                {z.delivery !== 0 && (
                  <div>
                    <dt className="text-xs text-graphite">Assembly</dt>
                    <dd className="font-semibold">{price(z.assembly)}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-graphite">
          Prices include VAT. Large pieces and kitchens are always delivered and fitted by our team as part of the quote.
        </p>
      </Container>
    </>
  );
}
