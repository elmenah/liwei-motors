export const dynamic = "force-dynamic";

import { FileText } from "lucide-react";
import QuoteForm from "./QuoteForm";

export const metadata = {
  title: "Solicitar Cotización | Liwei Motors",
  description: "Solicita una cotización personalizada para tu empresa o pyme.",
};

type Props = { searchParams: Promise<{ producto?: string }> };

export default async function CotizarPage({ searchParams }: Props) {
  const { producto } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1e40af]/10 rounded-2xl mb-4">
          <FileText className="w-7 h-7 text-[#1e40af]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0f172a]">Solicitar cotización</h1>
        {producto ? (
          <p className="text-gray-500 mt-3 text-lg">
            Estás cotizando: <span className="font-semibold text-[#1e40af]">{producto}</span>
          </p>
        ) : (
          <p className="text-gray-500 mt-3 text-lg">
            Completá el formulario y un asesor se pondrá en contacto dentro de las 24 hs.
          </p>
        )}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Respuesta en 24 hs", sub: "Días hábiles" },
          { label: "Sin compromiso", sub: "Cotización gratuita" },
          { label: "Precios especiales", sub: "Para flotas y empresas" },
        ].map((h) => (
          <div
            key={h.label}
            className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
          >
            <div className="font-semibold text-sm text-[#0f172a]">{h.label}</div>
            <div className="text-xs text-gray-400 mt-1">{h.sub}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
        <QuoteForm initialProduct={producto} />
      </div>
    </div>
  );
}
