"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestFormSchema, type GuestFormData, type GuestFormInput } from "@/types/guest";
import { createGuest, updateGuest } from "@/app/actions/guests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Save, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guest?: any;
  eventId: string;
}

export default function GuestFormModal({ isOpen, onClose, guest, eventId }: Props) {
  const router = useRouter();
  const isEditing = !!guest;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GuestFormInput, unknown, GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: guest?.name || "",
      phone: guest?.phone || "",
      email: guest?.email || "",
      allowedGuests: guest?.allowedGuests || 0,
      relationship: guest?.relationship || "",
      invitedBy: guest?.invitedBy || "",
      tableNumber: guest?.tableNumber || "",
      adminNotes: guest?.adminNotes || "",
    }
  });

  const onSubmit = async (data: GuestFormData) => {
    try {
      let result;
      if (isEditing) {
        result = await updateGuest(guest.id, data);
      } else {
        result = await createGuest(eventId, data);
      }

      if (result.success) {
        toast.success(isEditing ? "Invitado actualizado" : "Invitado creado");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Ocurrió un error");
      }
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-midnight)]/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-border bg-card p-8 text-card-foreground shadow-2xl no-scrollbar md:p-12"
          >
            <button onClick={onClose} className="absolute right-8 top-8 rounded-full p-2 transition-all hover:bg-muted/60">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-accent p-3 text-accent-foreground shadow-lg shadow-[var(--color-brand)]/20">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {isEditing ? "Editar Invitado" : "Nuevo Invitado"}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {isEditing ? "Modifica los datos del invitado" : "Completa los datos para el envío"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
                  <input 
                    {...register("name")}
                    placeholder="Ej: Juan Pérez"
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono</label>
                  <input 
                    {...register("phone")}
                    placeholder="+52 555 123 4567"
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                  <input 
                    {...register("email")}
                    placeholder="correo@ejemplo.com"
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                  {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acompañantes Permitidos</label>
                  <input 
                    type="number"
                    {...register("allowedGuests")}
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Relación</label>
                  <select 
                    {...register("relationship")}
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="FAMILY_BRIDE">Familia Novia</option>
                    <option value="FAMILY_GROOM">Familia Novio</option>
                    <option value="FAMILY_BIRTHDAY">Familia Festejado</option>
                    <option value="FRIEND">Amigo/a</option>
                    <option value="WORK">Trabajo</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invitado Por</label>
                  <select 
                    {...register("invitedBy")}
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="BRIDE">Novia</option>
                    <option value="GROOM">Novio</option>
                    <option value="BOTH">Ambos</option>
                    <option value="HOST">Anfitrión</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Número de Mesa / Zona</label>
                  <input 
                    {...register("tableNumber")}
                    placeholder="Ej: Mesa 12, VIP, etc."
                    className="h-14 w-full rounded-2xl border border-border bg-background px-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notas Internas (Admin)</label>
                  <textarea 
                    {...register("adminNotes")}
                    rows={3}
                    placeholder="Notas que solo verás tú..."
                    className="w-full resize-none rounded-2xl border border-border bg-background p-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 rounded-full border border-border bg-background py-4 text-sm font-bold text-foreground transition-all hover:bg-muted/60"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-black/10 transition-all hover:shadow-black/20 active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Invitado" : "Crear Invitado"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
