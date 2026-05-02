export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TestimoniosClient from "./TestimoniosClient";

export default async function TestimoniosPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">Testimonios</h1>
        <p className="text-gray-500 text-sm mt-1">Reseñas de clientes visibles en el home</p>
      </div>
      <TestimoniosClient initialTestimonials={testimonials} />
    </div>
  );
}
