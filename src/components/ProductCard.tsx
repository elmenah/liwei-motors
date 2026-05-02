import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number | null;
    isNew: boolean;
    isOffer: boolean;
    images: { url: string; alt: string | null }[];
    colors: { hex: string; name: string }[];
    category: { name: string; slug: string };
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#1e40af]/20 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 bg-[#1e40af] text-white text-xs px-2 py-1 rounded-md font-medium">
            <Tag className="w-3 h-3" />
            {product.category.name}
          </span>
          {product.isNew && (
            <span className="inline-flex items-center bg-emerald-500 text-white text-xs px-2 py-1 rounded-md font-bold">
              ✦ Nuevo
            </span>
          )}
          {product.isOffer && (
            <span className="inline-flex items-center bg-red-500 text-white text-xs px-2 py-1 rounded-md font-bold">
              🏷 Oferta
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[#0f172a] text-lg group-hover:text-[#1e40af] transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {product.colors.slice(0, 5).map((c) => (
              <div
                key={c.hex}
                title={c.name}
                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-400">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          {product.price ? (
            <span className="font-bold text-[#0f172a] text-xl">
              ${product.price.toLocaleString("es-AR")}
            </span>
          ) : (
            <span className="text-sm text-gray-500 italic">Consultar precio</span>
          )}
          <span className="text-sm font-semibold text-[#1e40af] group-hover:underline">
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  );
}
