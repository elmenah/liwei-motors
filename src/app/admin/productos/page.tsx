import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Eye, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import DuplicateProductButton from "./DuplicateProductButton";

async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      images: { take: 1, orderBy: { order: "asc" } },
      _count: { select: { images: true, colors: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProductosPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const products = await getProducts();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-[#1e40af] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No hay productos aún.</p>
          <Link href="/admin/productos/nuevo" className="text-[#1e40af] text-sm hover:underline mt-2 inline-block">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Precio</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Estado</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0f172a]">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p._count.images} img · {p._count.colors} colores
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    {p.price ? `$${p.price.toLocaleString("es-AR")}` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.available ? "Disponible" : "Pausado"}
                    </span>
                    {p.featured && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/catalogo/${p.slug}`}
                        target="_blank"
                        title="Ver en sitio"
                        className="p-1.5 text-gray-400 hover:text-[#1e40af] rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/productos/${p.id}/editar`}
                        title="Editar"
                        className="p-1.5 text-gray-400 hover:text-[#1e40af] rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DuplicateProductButton id={p.id} name={p.name} />
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
