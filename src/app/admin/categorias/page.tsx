export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryManager from "./CategoryManager";
import type { CategoryWithCount } from "@/types/db";

async function getCategories(): Promise<CategoryWithCount[]> {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export default async function CategoriasPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const categories = await getCategories();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Categorías</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administrá las categorías de productos</p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
