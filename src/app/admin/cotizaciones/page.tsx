export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import QuoteActions from "./QuoteActions";

async function getQuotes() {
  return prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function CotizacionesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const quotes = await getQuotes();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Cotizaciones</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {quotes.filter((q) => q.status === "pending").length} pendientes · {quotes.length} total
          </p>
        </div>
        {quotes.length > 0 && (
          <a
            href="/api/cotizaciones/export"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </a>
        )}
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No hay cotizaciones aún.
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#0f172a]">{q.company}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {q.status === "pending" ? "Pendiente" : "Atendida"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {q.contact} · <a href={`mailto:${q.email}`} className="text-[#1e40af] hover:underline">{q.email}</a>
                    {q.phone && ` · ${q.phone}`}
                  </div>
                  {q.units && (
                    <div className="text-sm text-gray-500 mt-1">Unidades: {q.units}</div>
                  )}
                  {q.message && (
                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                      {q.message}
                    </p>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(q.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <QuoteActions id={q.id} status={q.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
