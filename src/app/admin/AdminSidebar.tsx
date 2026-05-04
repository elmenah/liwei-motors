"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  MessageCircle,
  FileText,
  LogOut,
  Zap,
  Image,
  Star,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { href: "/admin/productos", icon: <Package className="w-4 h-4" />, label: "Productos" },
  { href: "/admin/categorias", icon: <Tag className="w-4 h-4" />, label: "Categorías" },
  { href: "/admin/banners", icon: <Image className="w-4 h-4" />, label: "Banners" },
  { href: "/admin/testimonios", icon: <Star className="w-4 h-4" />, label: "Testimonios" },
  { href: "/admin/cotizaciones", icon: <FileText className="w-4 h-4" />, label: "Cotizaciones" },
  { href: "/admin/faq", icon: <MessageCircle className="w-4 h-4" />, label: "FAQ" },
  { href: "/admin/settings", icon: <Settings className="w-4 h-4" />, label: "Configuración" },
];

type User = { name?: string | null; email?: string | null };

export default function AdminSidebar({ user }: { user?: User }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-white flex flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#1e40af] rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm">Liwei Motors</div>
          <div className="text-xs text-gray-400">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1e40af] text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        {user && (
          <div className="mb-3 px-2">
            <div className="text-sm font-semibold text-white">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 mt-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          ← Ver sitio web
        </Link>
      </div>
    </aside>
  );
}
