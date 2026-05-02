"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";

export default function QuoteActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"attend" | "delete" | null>(null);

  async function attend() {
    setLoading("attend");
    await fetch(`/api/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "attended" }),
    });
    setLoading(null);
    router.refresh();
  }

  async function remove() {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setLoading("delete");
    await fetch(`/api/cotizaciones/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-1 shrink-0">
      {status === "pending" && (
        <button
          onClick={attend}
          disabled={loading !== null}
          title="Marcar como atendida"
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          {loading === "attend" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={remove}
        disabled={loading !== null}
        title="Eliminar"
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        {loading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
