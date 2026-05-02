export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import FAQManager from "./FAQManager";

async function getFAQs() {
  return prisma.fAQ.findMany({ orderBy: { order: "asc" } });
}

export default async function AdminFAQPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const faqs = await getFAQs();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Preguntas Frecuentes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administrá las preguntas frecuentes del sitio</p>
      </div>
      <FAQManager initialFaqs={faqs} />
    </div>
  );
}
