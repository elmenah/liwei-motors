import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { SiteSettings } from "@/types/db";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings: SiteSettings | null = await prisma.siteSettings.findFirst();

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsapp={settings?.whatsapp ?? null} />
    </>
  );
}
