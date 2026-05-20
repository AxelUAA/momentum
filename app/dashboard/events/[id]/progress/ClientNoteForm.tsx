"use client";

import { useState } from "react";
import { addClientNote } from "@/app/actions/events";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function ClientNoteForm({ eventId }: { eventId: string }) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addClientNote(eventId, note);
      if (result.success) {
        toast.success("Nota enviada correctamente.");
        setNote("");
      } else {
        toast.error(result.error || "Ocurrió un error al enviar la nota.");
      }
    } catch (error) {
      toast.error("Ocurrió un error al enviar la nota.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all"
        placeholder="Escribe aquí los cambios que necesitas..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !note.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-6 py-3 text-sm font-bold text-[var(--color-midnight)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? "Enviando..." : "Enviar nota"}
      </button>
    </form>
  );
}
