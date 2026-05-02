"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: { products: number };
};

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", slug: "", description: "" });
  const [newData, setNewData] = useState({ name: "", slug: "", description: "" });
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategories(data);
  }

  async function handleCreate() {
    if (!newData.name) return;
    setLoading("new");
    const slug = newData.slug || newData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newData, slug }),
    });
    setNewData({ name: "", slug: "", description: "" });
    setShowNew(false);
    setLoading(null);
    await refresh();
  }

  async function handleEdit(id: string) {
    setLoading(id);
    await fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    setLoading(null);
    await refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    setLoading(id + "-del");
    await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    setLoading(null);
    await refresh();
  }

  return (
    <div className="space-y-4">
      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {categories.length === 0 && !showNew && (
          <p className="text-center text-gray-400 py-8 text-sm">No hay categorías aún.</p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="border-b border-gray-50 last:border-0">
            {editId === cat.id ? (
              <div className="flex items-start gap-3 p-4">
                <div className="flex-1 space-y-2">
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Nombre"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
                  />
                  <input
                    value={editData.slug}
                    onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))}
                    placeholder="Slug"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
                  />
                  <input
                    value={editData.description}
                    onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Descripción (opcional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
                  />
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => handleEdit(cat.id)} disabled={loading === cat.id} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                    {loading === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-semibold text-sm text-[#0f172a]">{cat.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    /{cat.slug} · {cat._count.products} productos
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditId(cat.id);
                      setEditData({ name: cat.name, slug: cat.slug, description: cat.description ?? "" });
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={loading === cat.id + "-del"}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    {loading === cat.id + "-del" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New category inline */}
        {showNew && (
          <div className="flex items-start gap-3 p-4 border-t border-gray-100 bg-blue-50/30">
            <div className="flex-1 space-y-2">
              <input
                value={newData.name}
                onChange={(e) => setNewData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Nombre de la categoría *"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
                autoFocus
              />
              <input
                value={newData.slug}
                onChange={(e) => setNewData((d) => ({ ...d, slug: e.target.value }))}
                placeholder="Slug (opcional — se genera automático)"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
              />
              <input
                value={newData.description}
                onChange={(e) => setNewData((d) => ({ ...d, description: e.target.value }))}
                placeholder="Descripción (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e40af]"
              />
            </div>
            <div className="flex gap-1 mt-1">
              <button onClick={handleCreate} disabled={loading === "new"} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                {loading === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowNew(false)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#1e40af] text-gray-400 hover:text-[#1e40af] rounded-xl px-4 py-3 text-sm font-medium transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      )}
    </div>
  );
}
