"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { updateEventStatus } from "@/app/actions/events";
import { toast } from "sonner";

export function SubmitEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateEventStatus(eventId, "INTAKE_COMPLETE");
      if (result.success) {
        toast.success("¡Datos enviados con éxito!");
        router.refresh();
      } else {
        toast.error(result.error || "Ocurrió un error al enviar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-midnight)] px-8 py-4 text-sm font-bold text-[var(--color-cream)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:pointer-events-none"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      Enviar para construcción
    </button>
  );
}
