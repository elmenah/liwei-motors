import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Context = RouteContext<"/api/categorias/[id]">;

export async function PUT(req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const { name, slug, description } = body;

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug, description },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.category.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
