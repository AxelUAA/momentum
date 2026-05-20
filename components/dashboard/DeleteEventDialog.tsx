"use client";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/actions/events";
import { createPortal } from "react-dom";

interface Props {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
}

export function DeleteEventDialog({ eventId, eventTitle, eventSlug }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmation !== eventSlug) {
      toast.error("El texto de confirmación no coincide");
      return;
    }
    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast.success(`Evento "${eventTitle}" eliminado`);
        setIsOpen(false);
        router.push("/dashboard/events");
      } else {
        toast.error(result.error || "Error al eliminar");
      }
    } catch (e) {
      toast.error("Error inesperado al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Eliminar evento"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-red-600/40 hover:bg-destructive/10 hover:text-red-600 transition-all md:h-9 md:w-9 shadow-sm ring-1 ring-destructive/20"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-midnight)]">
                  Eliminar evento
                </h3>
                <p className="text-sm text-[var(--color-midnight)]/60 mt-1">
                  Esta acción **NO** se puede deshacer. Se borrarán el evento, todos sus invitados y confirmaciones.
                </p>
              </div>
            </div>

            <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-[var(--color-midnight)] font-medium">
                {eventTitle}
              </p>
              <p className="text-xs text-[var(--color-midnight)]/60">
                /e/{eventSlug}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-[var(--color-midnight)]/80">
                Escribe <code className="bg-muted px-1 rounded font-bold text-red-600">{eventSlug}</code> para confirmar:
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder={eventSlug}
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setConfirmation("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmation !== eventSlug}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
