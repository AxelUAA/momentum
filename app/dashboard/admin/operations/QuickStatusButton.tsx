"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateEventStatus } from "@/app/actions/events";

type Variant = "default" | "success" | "danger";

interface QuickStatusButtonProps {
  eventId: string;
  nextStatus: string;
  label: string;
  variant?: Variant;
}

const VARIANT_CLS: Record<Variant, string> = {
  default:
    "bg-[var(--color-midnight)] text-[var(--color-cream)] hover:bg-[var(--color-midnight)]/80",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700",
};

export function QuickStatusButton({
  eventId,
  nextStatus,
  label,
  variant = "default",
}: QuickStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const result = await updateEventStatus(eventId, nextStatus);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANT_CLS[variant]}`}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {label}
      </button>
      {error && (
        <p className="text-[10px] text-rose-600">{error}</p>
      )}
    </div>
  );
}
