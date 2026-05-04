export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowRight, Zap, Truck, Award, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";

type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  _count: { products: number };
};

type HomeTestimonial = {
  id: string;
  rating: number;
  content: string;
  name: string;
  role: string | null;
  company: string | null;
};

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, available: true },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      colors: true,
      category: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

async function getBanners() {
  return prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

async function getTestimonials() {
  return prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export default async function HomePage() {
  const [featured, categories, banners, testimonials] = await Promise.all([
    getFeaturedProducts(), getCategories(), getBanners(), getTestimonials(),
  ]);

  const featuredList = featured as Parameters<typeof ProductCard>[0]["product"][];
  const categoryList = categories as HomeCategory[];
  const testimonialList = testimonials as HomeTestimonial[];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0f172a] text-white overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0f172a]/90" />
        {/* Blue gradient overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #1e40af 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#1e40af]/20 border border-[#1e40af]/40 text-[#93c5fd] px-3 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Movilidad eléctrica de alta calidad
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Muévete hacia el{" "}
              <span className="text-[#3b82f6]">futuro eléctrico</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              Scooters y triciclos eléctricos diseñados para la ciudad y el comercio. Eficientes, duraderos y con el respaldo de Liwei Motors.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cotizar"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-colors"
              >
                Solicitar cotización
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-[#1e40af]/20 border-t border-[#1e40af]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
              {[
                { value: "20+", label: "Modelos disponibles" },
                { value: "500+", label: "Clientes satisfechos" },
                { value: "24/7", label: "Soporte técnico" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banners / Promotions slider */}
      {banners.length > 0 && <BannerSlider banners={banners} />}

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a]">Nuestras categorías</h2>
            <p className="text-gray-500 mt-2">Encuentra el vehículo eléctrico ideal para ti</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryList.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="group relative bg-[#0f172a] rounded-2xl overflow-hidden p-8 text-white hover:bg-[#1e3a8a] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-gray-300 text-sm max-w-xs">{cat.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 mt-4 text-[#93c5fd] text-sm font-medium group-hover:gap-2 transition-all">
                      Ver productos <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="bg-[#1e40af] rounded-xl p-3">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 text-4xl font-black text-white/5">
                  {cat._count.products} productos
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featuredList.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#0f172a]">Productos destacados</h2>
                <p className="text-gray-500 mt-1">Nuestra selección de los mejores modelos</p>
              </div>
              <Link
                href="/catalogo"
                className="hidden md:inline-flex items-center gap-1 text-[#1e40af] font-semibold hover:gap-2 transition-all"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-[#1e40af] text-white font-semibold px-6 py-3 rounded-xl"
              >
                Ver todo el catálogo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a]">¿Por qué elegir Liwei Motors?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Alta eficiencia",
                desc: "Tecnología de baterías de litio con la mejor relación autonomía-precio del mercado.",
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: "Envío nacional",
                desc: "Realizamos envíos a todo el país con seguimiento en tiempo real.",
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Calidad certificada",
                desc: "Todos nuestros vehículos cumplen con los estándares de calidad internacionales.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#1e40af]/20 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[#1e40af]/10 rounded-xl flex items-center justify-center text-[#1e40af] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#0f172a] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonialList.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0f172a]">Lo que dicen nuestros clientes</h2>
              <p className="text-gray-500 mt-2">Experiencias reales de quienes eligieron Liwei Motors</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonialList.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <svg key={n} className={`w-4 h-4 ${n <= t.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.content}&rdquo;</p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-semibold text-[#0f172a] text-sm">{t.name}</p>
                    {(t.role || t.company) && (
                      <p className="text-xs text-gray-400">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment methods + Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Payment methods */}
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] mb-2">Medios de pago</h2>
              <p className="text-gray-500 mb-8">Aceptamos múltiples formas de pago para tu comodidad</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:border-[#1e40af]/20 transition-all">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#0f172a]">Efectivo</span>
                  <span className="text-xs text-gray-400 text-center">Pago directo en el local</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:border-[#1e40af]/20 transition-all">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#1e40af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#0f172a]">Transferencia</span>
                  <span className="text-xs text-gray-400 text-center">Depósito o transferencia bancaria</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:border-[#1e40af]/20 transition-all">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#0f172a]">Tarjetas</span>
                  <span className="text-xs text-gray-400 text-center">Débito y crédito</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] mb-2">Dónde encontrarnos</h2>
              <p className="text-gray-500 mb-8">San Diego #624, Santiago, Chile</p>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <iframe
                  src="https://maps.google.com/maps?q=Liwei+Motors+San+Diego+624+Santiago+Chile&output=embed&iwloc=near&z=16"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e40af] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Eres empresa o pyme?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Ofrecemos precios especiales para flotas y compras al por mayor. Contactá a nuestro equipo para una cotización personalizada.
          </p>
          <Link
            href="/cotizar"
            className="inline-flex items-center gap-2 bg-white text-[#1e40af] font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-lg"
          >
            Solicitar cotización empresarial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
