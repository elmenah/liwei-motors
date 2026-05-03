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

  if (!name || !slug || !categoryId) {
    return NextResponse.json({ error: "Faltan campos obligatorios: nombre, slug o categoría." }, { status: 400 });
  }

  try {
    await prisma.productColor.deleteMany({ where: { productId: id } });
    await prisma.productSpec.deleteMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });

    // Strip any extra DB fields (id, productId) that the form might send
    const cleanColors = (colors ?? []).map((c: { name: string; hex: string }) => ({ name: c.name, hex: c.hex }));
    const cleanSpecs  = (specs  ?? []).map((s: { label: string; value: string }) => ({ label: s.label, value: s.value }));
    const cleanImages = (images ?? []).map((img: { url: string; alt?: string | null; order?: number }, i: number) => ({
      url: img.url,
      alt: img.alt ?? null,
      order: img.order ?? i,
    }));

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description ?? null,
        price: price != null && price !== "" ? Number(price) : null,
        categoryId,
        featured: featured ?? false,
        available: available ?? true,
        isNew: isNew ?? false,
        isOffer: isOffer ?? false,
        colors: { create: cleanColors },
        specs:  { create: cleanSpecs },
        images: { create: cleanImages },
      },
    });

    return NextResponse.json(product);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PUT /api/productos/:id]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.product.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
