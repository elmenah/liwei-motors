import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const banner = await prisma.banner.create({ data: body });
  return NextResponse.json(banner, { status: 201 });
}
