"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type FAQ = { id: string; question: string; answer: string; order: number };

export default function FAQManager({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ question: "", answer: "" });
  const [newData, setNewData] = useState({ question: "", answer: "" });
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/faq");
    setFaqs(await res.json());
  }

  async function handleCreate() {
    if (!newData.question || !newData.answer) return;
    setLoading("new");
    await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, order: faqs.length + 1 }),
    });
    setNewData({ question: "", answer: "" });
    setShowNew(false);
    setLoading(null);
    await refresh();
  }

  async function handleEdit(id: string) {
    setLoading(id);
    await fetch(`/api/faq/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    setLoading(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    setLoading(id + "-del");
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    setLoading(null);
    await refresh();
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-xl border border-gray-100 p-4">
          {editId === faq.id ? (
            <div className="space-y-2">
              <input
                value={editData.question}
                onChange={(e) => setEditData((d) => ({ ...d, question: e.target.value }))}
                placeholder="Pregunta"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
              />
              <textarea
                value={editData.answer}
                onChange={(e) => setEditData((d) => ({ ...d, answer: e.target.value }))}
                placeholder="Respuesta"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => handleEdit(faq.id)} disabled={loading === faq.id} className="inline-flex items-center gap-1 text-sm bg-[#1e40af] text-white px-3 py-1.5 rounded-lg">
                  {loading === faq.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Guardar
                </button>
                <button onClick={() => setEditId(null)} className="inline-flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
                  <X className="w-3 h-3" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold text-sm text-[#0f172a]">{faq.question}</div>
                <div className="text-sm text-gray-500 mt-1 leading-relaxed">{faq.answer}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setEditId(faq.id); setEditData({ question: faq.question, answer: faq.answer }); }}
                  className="p-1.5 text-gray-400 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  disabled={loading === faq.id + "-del"}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  {loading === faq.id + "-del" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showNew && (
        <div className="bg-white rounded-xl border-2 border-[#1e40af]/30 p-4 space-y-2">
          <input
            value={newData.question}
            onChange={(e) => setNewData((d) => ({ ...d, question: e.target.value }))}
            placeholder="Nueva pregunta *"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af]"
            autoFocus
          />
          <textarea
            value={newData.answer}
            onChange={(e) => setNewData((d) => ({ ...d, answer: e.target.value }))}
            placeholder="Respuesta *"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={loading === "new"} className="inline-flex items-center gap-1 text-sm bg-[#1e40af] text-white px-3 py-1.5 rounded-lg">
              {loading === "new" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Guardar
            </button>
            <button onClick={() => setShowNew(false)} className="inline-flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#1e40af] text-gray-400 hover:text-[#1e40af] rounded-xl px-4 py-3 text-sm font-medium transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Nueva pregunta
        </button>
      )}
    </div>
  );
}
