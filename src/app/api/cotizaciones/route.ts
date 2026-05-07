import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

// ── Rate limiter simple (por IP) ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT   = 5;   // máximo 5 envíos
const WINDOW_MS    = 60 * 60 * 1000; // por hora

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// ── Esquema de validación ─────────────────────────────────────────────────────
const QuoteSchema = z.object({
  company: z.string().min(1, "Requerido").max(120),
  contact: z.string().min(1, "Requerido").max(120),
  email:   z.string().email("Email inválido").max(200),
  phone:   z.string().max(30).optional(),
  product: z.string().max(200).optional(),
  units:   z.number().int().positive().max(99999).nullable().optional(),
  message: z.string().max(2000).optional(),
});

// ── POST /api/cotizaciones ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta nuevamente en 1 hora." },
      { status: 429 }
    );
  }

  // Parsear body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  // Validar con Zod
  const result = QuoteSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Datos inválidos";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { company, contact, email, phone, product, units, message } = result.data;

  const quote = await prisma.quoteRequest.create({
    data: {
      company,
      contact,
      email,
      phone:   phone   ?? null,
      product: product ?? null,
      units:   units   ?? null,
      message: message ?? null,
    },
  });

  return NextResponse.json(quote, { status: 201 });
}
