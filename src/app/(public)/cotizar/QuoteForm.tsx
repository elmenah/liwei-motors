"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  company: z.string().min(2, "Ingresá el nombre de la empresa"),
  contact: z.string().min(2, "Ingresá tu nombre completo"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  product: z.string().optional(),
  units: z.coerce.number().min(1, "Mínimo 1 unidad").optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function QuoteForm({ initialProduct }: { initialProduct?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { product: initialProduct ?? "" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setError(null);
    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
    } catch {
      setError("Hubo un problema al enviar. Intentá de nuevo.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">¡Solicitud enviada!</h2>
        <p className="text-gray-500">
          Recibimos tu cotización. Un asesor te contactará dentro de las próximas 24 horas hábiles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Company */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Empresa / Razón social <span className="text-red-500">*</span>
          </label>
          <input
            {...register("company")}
            placeholder="Ej: Distribuciones S.A."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
          />
          {errors.company && (
            <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>
          )}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nombre y apellido <span className="text-red-500">*</span>
          </label>
          <input
            {...register("contact")}
            placeholder="Ej: Juan García"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
          />
          {errors.contact && (
            <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="tu@empresa.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Teléfono
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+56 9 0000-0000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
          />
        </div>
      </div>

      {/* Product */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Producto de interés
        </label>
        <input
          {...register("product")}
          placeholder="Ej: Scooter Eléctrico X200"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
        />
      </div>

      {/* Units */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Cantidad de unidades estimadas
        </label>
        <input
          {...register("units")}
          type="number"
          min={1}
          placeholder="Ej: 10"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
        />
        {errors.units && (
          <p className="text-red-500 text-xs mt-1">{errors.units.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Mensaje o requerimientos adicionales
        </label>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Contanos sobre tu proyecto, uso previsto, etc."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar solicitud de cotización"
        )}
      </button>
    </form>
  );
}
