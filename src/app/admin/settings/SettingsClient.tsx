"use client";

import { useState } from "react";
import { Loader2, Upload, X, Check, Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@/types/db";

type Form = {
  siteName: string;
  logoUrl: string | null;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  email: string;
  phone: string;
  address: string;
};

const TIKTOK_ICON = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.76a4.84 4.84 0 01-1.01-.07z" />
  </svg>
);

const WHATSAPP_ICON = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function toForm(s: SiteSettings | null): Form {
  return {
    siteName:  s?.siteName  ?? "Liwei Motors",
    logoUrl:   s?.logoUrl   ?? null,
    whatsapp:  s?.whatsapp  ?? "",
    instagram: s?.instagram ?? "",
    facebook:  s?.facebook  ?? "",
    tiktok:    s?.tiktok    ?? "",
    email:     s?.email     ?? "",
    phone:     s?.phone     ?? "",
    address:   s?.address   ?? "",
  };
}

export default function SettingsClient({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const [form, setForm] = useState<Form>(toForm(initialSettings));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof Form, val: string | null) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      set("logoUrl", url);
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        logoUrl:   form.logoUrl   || null,
        whatsapp:  form.whatsapp  || null,
        instagram: form.instagram || null,
        facebook:  form.facebook  || null,
        tiktok:    form.tiktok    || null,
        email:     form.email     || null,
        phone:     form.phone     || null,
        address:   form.address   || null,
      }),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
  }

  return (
    <div className="space-y-6">

      {/* Logo */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-[#0f172a]">Logo del sitio</h2>
        <div className="flex items-start gap-4">
          {form.logoUrl ? (
            <div className="relative group w-32 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
              <button
                onClick={() => set("logoUrl", null)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-16 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1e40af] cursor-pointer transition-colors shrink-0">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <Upload className="w-5 h-5 text-gray-400" />}
              <span className="text-xs text-gray-400 mt-1">{uploading ? "Subiendo..." : "Subir logo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">
              Recomendado: formato PNG o SVG con fondo transparente.
            </p>
            <p className="text-xs text-gray-400">Si no subís logo, se muestra el ícono por defecto.</p>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sitio</label>
              <input
                value={form.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
                placeholder="Liwei Motors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-[#0f172a]">Redes sociales</h2>

        <div className="space-y-3">
          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              {WHATSAPP_ICON} WhatsApp
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1e40af]">
              <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">wa.me/</span>
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="56912345678"
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Solo el número, sin + ni espacios. Ej: 56927389896</p>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Instagram className="w-4 h-4" /> Instagram
            </label>
            <input
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="https://www.instagram.com/liwei_motors/"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Facebook className="w-4 h-4" /> Facebook
            </label>
            <input
              value={form.facebook}
              onChange={(e) => set("facebook", e.target.value)}
              placeholder="https://www.facebook.com/liweimotors"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              {TIKTOK_ICON} TikTok
            </label>
            <input
              value={form.tiktok}
              onChange={(e) => set("tiktok", e.target.value)}
              placeholder="https://www.tiktok.com/@liweimotors"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-[#0f172a]">Información de contacto</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              type="email"
              placeholder="contacto@liweimotors.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Teléfono visible
            </label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+56 9 2738 9896"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Dirección
            </label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="San Diego #624, Santiago, Chile"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-[#1e40af] text-white font-bold py-3 rounded-xl hover:bg-[#1e3a8a] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
        ) : saved ? (
          <><Check className="w-4 h-4" /> Cambios guardados</>
        ) : (
          "Guardar configuración"
        )}
      </button>
    </div>
  );
}
