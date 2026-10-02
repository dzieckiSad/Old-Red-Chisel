import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { Container, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Your cart" />
      <Container className="py-12">
        <CartView />
      </Container>
    </>
  );
}
