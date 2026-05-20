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
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 text-card-foreground shadow-2xl md:p-12"
          >
            <button onClick={onClose} className="absolute right-8 top-8 rounded-full p-2 transition-all hover:bg-muted/60">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight">Generador de WhatsApp</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Personaliza y exporta mensajes masivos</p>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Editor */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Plantilla del mensaje</h3>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <button 
                      onClick={() => setOnlyNoRsvp(!onlyNoRsvp)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                        onlyNoRsvp ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]" : "bg-muted text-muted-foreground"
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
                        className="rounded-lg bg-muted px-2 py-1 text-[10px] font-bold text-foreground transition-all hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="no-scrollbar flex-1 w-full resize-none rounded-2xl border border-border bg-background p-6 text-sm font-medium text-foreground outline-none transition-all focus:bg-background focus:ring-4 focus:ring-[var(--color-brand)]/10"
                  />
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col space-y-4 rounded-[2rem] bg-muted/60 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vista previa (Primer invitado)</h3>
                
                {filteredGuests.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    <div className="no-scrollbar flex-1 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-background p-6 text-sm font-medium text-foreground shadow-sm">
                      {getPreview(filteredGuests[0])}
                    </div>
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-100/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/20">
                      <div className="rounded-full bg-emerald-600 p-1.5 text-white dark:bg-emerald-500">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Se generarán {filteredGuests.length} mensajes personalizados</span>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background py-4 text-sm font-bold text-foreground transition-all hover:bg-muted/50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Descargar .txt (Manual)
              </button>
              <button 
                onClick={downloadCsv}
                disabled={filteredGuests.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background py-4 text-sm font-bold text-foreground transition-all hover:bg-muted/50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Descargar .csv (API)
              </button>
              <button 
                disabled={filteredGuests.length === 0}
                className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-black/10 transition-all hover:shadow-black/20 active:scale-95 disabled:opacity-50"
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