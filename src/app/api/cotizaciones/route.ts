import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, contact, email, phone, product, units, message } = body;

  if (!company || !contact || !email) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.create({
    data: { company, contact, email, phone, product: product ?? null, units: units ? Number(units) : null, message },
  });

  return NextResponse.json(quote, { status: 201 });
}
