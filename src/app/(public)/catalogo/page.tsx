export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CatalogFilters from "./CatalogFilters";
import type { Product, Category } from "@/types/db";

export const metadata: Metadata = {
  title: "Catálogo | Liwei Motors",
  description: "Explorá nuestro catálogo completo de scooters y triciclos eléctricos. Alta calidad para uso urbano, comercial e industrial.",
  openGraph: {
    title: "Catálogo de productos | Liwei Motors",
    description: "Scooters y triciclos eléctricos de alta calidad.",
  },
};

async function getProducts(categoria?: string, q?: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      available: true,
      ...(categoria ? { category: { slug: categoria } } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      colors: true,
      category: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

type Props = {
  searchParams: Promise<{ categoria?: string; q?: string }>;
};

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria, q } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(categoria, q), getCategories()]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a]">
          {activeCategory ? activeCategory.name : "Catálogo completo"}
        </h1>
        <p className="text-gray-500 mt-1">
          {products.length} {products.length === 1 ? "producto" : "productos"} disponibles
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <CatalogFilters categories={categories} activeSlug={categoria} activeQ={q} />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No se encontraron productos.</p>
              <Link href="/catalogo" className="text-[#1e40af] hover:underline mt-2 inline-block">
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
