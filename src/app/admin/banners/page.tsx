export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BannersClient from "./BannersClient";

export default async function BannersPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Banners y promociones</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los slides del home</p>
        </div>
      </div>
      <BannersClient initialBanners={banners} />
    </div>
  );
}
