export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export default async function NuevoProductoPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="p-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e40af] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
