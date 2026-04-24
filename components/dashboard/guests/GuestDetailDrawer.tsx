"use client";

import { useState } from "react";
import { 
  X, Edit2, Trash2, Phone, Mail, 
  Users, MapPin, MessageSquare, 
  Copy, ExternalLink, Calendar, 
  BarChart3, Clock, Eye, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  RELATIONSHIP_LABELS, 
  RSVP_STATUS_LABELS, 
  RSVP_STATUS_COLORS 
} from "@/lib/guest-helpers";
import { toast } from "sonner";
import { format } from "date-fns";
import { updateGuest } from "@/app/actions/guests";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guest: any;
}

export default function GuestDetailDrawer({ isOpen, onClose, guest }: Props) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState(guest?.adminNotes || "");

  if (!guest) return null;

  const handleNotesBlur = async () => {
    if (adminNotes === guest.adminNotes) return;
    try {
      await updateGuest(guest.id, { adminNotes });
      toast.success("Nota guardada");
      router.refresh();
    } catch (e) {
      toast.error("Error al guardar nota");
    }
  };

  const copyInviteUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const url = `${baseUrl}/e/${guest.eventId}/${guest.uniqueToken}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copiada");
  };

  const openWhatsApp = () => {
    if (!guest.phone) {
      toast.error("El invitado no tiene teléfono");
      return;
    }
    const cleanPhone = guest.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--color-midnight)]/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-black/5 flex items-start justify-between bg-black/5">
              <div className="space-y-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-midnight)] text-2xl font-black text-white mb-4 shadow-xl shadow-[var(--color-midnight)]/20">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-[var(--color-midnight)] tracking-tight leading-tight">{guest.name}</h2>
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider mt-2",
                  RSVP_STATUS_COLORS[guest.rsvp?.status || "PENDING"]
                )}>
                  {RSVP_STATUS_LABELS[guest.rsvp?.status || "PENDING"]}
                </span>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10 transition-all">
                <X className="h-5 w-5 text-[var(--color-midnight)]/40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Información de contacto</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 group">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[var(--color-midnight)]/40" />
                      <span className="text-sm font-medium text-[var(--color-midnight)]">{guest.phone || "Sin teléfono"}</span>
                    </div>
                    {guest.phone && (
                      <button onClick={() => navigator.clipboard.writeText(guest.phone)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-black/5 rounded-lg transition-all">
                        <Copy className="h-3 w-3 text-[var(--color-midnight)]/40" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[var(--color-midnight)]/40" />
                      <span className="text-sm font-medium text-[var(--color-midnight)]">{guest.email || "Sin correo"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Detalles del evento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Relación</span>
                    <div className="text-xs font-bold text-[var(--color-midnight)]">{guest.relationship ? RELATIONSHIP_LABELS[guest.relationship] : "No definida"}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Invitado por</span>
                    <div className="text-xs font-bold text-[var(--color-midnight)]">{guest.invitedBy || "Ambos"}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Acompañantes</span>
                    <div className="text-xs font-bold text-[var(--color-midnight)]">{guest.allowedGuests} permitidos</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Mesa / Zona</span>
                    <div className="text-xs font-bold text-[var(--color-brand)]">{guest.tableNumber || "No asignada"}</div>
                  </div>
                </div>
              </div>

              {/* RSVP Details if exists */}
              {guest.rsvp && guest.rsvp.status !== "PENDING" && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Respuesta RSVP</h3>
                  <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Confirmados</span>
                        <div className="text-sm font-black text-emerald-700">{guest.rsvp.confirmedGuests} personas</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Menú / Dieta</span>
                        <div className="text-sm font-black text-emerald-700">{guest.rsvp.menuChoice || "Estándar"}</div>
                      </div>
                    </div>
                    {guest.rsvp.message && (
                      <div className="space-y-1 pt-2 border-t border-emerald-100">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Mensaje</span>
                        <div className="text-xs font-medium text-emerald-700 italic">"{guest.rsvp.message}"</div>
                      </div>
                    )}
                    <div className="pt-2 text-[8px] font-bold text-emerald-600/40 uppercase tracking-widest">
                      Respondido el {format(new Date(guest.rsvp.respondedAt), "dd MMM, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Actividad</h3>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] border border-black/5">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Eye className="h-4 w-4 text-[var(--color-midnight)]/20" />
                    <span className="text-lg font-black text-[var(--color-midnight)]">{guest._count?.invitationViews || 0}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Vistas</span>
                  </div>
                  <div className="w-px h-8 bg-black/5" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Smartphone className="h-4 w-4 text-[var(--color-midnight)]/20" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 text-center">Último acceso</span>
                    <span className="text-[10px] font-bold text-[var(--color-midnight)] text-center">
                      {guest.invitationViews?.[0] ? format(new Date(guest.invitationViews[0].createdAt), "dd/MM HH:mm") : "Nunca"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Notas de administrador</h3>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  rows={4}
                  placeholder="Escribe notas privadas aquí..."
                  className="w-full rounded-2xl border border-black/5 bg-black/5 p-6 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-8 border-t border-black/5 bg-black/5 space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={copyInviteUrl}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black/5 bg-white py-4 text-xs font-bold text-[var(--color-midnight)] hover:bg-black/10 transition-all"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </button>
                <button 
                  onClick={openWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-4 text-xs font-bold text-white shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 text-xs font-bold text-blue-600 hover:underline">Editar datos</button>
                <button className="flex-1 text-xs font-bold text-rose-600 hover:underline text-right">Eliminar invitado</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
