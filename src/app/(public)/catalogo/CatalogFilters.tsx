"use client";

import Link from "next/link";
import { LayoutGrid, Search } from "lucide-react";
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
}: {
  categories: Category[];
  activeSlug?: string;
  activeQ?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(activeQ ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeSlug) params.set("categoria", activeSlug);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/catalogo?${params.toString()}`);
  }

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
                href={`/catalogo?categoria=${cat.slug}`}
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
