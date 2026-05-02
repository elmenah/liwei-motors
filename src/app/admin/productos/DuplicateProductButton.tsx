"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";

export default function DuplicateProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    if (!confirm(`¿Duplicar el producto "${name}"?\n\nSe creará una copia en estado Pausado para que la edites antes de publicar.`)) return;
    setLoading(true);
    const res = await fetch(`/api/productos/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      title="Duplicar"
      className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
