import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Context = RouteContext<"/api/cotizaciones/[id]">;

export async function PATCH(req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const { status } = await req.json();

  const quote = await prisma.quoteRequest.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(quote);
}

export async function DELETE(_req: NextRequest, ctx: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.quoteRequest.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
