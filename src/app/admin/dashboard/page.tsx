export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Package, Tag, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [products, categories, quotes, faqs] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.quoteRequest.count(),
    prisma.fAQ.count(),
  ]);
  const pendingQuotes = await prisma.quoteRequest.count({ where: { status: "pending" } });
  return { products, categories, quotes, pendingQuotes, faqs };
}

async function getRecentQuotes() {
  return prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [stats, recentQuotes] = await Promise.all([getStats(), getRecentQuotes()]);

  const cards = [
    {
      href: "/admin/productos",
      icon: <Package className="w-6 h-6" />,
      label: "Productos",
      value: stats.products,
      color: "bg-blue-50 text-blue-600",
    },
    {
      href: "/admin/categorias",
      icon: <Tag className="w-6 h-6" />,
      label: "Categorías",
      value: stats.categories,
      color: "bg-purple-50 text-purple-600",
    },
    {
      href: "/admin/cotizaciones",
      icon: <FileText className="w-6 h-6" />,
      label: "Cotizaciones pendientes",
      value: stats.pendingQuotes,
      color: "bg-orange-50 text-orange-600",
    },
    {
      href: "/admin/faq",
      icon: <MessageCircle className="w-6 h-6" />,
      label: "Preguntas FAQ",
      value: stats.faqs,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          Bienvenido, {session.user?.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Panel de administración de Liwei Motors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-[#1e40af]/20 transition-all"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{c.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0f172a]">Cotizaciones recientes</h2>
          <Link href="/admin/cotizaciones" className="text-sm text-[#1e40af] hover:underline">
            Ver todas
          </Link>
        </div>
        {recentQuotes.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No hay cotizaciones aún.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentQuotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <div className="font-medium text-sm text-[#0f172a]">{q.company}</div>
                  <div className="text-xs text-gray-400">{q.contact} · {q.email}</div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    q.status === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {q.status === "pending" ? "Pendiente" : "Atendida"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
