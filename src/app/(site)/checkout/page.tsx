import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { Container, PageHeader } from "@/components/ui";
import { paymentMode } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

const errors: Record<string, string> = {
  payment: "The payment didn't go through. You haven't been charged; please try again.",
  "not-found": "We couldn't find that order. Please try again.",
};

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const { error } = await searchParams;
  const mode = paymentMode();
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Delivery & payment" />
      <Container className="py-12">
        <CheckoutForm
          mode={mode}
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
          initialError={typeof error === "string" ? errors[error] : undefined}
        />
      </Container>
    </>
  );
}
