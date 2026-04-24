"use client";

import { useState, useMemo } from "react";
import { X, MessageSquare, Download, Check, Copy, ExternalLink, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guests: any[];
  event: any;
}

export default function WhatsAppGenerator({ isOpen, onClose, guests, event }: Props) {
  const [template, setTemplate] = useState(`¡Hola {nombre}! 💌

Estás cordialmente invitado(a) a {evento}.
📅 {fecha}
📍 {lugar}

Abre tu invitación personalizada:
{url}

Por favor confirma antes del {deadline}.
¡Te esperamos con mucho cariño!`);

  const [onlyNoRsvp, setOnlyNoRsvp] = useState(true);
  
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      if (onlyNoRsvp && g.rsvp && g.rsvp.status !== "PENDING") return false;
      return true;
    });
  }, [guests, onlyNoRsvp]);

  // Resolver baseUrl de forma SSR-safe: los client components pre-renderizan en el
  // servidor, donde `window` no existe. Usamos la env pública si está disponible.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const variables = [
    { tag: "{nombre}", label: "Nombre", value: filteredGuests[0]?.name || "Juan" },
    { tag: "{evento}", label: "Evento", value: event.title },
    { tag: "{fecha}", label: "Fecha", value: event.eventDate ? format(new Date(event.eventDate), "dd/MM/yyyy") : "—" },
    { tag: "{url}", label: "URL", value: `${baseUrl}/e/${event.slug}/x7f9k2` },
    { tag: "{deadline}", label: "Límite RSVP", value: event.settings?.rsvpDeadline || "—" },
    { tag: "{lugar}", label: "Lugar", value: event.locationName || "—" },
  ];

  const getPreview = (guest: any) => {
    if (!guest) return template;
    const url = `${baseUrl}/e/${event.slug}/${guest.uniqueToken}`;
    
    return template
      .replace(/{nombre}/g, guest.name)
      .replace(/{evento}/g, event.title)
      .replace(/{fecha}/g, event.eventDate ? format(new Date(event.eventDate), "dd/MM/yyyy") : "—")
      .replace(/{url}/g, url)
      .replace(/{deadline}/g, event.settings?.rsvpDeadline || "—")
      .replace(/{lugar}/g, event.locationName || "—");
  };

  const insertVariable = (tag: string) => {
    setTemplate(prev => prev + " " + tag);
  };

  const downloadTxt = () => {
    const content = filteredGuests.map(g => {
      return `--- PARA: ${g.name} (${g.phone || "Sin teléfono"}) ---\n${getPreview(g)}\n\n`;
    }).join("");
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mensajes_whatsapp_${event.slug}.txt`;
    link.click();
    toast.success("Archivo .txt descargado");
  };

  const downloadCsv = () => {
    const rows = filteredGuests.map(g => ({
      Nombre: g.name,
      Telefono: g.phone || "",
      Mensaje: getPreview(g)
    }));

    const csvContent = "Nombre,Telefono,Mensaje\n" + 
      rows.map(r => `"${r.Nombre}","${r.Telefono}","${r.Mensaje.replace(/"/g, '""')}"`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mensajes_whatsapp_${event.slug}.csv`;
    link.click();
    toast.success("Archivo .csv descargado");
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
            className="relative w-full max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-2xl md:p-12 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <button onClick={onClose} className="absolute right-8 top-8 rounded-full p-2 hover:bg-black/5 transition-all">
              <X className="h-5 w-5 text-[var(--color-midnight)]/40" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-[var(--color-midnight)] tracking-tight">Generador de WhatsApp</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">Personaliza y exporta mensajes masivos</p>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Editor */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Plantilla del mensaje</h3>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-[var(--color-midnight)]/40" />
                    <button 
                      onClick={() => setOnlyNoRsvp(!onlyNoRsvp)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                        onlyNoRsvp ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]" : "bg-black/5 text-[var(--color-midnight)]/40"
                      )}
                    >
                      Solo sin confirmar
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {variables.map(v => (
                      <button 
                        key={v.tag}
                        onClick={() => insertVariable(v.tag)}
                        className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-bold text-[var(--color-midnight)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] transition-all"
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="flex-1 w-full rounded-2xl border border-black/5 bg-black/5 p-6 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all resize-none no-scrollbar"
                  />
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col space-y-4 bg-black/5 rounded-[2rem] p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Vista previa (Primer invitado)</h3>
                
                {filteredGuests.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-white rounded-2xl p-6 text-sm font-medium text-[var(--color-midnight)] whitespace-pre-wrap flex-1 shadow-sm overflow-y-auto no-scrollbar">
                      {getPreview(filteredGuests[0])}
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                      <div className="rounded-full bg-emerald-500 p-1.5 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">Se generarán {filteredGuests.length} mensajes personalizados</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center opacity-40">
                    <p className="text-xs font-bold">No hay invitados que cumplan los filtros para la previsualización</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={downloadTxt}
                disabled={filteredGuests.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black/5 bg-white py-4 text-sm font-bold text-[var(--color-midnight)] hover:bg-black/5 transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Descargar .txt (Manual)
              </button>
              <button 
                onClick={downloadCsv}
                disabled={filteredGuests.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-black/5 bg-white py-4 text-sm font-bold text-[var(--color-midnight)] hover:bg-black/5 transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Descargar .csv (API)
              </button>
              <button 
                disabled={filteredGuests.length === 0}
                className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-[var(--color-midnight)] py-4 text-sm font-bold text-white shadow-xl shadow-[var(--color-midnight)]/10 hover:shadow-[var(--color-midnight)]/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                Generar Links wa.me
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
