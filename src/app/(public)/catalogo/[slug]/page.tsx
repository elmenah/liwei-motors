export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import type { Product, ProductColor, ProductSpec, SiteSettings } from "@/types/db";

async function getProduct(slug: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      colors: true,
      specs: true,
      category: true,
    },
  });
}

async function getRelated(categoryId: string, excludeSlug: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { categoryId, available: true, NOT: { slug: excludeSlug } },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, colors: true, category: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Liwei Motors`,
    description: product.description ?? `Conocé el ${product.name} de Liwei Motors. Scooters y triciclos eléctricos de alta calidad.`,
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProduct(slug),
    prisma.siteSettings.findFirst() as Promise<SiteSettings | null>,
  ]);
  if (!product || !product.available) notFound();
  const related = await getRelated(product.categoryId, slug);
  const whatsappNumber = settings?.whatsapp ?? "56927389896";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/catalogo" className="hover:text-[#1e40af] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Catálogo
        </Link>
        <span>/</span>
        <Link
          href={`/catalogo?categoria=${product.category.slug}`}
          className="hover:text-[#1e40af]"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[#0f172a] font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product info */}
        <div>
          <div className="inline-flex items-center gap-1 bg-[#1e40af]/10 text-[#1e40af] text-sm px-2 py-1 rounded-md font-medium mb-4">
            <Tag className="w-3 h-3" />
            {product.category.name}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">{product.name}</h1>

          {product.price && (
            <div className="text-3xl font-bold text-[#1e40af] mb-6">
              ${product.price.toLocaleString("es-AR")}
            </div>
          )}

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Colores disponibles</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c: ProductColor) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                    <span className="text-sm text-gray-600">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {product.specs.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Especificaciones técnicas</h3>
              <ul className="space-y-2">
                {product.specs.map((s: ProductSpec) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1e40af]" />
                      {s.label}
                    </span>
                    <span className="font-semibold text-[#0f172a]">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa cotizar el *${product.name}*. ¿Podrían brindarme más información sobre precio y disponibilidad?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25d366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>
            <Link
              href={`/cotizar?producto=${encodeURIComponent(product.name)}`}
              className="flex-1 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-3 px-6 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
            >
              Solicitar cotización formal
            </Link>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
