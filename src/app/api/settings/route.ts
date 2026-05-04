import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findFirst();
  return NextResponse.json(settings ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const settings = await prisma.siteSettings.upsert({
    data: {
      siteName:  body.siteName  ?? "Liwei Motors",
      logoUrl:   body.logoUrl   ?? null,
      whatsapp:  body.whatsapp  ?? null,
      instagram: body.instagram ?? null,
      facebook:  body.facebook  ?? null,
      tiktok:    body.tiktok    ?? null,
      email:     body.email     ?? null,
      phone:     body.phone     ?? null,
      address:   body.address   ?? null,
    },
  });

  return NextResponse.json(settings);
}
