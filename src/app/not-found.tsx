import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <>
    <Header />
    <main className="flex-1">
    <Container className="py-24 text-center">
      <p className="font-serif text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">We couldn&apos;t find that page</h1>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/shop" variant="outline">Shop</ButtonLink>
      </div>
    </Container>
    </main>
    <Footer />
    </>
  );
}
