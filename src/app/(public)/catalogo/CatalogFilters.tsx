"use client";

import Link from "next/link";
import { LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

export default function CatalogFilters({
  categories,
  activeSlug,
  activeQ,
  activePriceMin,
  activePriceMax,
  activeSort,
}: {
  categories: Category[];
  activeSlug?: string;
  activeQ?: string;
  activePriceMin?: string;
  activePriceMax?: string;
  activeSort?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(activeQ ?? "");
  const [priceMin, setPriceMin] = useState(activePriceMin ?? "");
  const [priceMax, setPriceMax] = useState(activePriceMax ?? "");

  function buildParams(overrides: Record<string, string | undefined> = {}) {
    const params = new URLSearchParams();
    const slug = overrides.categoria !== undefined ? overrides.categoria : activeSlug;
    const q = overrides.q !== undefined ? overrides.q : query.trim();
    const min = overrides.priceMin !== undefined ? overrides.priceMin : priceMin;
    const max = overrides.priceMax !== undefined ? overrides.priceMax : priceMax;
    const sort = overrides.sort !== undefined ? overrides.sort : activeSort;

    if (slug) params.set("categoria", slug);
    if (q) params.set("q", q);
    if (min) params.set("priceMin", min);
    if (max) params.set("priceMax", max);
    if (sort && sort !== "featured") params.set("sort", sort);
    return params.toString();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalogo?${buildParams()}`);
  }

  function handlePriceFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalogo?${buildParams()}`);
  }

  function handleSort(value: string) {
    router.push(`/catalogo?${buildParams({ sort: value })}`);
  }

  const sortOptions = [
    { value: "featured",   label: "Destacados primero" },
    { value: "newest",     label: "Más recientes" },
    { value: "price_asc",  label: "Precio: menor a mayor" },
    { value: "price_desc", label: "Precio: mayor a menor" },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors bg-white"
        />
      </form>

      {/* Sort */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Ordenar por
        </h3>
        <select
          value={activeSort ?? "featured"}
          onChange={(e) => handleSort(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors bg-white"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Price filter */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Precio
        </h3>
        <form onSubmit={handlePriceFilter} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Mín"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
            />
            <input
              type="number"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Máx"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Aplicar
          </button>
          {(activePriceMin || activePriceMax) && (
            <button
              type="button"
              onClick={() => {
                setPriceMin("");
                setPriceMax("");
                router.push(`/catalogo?${buildParams({ priceMin: "", priceMax: "" })}`);
              }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Limpiar filtro de precio
            </button>
          )}
        </form>
      </div>

      {/* Categories */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Categorías
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/catalogo"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !activeSlug ? "bg-[#1e40af] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Todos
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/catalogo?${buildParams({ categoria: cat.slug })}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSlug === cat.slug
                    ? "bg-[#1e40af] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    activeSlug === cat.slug
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cat._count.products}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
