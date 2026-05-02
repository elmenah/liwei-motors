import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const { name, slug, description, price, categoryId, featured, available, isNew, isOffer, colors, specs, images } = body;

  try {
    await prisma.productColor.deleteMany({ where: { productId: id } });
    await prisma.productSpec.deleteMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(product);
  } catch (e) {
    console.error("[PUT /api/productos/:id]", e);
    return NextResponse.json({ error: "Error al actualizar el producto." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.product.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
