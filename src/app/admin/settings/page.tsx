export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import type { SiteSettings } from "@/types/db";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const settings: SiteSettings | null = await prisma.siteSettings.findFirst();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">Configuración del sitio</h1>
        <p className="text-gray-500 text-sm mt-1">Logo, redes sociales y datos de contacto</p>
      </div>
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
