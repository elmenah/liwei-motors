import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import type { QuoteRequest } from "@/types/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotes: QuoteRequest[] = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });

  const rows = quotes.map((q) => ({
    Empresa: q.company,
    Contacto: q.contact,
    Email: q.email,
    Teléfono: q.phone ?? "",
    Producto: q.product ?? "",
    Unidades: q.units ?? "",
    Mensaje: q.message ?? "",
    Estado: q.status === "pending" ? "Pendiente" : "Atendida",
    Fecha: new Date(q.createdAt).toLocaleDateString("es-CL"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cotizaciones");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cotizaciones-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
