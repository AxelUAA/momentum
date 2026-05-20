"use client";

import { toggleUserRole } from "@/app/actions/admin";
import { useState } from "react";
import { toast } from "sonner";

export function RoleToggleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await toggleUserRole(userId);
      if (res.success) {
        toast.success(`Rol actualizado a ${res.newRole}`);
      }
    } catch (e) {
      toast.error("Error al cambiar el rol");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentRole === "ADMIN";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        isAdmin
          ? "border border-destructive/30 text-destructive hover:bg-destructive/10"
          : "border border-[var(--color-brand)]/30 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
      } disabled:opacity-50`}
    >
      {loading ? "..." : isAdmin ? "Degradar a USER" : "Promover a ADMIN"}
    </button>
  );
}
