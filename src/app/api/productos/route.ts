import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, images: true, colors: true, specs: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, price, categoryId, featured, available, isNew, isOffer, colors, specs, images } = body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: price != null && price !== "" ? Number(price) : null,
        categoryId,
        featured: featured ?? false,
        available: available ?? true,
        isNew: isNew ?? false,
        isOffer: isOffer ?? false,
        colors: { create: colors ?? [] },
        specs: { create: specs ?? [] },
        images: { create: (images ?? []).map((img: { url: string; alt?: string; order?: number }) => ({ url: img.url, alt: img.alt, order: img.order ?? 0 })) },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error("[POST /api/productos]", e);
    return NextResponse.json({ error: "Error al crear el producto." }, { status: 500 });
  }
}
