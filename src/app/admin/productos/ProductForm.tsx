"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Upload, Sparkles, ClipboardList } from "lucide-react";
import { buildDescription } from "@/lib/buildDescription";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido").regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  price: z.number().optional(),
  categoryId: z.string().min(1, "Seleccioná una categoría"),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  colors: z.array(z.object({ name: z.string().min(1), hex: z.string().min(1) })).default([]),
  specs: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
});

type FormData = z.infer<typeof schema>;

type Category = { id: string; name: string };
type ProductImage = { id: string; url: string; alt: string | null; order: number };

type Props = {
  categories: Category[];
  defaultValues?: Partial<FormData & { id: string }>;
  existingImages?: ProductImage[];
};

export default function ProductForm({ categories, defaultValues, existingImages = [] }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(existingImages);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? undefined,
      categoryId: defaultValues?.categoryId ?? "",
      featured: defaultValues?.featured ?? false,
      available: defaultValues?.available ?? true,
      isNew: defaultValues?.isNew ?? false,
      isOffer: defaultValues?.isOffer ?? false,
      colors: defaultValues?.colors ?? [],
      specs: defaultValues?.specs ?? [],
    },
  });

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({ control, name: "colors" });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: "specs" });

  const nameValue = watch("name");
  const categoryIdValue = watch("categoryId");
  const specsValue = watch("specs");

  function autoSlug() {
    const slug = nameValue
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug);
  }

  function parseSpecs() {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: { label: string; value: string }[] = [];

    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        // "Motor: 350 W"
        const label = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        if (label) parsed.push({ label, value });
      } else {
        // Sin dos puntos: primera palabra = label, resto = value
        const spaceIdx = line.search(/\s/);
        if (spaceIdx > 0) {
          parsed.push({ label: line.slice(0, spaceIdx).trim(), value: line.slice(spaceIdx).trim() });
        } else if (line) {
          parsed.push({ label: line, value: "" });
        }
      }
    }

    if (parsed.length === 0) return;

    // Reemplaza las specs actuales
    const current = specsValue ?? [];
    const toRemove = current.length;
    for (let i = toRemove - 1; i >= 0; i--) removeSpec(i);
    parsed.forEach((s) => appendSpec(s));

    setBulkText("");
    setShowBulk(false);
  }

  function generateDescription() {
    const categoryName = categories.find((c) => c.id === categoryIdValue)?.name ?? "";
    const desc = buildDescription(nameValue, categoryName, specsValue ?? []);
    setValue("description", desc);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setImages((prev) => [...prev, { id: crypto.randomUUID(), url, alt: null, order: prev.length }]);
    }
    setUploading(false);
  }

  async function removeImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setError(null);
    const payload = { ...data, images: images.map((img, i) => ({ ...img, order: i })) };
    const isEdit = !!defaultValues?.id;
    const url = isEdit ? `/api/productos/${defaultValues!.id}` : "/api/productos";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Error al guardar el producto.");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-[#0f172a] mb-4">Información básica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              {...register("name")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <div className="flex gap-2">
              <input
                {...register("slug")}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
              />
              <button type="button" onClick={autoSlug} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-600">
                Auto
              </button>
            </div>
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              {...register("categoryId")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (opcional)</label>
            <input
              {...register("price", { setValueAs: (v) => v === "" || v === undefined ? undefined : parseFloat(v) })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={!nameValue}
                className="inline-flex items-center gap-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Generar descripción
              </button>
            </div>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Escribí una descripción o usá el botón para generarla automáticamente con IA..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("available")} type="checkbox" className="rounded border-gray-300 text-[#1e40af]" />
              <span className="text-sm text-gray-700">Disponible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("featured")} type="checkbox" className="rounded border-gray-300 text-[#1e40af]" />
              <span className="text-sm text-gray-700">Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isNew")} type="checkbox" className="rounded border-gray-300 text-emerald-500" />
              <span className="text-sm text-gray-700">✦ Nuevo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isOffer")} type="checkbox" className="rounded border-gray-300 text-red-500" />
              <span className="text-sm text-gray-700">🏷 Oferta</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-[#0f172a] mb-4">Imágenes</h2>
        <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#1e40af] rounded-xl px-4 py-3 text-sm text-gray-500 hover:text-[#1e40af] transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Subiendo..." : "Subir imagen"}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
        </label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-[#1e40af] text-white text-xs px-1 rounded">Principal</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0f172a]">Colores</h2>
          <button
            type="button"
            onClick={() => appendColor({ name: "", hex: "#000000" })}
            className="inline-flex items-center gap-1 text-sm text-[#1e40af] hover:underline"
          >
            <Plus className="w-4 h-4" /> Agregar color
          </button>
        </div>
        <div className="space-y-3">
          {colorFields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-3">
              <input {...register(`colors.${i}.hex`)} type="color" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input {...register(`colors.${i}.name`)} placeholder="Nombre del color" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              <button type="button" onClick={() => removeColor(i)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0f172a]">Especificaciones técnicas</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBulk((v) => !v)}
              className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 hover:underline"
            >
              <ClipboardList className="w-4 h-4" />
              {showBulk ? "Ocultar" : "Pegar texto"}
            </button>
            <button
              type="button"
              onClick={() => appendSpec({ label: "", value: "" })}
              className="inline-flex items-center gap-1 text-sm text-[#1e40af] hover:underline"
            >
              <Plus className="w-4 h-4" /> Agregar spec
            </button>
          </div>
        </div>

        {/* Bulk import */}
        {showBulk && (
          <div className="mb-5 bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-violet-700 mb-1">Pegá las especificaciones (una por línea)</p>
              <p className="text-xs text-violet-500 mb-2">
                Formato: <code className="bg-violet-100 px-1 rounded">Etiqueta: Valor</code>&nbsp;— cada línea se convierte en una spec automáticamente.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={"Velocidad: 35 a 40 km/h\nAutonomía: 100 km\nMotor: 350 W\nVoltaje: 48V 28Ah\nFrenos: Disco delantero y trasero"}
                className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none bg-white font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={parseSpecs}
                disabled={!bulkText.trim()}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Separar automáticamente
              </button>
              {specFields.length > 0 && (
                <p className="text-xs text-violet-500">⚠ Reemplazará las {specFields.length} specs actuales</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {specFields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-3">
              <input {...register(`specs.${i}.label`)} placeholder="Ej: Motor" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              <input {...register(`specs.${i}.value`)} placeholder="Ej: 1500W BLDC" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              <button type="button" onClick={() => removeSpec(i)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {specFields.length === 0 && !showBulk && (
            <p className="text-sm text-gray-400 text-center py-2">Sin especificaciones. Agregá una o usá &quot;Pegar texto&quot;.</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1e40af] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#1e3a8a] disabled:bg-gray-300 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar producto"}
        </button>
        <a href="/admin/productos" className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium">
          Cancelar
        </a>
      </div>
    </form>
  );
}
