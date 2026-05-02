import { Metadata } from "next";
import prisma from "@/lib/prisma";
import FAQAccordion from "./FAQAccordion";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Liwei Motors",
  description: "Resolvé tus dudas sobre nuestros scooters y triciclos eléctricos. Garantía, envíos, mantenimiento y más.",
};

async function getFAQs() {
  return prisma.fAQ.findMany({ orderBy: { order: "asc" } });
}

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1e40af]/10 rounded-2xl mb-4">
          <MessageCircle className="w-7 h-7 text-[#1e40af]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0f172a]">Preguntas Frecuentes</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Todo lo que necesitás saber sobre nuestros vehículos eléctricos
        </p>
      </div>

      {/* FAQ list */}
      {faqs.length > 0 ? (
        <FAQAccordion faqs={faqs} />
      ) : (
        <p className="text-center text-gray-400">No hay preguntas frecuentes disponibles aún.</p>
      )}

      {/* CTA */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">¿No encontraste tu respuesta?</h2>
        <p className="text-gray-500 mb-6">
          Nuestro equipo está disponible para resolver todas tus dudas.
        </p>
        <Link
          href="/cotizar"
          className="inline-flex items-center gap-2 bg-[#1e40af] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1e3a8a] transition-colors"
        >
          Contactar al equipo
        </Link>
      </div>
    </div>
  );
}
