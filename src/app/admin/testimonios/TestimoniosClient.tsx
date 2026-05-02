"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, X, Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  active: boolean;
  order: number;
};

const empty = { name: "", role: "", company: "", content: "", rating: 5, active: true };

export default function TestimoniosClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ name: t.name, role: t.role ?? "", company: t.company ?? "", content: t.content, rating: t.rating, active: t.active });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); setForm(empty); }

  async function save() {
    setSaving(true);
    const payload = { ...form, role: form.role || null, company: form.company || null };
    if (editing) {
      const res = await fetch(`/api/testimonios/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { const updated = await res.json(); setItems((prev) => prev.map((x) => x.id === updated.id ? updated : x)); }
    } else {
      const res = await fetch("/api/testimonios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, order: items.length }) });
      if (res.ok) { const created = await res.json(); setItems((prev) => [...prev, created]); }
    }
    setSaving(false);
    closeForm();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este testimonio?")) return;
    await fetch(`/api/testimonios/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <button onClick={openNew} className="inline-flex items-center gap-2 bg-[#1e40af] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1e3a8a] transition-colors">
        <Plus className="w-4 h-4" /> Nuevo testimonio
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#0f172a]">{editing ? "Editar" : "Nuevo"} testimonio</h2>
              <button onClick={closeForm}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Juan García" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Ej: Dueño" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Ej: Delivery SPA" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Testimonio *</label>
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} placeholder="Excelente producto, muy buena atención..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                    <Star className={`w-6 h-6 ${n <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-[#1e40af]" />
              <span className="text-sm text-gray-700">Visible en el home</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button onClick={save} disabled={saving || !form.name || !form.content} className="flex-1 bg-[#1e40af] text-white font-bold py-2.5 rounded-xl hover:bg-[#1e3a8a] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar"}
              </button>
              <button onClick={closeForm} className="px-5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No hay testimonios aún. Creá el primero.</div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#0f172a]">{t.name}</span>
                  {(t.role || t.company) && <span className="text-xs text-gray-400">{[t.role, t.company].filter(Boolean).join(" · ")}</span>}
                  <div className="flex gap-0.5 ml-auto">
                    {[1,2,3,4,5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{t.content}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{t.active ? "Activo" : "Inactivo"}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className="p-2 text-gray-400 hover:text-[#1e40af] hover:bg-gray-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
