import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Context = RouteContext<"/api/faq/[id]">;

export async function PUT(req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const faq = await prisma.fAQ.update({ where: { id }, data: body });
  return NextResponse.json(faq);
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.fAQ.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
