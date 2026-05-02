import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const original = await prisma.product.findUnique({
    where: { id },
    include: { images: true, colors: true, specs: true },
  });

  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate a unique slug by appending -copia, -copia-2, -copia-3...
  let newSlug = `${original.slug}-copia`;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${original.slug}-copia-${suffix++}`;
  }

  const duplicate = await prisma.product.create({
    data: {
      name: `${original.name} (Copia)`,
      slug: newSlug,
      description: original.description,
      price: original.price,
      featured: false,
      available: false, // start as unavailable so it doesn't go live accidentally
      isNew: original.isNew,
      isOffer: original.isOffer,
      categoryId: original.categoryId,
      images: { create: original.images.map((img) => ({ url: img.url, alt: img.alt, order: img.order })) },
      colors: { create: original.colors.map((c) => ({ name: c.name, hex: c.hex })) },
      specs:  { create: original.specs.map((s)  => ({ label: s.label, value: s.value })) },
    },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
