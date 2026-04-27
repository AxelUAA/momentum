"use client";
import { Eye, Pencil, Copy, Archive, CreditCard } from "lucide-react";
import Link from "next/link";
import { duplicateEvent, archiveEvent } from "@/app/actions/events";
import { createOneTimeCheckout } from "@/app/actions/billing";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteEventDialog } from "@/components/dashboard/DeleteEventDialog";

interface EventActionsProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  paymentStatus?: "UNPAID" | "PENDING_VOUCHER" | "PAID" | "EXPIRED" | "REFUNDED";
}

export function EventActions({
  eventId,
  eventTitle,
  eventSlug,
  paymentStatus,
}: EventActionsProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDuplicate = async () => {
    setIsPending(true);
    try {
      const result = await duplicateEvent(eventId);
      if (result.success) {
        toast.success("Evento duplicado");
      } else {
        toast.error(result.error || "Error al duplicar");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsPending(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("¿Estás seguro de que deseas archivar este evento?")) return;
    setIsPending(true);
    try {
      const result = await archiveEvent(eventId);
      if (result.success) {
        toast.success("Evento archivado");
      } else {
        toast.error(result.error || "Error al archivar");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setIsPending(false);
    }
  };

  const handlePay = async () => {
    setIsPending(true);
    try {
      const result = await createOneTimeCheckout(eventId);
      if (result.success && result.url) {
        window.location.href = result.url;
        return;
      }
      toast.error(result.error || "No se pudo iniciar checkout");
    } catch {
      toast.error("Error inesperado al iniciar pago");
    } finally {
      setIsPending(false);
    }
  };

  const needsPayment = paymentStatus && paymentStatus !== "PAID";

  return (
    <div className="flex items-center justify-end gap-1 md:gap-2 transition-opacity">
      {needsPayment ? (
        <button
          onClick={handlePay}
          disabled={isPending}
          className="flex h-11 items-center gap-2 rounded-lg bg-[var(--color-midnight)] px-3 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 transition-all md:h-9 disabled:opacity-50"
          title="Pagar invitación"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Pagar
        </button>
      ) : null}
      <Link
        href={`/dashboard/events/${eventId}`}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground opacity-60 hover:bg-background hover:text-[var(--color-brand)] hover:opacity-100 transition-all md:h-9 md:w-9 shadow-sm ring-1 ring-border/50"
        title="Ver detalle"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/dashboard/events/${eventId}/edit`}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground opacity-60 hover:bg-background hover:text-[var(--color-brand)] hover:opacity-100 transition-all md:h-9 md:w-9 shadow-sm ring-1 ring-border/50"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDuplicate}
        disabled={isPending}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground opacity-60 hover:bg-background hover:text-[var(--color-brand)] hover:opacity-100 transition-all md:h-9 md:w-9 shadow-sm ring-1 ring-border/50 disabled:opacity-50"
        title="Duplicar"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        onClick={handleArchive}
        disabled={isPending}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground opacity-60 hover:bg-background hover:text-destructive hover:opacity-100 transition-all md:h-9 md:w-9 shadow-sm ring-1 ring-border/50 disabled:opacity-50"
        title="Archivar"
      >
        <Archive className="h-4 w-4" />
      </button>
      <DeleteEventDialog
        eventId={eventId}
        eventTitle={eventTitle}
        eventSlug={eventSlug}
      />
    </div>
  );
}
