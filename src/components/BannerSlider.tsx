"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string;
  format: "wide" | "square";
};

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const wide = banners.filter((b) => b.format !== "square");
  const square = banners.filter((b) => b.format === "square");

  return (
    <>
      {wide.length > 0 && <WideBannerSlider banners={wide} />}
      {square.length > 0 && <SquareBannerRow banners={square} />}
    </>
  );
}

/* ─── Wide slider (comportamiento original) ─── */
function WideBannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, banners.length, next]);

  const banner = banners[current];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] w-full transition-all duration-500">
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt={banner.title ?? "Banner"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: banner.bgColor }} />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 w-full">
            <div className="max-w-xl">
              {banner.title && (
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3 drop-shadow">
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p className="text-base sm:text-lg text-white/90 mb-6 drop-shadow">
                  {banner.subtitle}
                </p>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-flex items-center gap-2 bg-white text-[#1e40af] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {banner.linkLabel ?? "Ver más"}
                </Link>
              )}
            </div>
          </div>
        </div>
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir al banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Square banners — fila horizontal desplazable ─── */
function SquareBannerRow({ banners }: { banners: Banner[] }) {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Swipe hint — solo visible en mobile */}
        {banners.length > 1 && (
          <div className="flex items-center justify-end gap-1.5 mb-3 sm:hidden text-gray-400">
            <svg className="w-4 h-4 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs font-medium">Deslizá para ver más</span>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative shrink-0 w-56 sm:w-64 aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm snap-start"
              style={{ backgroundColor: b.bgColor }}
            >
              {b.imageUrl && (
                <Image
                  src={b.imageUrl}
                  alt={b.title ?? "Banner"}
                  fill
                  className="object-cover"
                />
              )}
              {/* Overlay solo si hay texto */}
              {(b.title || b.subtitle || b.linkUrl) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                {b.title && (
                  <p className="font-bold text-white text-sm sm:text-base leading-tight drop-shadow">
                    {b.title}
                  </p>
                )}
                {b.subtitle && (
                  <p className="text-white/80 text-xs mt-1 leading-snug line-clamp-2">
                    {b.subtitle}
                  </p>
                )}
                {b.linkUrl && (
                  <Link
                    href={b.linkUrl}
                    className="mt-3 inline-block bg-white text-[#1e40af] font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors w-fit shadow"
                  >
                    {b.linkLabel ?? "Ver más"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
