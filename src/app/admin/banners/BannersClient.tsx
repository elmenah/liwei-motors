"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, Upload, X, Check, LayoutTemplate, Square } from "lucide-react";
import type { LinkOption } from "./page";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string;
  active: boolean;
  order: number;
  format: "wide" | "square";
};

const empty: Omit<Banner, "id" | "order"> = {
  title: "",
  subtitle: "",
  imageUrl: null,
  linkUrl: "",
  linkLabel: "",
  bgColor: "#1e40af",
  active: true,
  format: "wide",
};

const FORMAT_OPTIONS = [
  {
    value: "wide" as const,
    label: "Banner ancho",
    desc: "1920 × 420 px — slider full-width",
    icon: <LayoutTemplate className="w-4 h-4" />,
  },
  {
    value: "square" as const,
    label: "Post cuadrado",
    desc: "1080 × 1080 px — estilo Instagram",
    icon: <Square className="w-4 h-4" />,
  },
];

export default function BannersClient({
  initialBanners,
  linkOptions,
}: {
  initialBanners: Banner[];
  linkOptions: LinkOption[];
}) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, "id" | "order">>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title ?? "",
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      linkLabel: b.linkLabel ?? "",
      bgColor: b.bgColor,
      active: b.active,
      format: b.format ?? "wide",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
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
      setForm((f) => ({ ...f, imageUrl: url }));
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    const payload = {
      title: form.title || null,
      subtitle: form.subtitle || null,
      imageUrl: form.imageUrl || null,
      linkUrl: form.linkUrl || null,
      linkLabel: form.linkLabel || null,
      bgColor: form.bgColor,
      active: form.active,
      format: form.format,
    };

    if (editing) {
      const res = await fetch(`/api/banners/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      }
    } else {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, order: banners.length }),
      });
      if (res.ok) {
        const created = await res.json();
        setBanners((prev) => [...prev, created]);
      }
    }
    setSaving(false);
    closeForm();
  }

  async function deleteBanner(id: string) {
    if (!confirm("¿Eliminar este banner?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleActive(b: Banner) {
    const res = await fetch(`/api/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBanners((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }
  }

  const imgHint = form.format === "square" ? "1080 × 1080 px recomendado" : "1920 × 420 px recomendado";
  const previewClass = form.format === "square" ? "w-full aspect-square max-h-64" : "w-full h-36";

  return (
    <div className="space-y-6">
      {/* Add button */}
      <button
        onClick={openNew}
        className="inline-flex items-center gap-2 bg-[#1e40af] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1e3a8a] transition-colors"
      >
        <Plus className="w-4 h-4" /> Nuevo banner
      </button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#0f172a]">{editing ? "Editar banner" : "Nuevo banner"}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Format selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
              <div className="grid grid-cols-2 gap-3">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, format: opt.value, imageUrl: null }))}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                      form.format === opt.value
                        ? "border-[#1e40af] bg-blue-50 text-[#1e40af]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-sm">
                      {opt.icon} {opt.label}
                    </span>
                    <span className="text-xs font-mono opacity-70">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Imagen del banner</label>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md font-mono">
                  {imgHint}
                </span>
              </div>
              {form.imageUrl ? (
                <div className={`relative group ${previewClass} rounded-xl overflow-hidden border border-gray-200`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full ${previewClass} border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1e40af] cursor-pointer transition-colors`}>
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-6 h-6 text-gray-400" />}
                  <span className="text-sm text-gray-400 mt-2">{uploading ? "Subiendo..." : "Subir imagen"}</span>
                  <span className="text-xs text-gray-300 mt-0.5">JPG, PNG o WebP · máx. 5 MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>

            {/* Color de fondo */}
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
                <input type="color" value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              </div>
              <p className="text-xs text-gray-400 self-end pb-2">Se usa si no hay imagen cargada</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: ¡Oferta de temporada!" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input value={form.subtitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Ej: 20% de descuento en scooters seleccionados" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link del botón (opcional)</label>
                <select
                  value={form.linkUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] bg-white"
                >
                  {linkOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.linkUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
                  <input
                    value={form.linkLabel ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
                    placeholder="Ver ofertas"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-[#1e40af]" />
              <span className="text-sm text-gray-700">Activo (visible en el home)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving} className="flex-1 bg-[#1e40af] text-white font-bold py-2.5 rounded-xl hover:bg-[#1e3a8a] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar"}
              </button>
              <button onClick={closeForm} className="px-5 border border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-sm">No hay banners todavía. Creá el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              {/* Preview */}
              <div
                className={`overflow-hidden shrink-0 border border-gray-100 rounded-lg ${
                  b.format === "square" ? "w-14 h-14" : "w-24 h-14"
                }`}
                style={{ backgroundColor: b.bgColor }}
              >
                {b.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-[#0f172a] truncate">{b.title || <span className="text-gray-400 font-normal italic">Sin título</span>}</p>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.format === "square"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {b.format === "square" ? "Post" : "Wide"}
                  </span>
                </div>
                {b.subtitle && <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>}
              </div>

              {/* Active toggle */}
              <button
                onClick={() => toggleActive(b)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  b.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {b.active ? <><Check className="w-3 h-3" /> Activo</> : "Inactivo"}
              </button>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(b)} className="p-2 text-gray-400 hover:text-[#1e40af] hover:bg-gray-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
