export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BannersClient from "./BannersClient";
import type { Banner } from "@/types/db";

export type LinkOption = { label: string; value: string };

export default async function BannersPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [banners, categories, products] = await Promise.all([
    prisma.banner.findMany({ orderBy: { order: "asc" } }) as Promise<Banner[]>,
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { available: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const linkOptions: LinkOption[] = [
    { label: "— Sin link —", value: "" },
    { label: "Catálogo completo", value: "/catalogo" },
    { label: "Solicitar cotización", value: "/cotizar" },
    { label: "Preguntas frecuentes", value: "/preguntas-frecuentes" },
    ...categories.map((c: any) => ({
      label: `Categoría: ${c.name}`,
      value: `/catalogo?categoria=${c.slug}`,
    })),
    ...products.map((p: any) => ({
      label: `Producto: ${p.name}`,
      value: `/catalogo/${p.slug}`,
    })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Banners y promociones</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los slides del home</p>
        </div>
      </div>
      <BannersClient initialBanners={banners} linkOptions={linkOptions} />
    </div>
  );
}
