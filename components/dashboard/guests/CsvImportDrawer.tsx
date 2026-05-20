"use client";

import { useState, useRef } from "react";
import { X, FileUp, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { guestFormSchema, type GuestFormData } from "@/types/guest";
import { bulkCreateGuests } from "@/app/actions/guests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function CsvImportDrawer({ isOpen, onClose, eventId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: GuestFormData[];
    invalid: { row: number; errors: string[] }[];
    internalDupes: { row: number; reason: string }[];
  }>({ valid: [], invalid: [], internalDupes: [] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateData(results.data);
      },
      error: (error) => {
        toast.error("Error al leer el archivo CSV");
      }
    });
  };

  const validateData = (data: any[]) => {
    const valid: GuestFormData[] = [];
    const invalid: { row: number; errors: string[] }[] = [];

    data.forEach((row, index) => {
      // Normalizar headers
      const normalizedRow = {
        name: row.nombre || row.name || row.Name || row.Nombre,
        phone: row.telefono || row.phone || row.celular || row.Celular,
        email: row.email || row.correo || row.Correo || row.Email,
        allowedGuests: row.acompañantes || row.companions || row.guests || 0,
        relationship: row.relacion || row.relationship || row.Relacion,
        invitedBy: row.invitado_por || row.invited_by || row.Invitado,
      };

      const result = guestFormSchema.safeParse(normalizedRow);
      if (result.success) {
        valid.push(result.data);
      } else {
        invalid.push({
          row: index + 1,
          errors: result.error.issues.map(i => i.message)
        });
      }
    });

    // Detectar duplicados internos del CSV (por email o phone)
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const internalDupes: { row: number; reason: string }[] = [];

    valid.forEach((v, i) => {
      if (v.email && seenEmails.has(v.email)) {
        internalDupes.push({ row: i + 1, reason: `Email duplicado: ${v.email}` });
      } else if (v.email) seenEmails.add(v.email);
      if (v.phone && seenPhones.has(v.phone)) {
        internalDupes.push({ row: i + 1, reason: `Telefono duplicado: ${v.phone}` });
      } else if (v.phone) seenPhones.add(v.phone);
    });

    setValidationResults({ valid, invalid, internalDupes });
    setCsvData(data);
    setStep(2);
  };

  const handleImport = async () => {
    if (validationResults.valid.length === 0 || validationResults.internalDupes.length > 0) return;
    
    setIsProcessing(true);
    try {
      const result = await bulkCreateGuests(eventId, validationResults.valid);
      
      if (result.success && result.data) {
        toast.success(`${result.data.created} invitados importados correctamente`);
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} filas fallaron`);
        }
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Error en la importación");
      }
    } catch (e) {
      toast.error("Error en la importación");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ["nombre", "telefono", "email", "acompañantes", "relacion", "invitado_por"];
    const csv = headers.join(",") + "\n" + "Juan Perez,+525551234567,juan@ejemplo.com,2,FRIEND,BRIDE";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plantilla_invitados.csv";
    link.click();
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Importar Invitados</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Carga masiva vía CSV</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 transition-all hover:bg-muted/60">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {step === 1 ? (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border p-12 text-center transition-all hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
                  >
                    <div className="mb-4 rounded-2xl bg-muted p-4 transition-all group-hover:bg-[var(--color-brand)] group-hover:text-white">
                      <FileUp className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-foreground">Sube tu archivo CSV</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Haz clic para seleccionar o arrastra y suelta</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv"
                      className="hidden" 
                    />
                  </div>

                  <div className="space-y-4 rounded-[2rem] bg-muted p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Columnas soportadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {["nombre*", "teléfono", "email", "acompañantes", "relación", "invitado_por"].map(h => (
                        <span key={h} className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-bold text-foreground">
                          {h}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand)] hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Descargar plantilla de ejemplo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[2rem] border border-emerald-200 bg-emerald-100/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-900/20">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Válidos</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-700">{validationResults.valid.length}</div>
                    </div>
                    <div className="rounded-[2rem] border border-rose-200 bg-rose-100/70 p-6 dark:border-rose-900/60 dark:bg-rose-900/20">
                      <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Errores</span>
                      </div>
                      <div className="text-2xl font-black text-rose-700">{validationResults.invalid.length}</div>
                    </div>
                  </div>

                  {validationResults.invalid.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detalle de errores</h4>
                      <div className="space-y-2">
                        {validationResults.invalid.slice(0, 5).map((err, i) => (
                          <div key={i} className="rounded-xl border border-rose-200 bg-rose-100/70 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300">
                            Fila {err.row}: {err.errors.join(", ")}
                          </div>
                        ))}
                        {validationResults.invalid.length > 5 && (
                          <div className="text-center text-[10px] font-bold text-muted-foreground">
                            ... y {validationResults.invalid.length - 5} errores más
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {validationResults.internalDupes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Duplicados detectados</h4>
                      <div className="space-y-2">
                        {validationResults.internalDupes.slice(0, 5).map((dupe, i) => (
                          <div key={i} className="text-xs p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                            Fila {dupe.row}: {dupe.reason}
                          </div>
                        ))}
                        <p className="text-[10px] text-amber-600 font-bold px-1">
                          Resuelve los duplicados antes de importar.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vista previa (Primeros 5)</h4>
                    <div className="overflow-hidden rounded-2xl border border-border">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-2 font-black uppercase">Nombre</th>
                            <th className="px-4 py-2 font-black uppercase">Teléfono</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {validationResults.valid.slice(0, 5).map((v, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 font-medium">{v.name}</td>
                              <td className="px-4 py-2 font-medium">{v.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t border-border bg-muted/40 p-8">
              <button
                onClick={step === 1 ? onClose : () => setStep(1)}
                className="flex-1 rounded-full border border-border bg-background py-4 text-sm font-bold text-foreground transition-all hover:bg-muted"
              >
                {step === 1 ? "Cancelar" : "Atrás"}
              </button>
              <button
                disabled={
                  step === 1 ||
                  validationResults.valid.length === 0 ||
                  validationResults.internalDupes.length > 0 ||
                  isProcessing
                }
                onClick={handleImport}
                className={cn(
                  "flex-[2] flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-white shadow-xl active:scale-95 transition-all disabled:opacity-50",
                  "bg-primary text-primary-foreground shadow-black/10 hover:shadow-black/20"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="h-4 w-4" />
                )}
                {isProcessing
                  ? "Importando..."
                  : `Importar ${validationResults.valid.length} invitados`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
