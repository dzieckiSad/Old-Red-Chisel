import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Handmade joinery & home improvements in Athlone`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    locale: "en_IE",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IE" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
