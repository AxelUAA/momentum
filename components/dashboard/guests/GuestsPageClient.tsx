"use client";

import { useState, useMemo } from "react";
import { 
  Users, UserPlus, FileDown, FileUp, 
  MessageSquare, Search, Filter, 
  Copy, MoreHorizontal, Edit2, Trash2,
  ExternalLink, CheckCircle2, Clock, XCircle,
  ArrowUpDown, ChevronRight, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  RELATIONSHIP_LABELS, 
  RSVP_STATUS_LABELS, 
  RSVP_STATUS_COLORS 
} from "@/lib/guest-helpers";
import { toast } from "sonner";
import { deleteGuest } from "@/app/actions/guests";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { format } from "date-fns";

// Components
import GuestFormModal from "./GuestFormModal";
import CsvImportDrawer from "./CsvImportDrawer";
import WhatsAppGenerator from "./WhatsAppGenerator";
import GuestDetailDrawer from "./GuestDetailDrawer";

export default function GuestsPageClient({ event }: { event: any }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [relationFilter, setRelationFilter] = useState("ALL");
  const [onlyNoPhone, setOnlyNoPhone] = useState(false);
  
  // Modal/Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const total = event.guests.length;
    const confirmed = event.guests.filter((g: any) => g.rsvp?.status === "CONFIRMED").length;
    const pending = event.guests.filter((g: any) => !g.rsvp || g.rsvp.status === "PENDING").length;
    const declined = event.guests.filter((g: any) => g.rsvp?.status === "DECLINED").length;
    const percentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    return { total, confirmed, pending, declined, percentage };
  }, [event.guests]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return event.guests.filter((g: any) => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (g.phone && g.phone.includes(searchTerm));
      const matchesStatus = statusFilter === "ALL" || (g.rsvp?.status || "PENDING") === statusFilter;
      const matchesRelation = relationFilter === "ALL" || g.relationship === relationFilter;
      const matchesNoPhone = !onlyNoPhone || !g.phone;

      return matchesSearch && matchesStatus && matchesRelation && matchesNoPhone;
    });
  }, [event.guests, searchTerm, statusFilter, relationFilter, onlyNoPhone]);

  const handleExport = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const rows = event.guests.map((g: any) => ({
      Nombre: g.name,
      Teléfono: g.phone || "",
      Email: g.email || "",
      "Acompañantes permitidos": g.allowedGuests,
      "Acompañantes confirmados": g.rsvp?.confirmedGuests ?? 0,
      Relación: g.relationship ? RELATIONSHIP_LABELS[g.relationship] : "",
      "Status RSVP": g.rsvp ? RSVP_STATUS_LABELS[g.rsvp.status] : "Pendiente",
      "Menú": g.rsvp?.menuChoice || "",
      "Mensaje": g.rsvp?.message || "",
      "Respondió": g.rsvp?.respondedAt ? format(new Date(g.rsvp.respondedAt), "dd/MM/yyyy HH:mm") : "",
      "URL única": `${baseUrl}/e/${event.slug}/${g.uniqueToken}`,
      "Vistas": g._count?.invitationViews || 0,
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invitados-${event.slug}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exportado correctamente");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar a este invitado?")) return;
    
    try {
      const result = await deleteGuest(id);
      if (result.success) {
        toast.success("Invitado eliminado");
        router.refresh();
      }
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const copyInviteUrl = (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const url = `${baseUrl}/e/${event.slug}/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copiada al portapapeles");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Breadcrumbs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-midnight)]/40">
          <Link href="/dashboard/events" className="hover:text-[var(--color-midnight)] transition-colors">Eventos</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/dashboard/events/${event.id}`} className="hover:text-[var(--color-midnight)] transition-colors">{event.title}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[var(--color-midnight)]">Invitados</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[var(--color-midnight)] tracking-tighter">Invitados</h1>
            <p className="text-sm font-medium text-[var(--color-midnight)]/60">Gestiona la lista y RSVPs de {event.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSelectedGuest(null); setIsFormOpen(true); }}
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight)] px-6 py-3 text-sm font-bold text-white shadow-xl shadow-[var(--color-midnight)]/10 hover:shadow-[var(--color-midnight)]/20 active:scale-95 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Invitado
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total invitados", value: stats.total, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Confirmados", value: stats.confirmed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", badge: `${stats.percentage}%` },
          { label: "Pendientes", value: stats.pending, icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Rechazados", value: stats.declined, icon: XCircle, color: "bg-rose-50 text-rose-600" },
        ].map((stat, i) => (
          <div key={i} className="group rounded-[2rem] border border-black/5 bg-white p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
            <div className="flex items-center justify-between">
              <div className={cn("rounded-2xl p-3", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.badge && (
                <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                  {stat.badge}
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[var(--color-midnight)]">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/40">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <div className="w-full max-w-sm space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-midnight)]/20" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o teléfono..."
                className="h-12 w-full rounded-2xl border border-black/5 bg-white pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">RSVP</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 rounded-2xl border border-black/5 bg-white px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="DECLINED">Rechazados</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/30 ml-1">Relación</label>
            <select 
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value)}
              className="h-12 rounded-2xl border border-black/5 bg-white px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all"
            >
              <option value="ALL">Todas</option>
              {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setOnlyNoPhone(!onlyNoPhone)}
            className={cn(
              "h-12 rounded-2xl border px-4 text-xs font-bold transition-all",
              onlyNoPhone 
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)]" 
                : "border-black/5 bg-white text-[var(--color-midnight)]/40 hover:bg-black/5"
            )}
          >
            Sin teléfono
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex h-12 items-center gap-2 rounded-2xl border border-black/5 bg-white px-5 text-xs font-bold text-[var(--color-midnight)] hover:bg-black/5 transition-all"
          >
            <FileUp className="h-4 w-4" />
            Importar CSV
          </button>
          <button 
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex h-12 items-center gap-2 rounded-2xl border border-black/5 bg-white px-5 text-xs font-bold text-[var(--color-midnight)] hover:bg-black/5 transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </button>
          <button 
            onClick={handleExport}
            className="flex h-12 items-center gap-2 rounded-2xl border border-black/5 bg-white px-5 text-xs font-bold text-[var(--color-midnight)] hover:bg-black/5 transition-all"
          >
            <FileDown className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="rounded-[2.5rem] border border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 bg-white/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Invitado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Relación</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 text-center">Lugares</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 text-center">Vistas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <AnimatePresence mode="popLayout">
                {filteredGuests.map((guest: any) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={guest.id} 
                    onClick={() => { setSelectedGuest(guest); setIsDetailOpen(true); }}
                    className="group cursor-pointer hover:bg-white transition-colors duration-300"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-midnight)]/5 text-xs font-black text-[var(--color-midnight)]">
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black text-[var(--color-midnight)]">{guest.name}</div>
                          {guest.tableNumber && (
                            <div className="text-[10px] font-bold text-[var(--color-brand)] uppercase">Mesa {guest.tableNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-midnight)]/60">
                          <Phone className="h-3 w-3" />
                          {guest.phone || "—"}
                        </div>
                        <div className="text-[10px] font-medium text-[var(--color-midnight)]/40">{guest.email || "—"}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-[var(--color-midnight)]/60">
                        {guest.relationship ? RELATIONSHIP_LABELS[guest.relationship] : "—"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-[10px] font-black text-[var(--color-midnight)]">
                        {guest.rsvp?.confirmedGuests || 0} / {guest.allowedGuests}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                        RSVP_STATUS_COLORS[guest.rsvp?.status || "PENDING"]
                      )}>
                        {RSVP_STATUS_LABELS[guest.rsvp?.status || "PENDING"]}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-[var(--color-midnight)]/40">
                      {guest._count?.invitationViews || 0}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => copyInviteUrl(guest.uniqueToken)}
                          className="rounded-full p-2 text-[var(--color-midnight)]/20 hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedGuest(guest); setIsFormOpen(true); }}
                          className="rounded-full p-2 text-[var(--color-midnight)]/20 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(guest.id)}
                          className="rounded-full p-2 text-[var(--color-midnight)]/20 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredGuests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-full bg-black/5 p-6">
              <Users className="h-12 w-12 text-[var(--color-midnight)]/20" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-midnight)]">No se encontraron invitados</h3>
            <p className="mt-2 text-sm text-[var(--color-midnight)]/40">Intenta ajustar los filtros o agrega un nuevo invitado.</p>
          </div>
        )}
      </div>

      <GuestFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        guest={selectedGuest}
        eventId={event.id}
      />
      
      <CsvImportDrawer 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        eventId={event.id}
      />
      
      <WhatsAppGenerator 
        isOpen={isWhatsAppOpen} 
        onClose={() => setIsWhatsAppOpen(false)} 
        guests={filteredGuests}
        event={event}
      />
      
      <GuestDetailDrawer 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        guest={selectedGuest}
      />
    </div>
  );
}
