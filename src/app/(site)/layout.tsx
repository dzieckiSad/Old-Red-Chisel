import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getContact } from "@/lib/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { phone, phoneHref } = await getContact();
  return (
    <>
      <Header phone={phone} phoneHref={phoneHref} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
