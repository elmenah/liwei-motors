export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../ProductForm";
import type { Product, Category } from "@/types/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProductoPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const [product, categories]: [Product | null, Category[]] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        colors: true,
        specs: true,
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e40af] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Editar: {product.name}</h1>
      <ProductForm
        categories={categories}
        defaultValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? undefined,
          price: product.price ?? undefined,
          categoryId: product.categoryId,
          featured: product.featured,
          available: product.available,
          isNew: product.isNew,
          isOffer: product.isOffer,
          colors: product.colors,
          specs: product.specs,
        }}
        existingImages={product.images}
      />
    </div>
  );
}
