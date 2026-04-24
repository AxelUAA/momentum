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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-black/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-midnight)] tracking-tight">Importar Invitados</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-midnight)]/30">Carga masiva vía CSV</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 transition-all">
                <X className="h-5 w-5 text-[var(--color-midnight)]/40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {step === 1 ? (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-black/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 transition-all"
                  >
                    <div className="rounded-2xl bg-black/5 p-4 mb-4 group-hover:bg-[var(--color-brand)] group-hover:text-white transition-all">
                      <FileUp className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-[var(--color-midnight)]">Sube tu archivo CSV</h3>
                    <p className="text-xs text-[var(--color-midnight)]/40 mt-1">Haz clic para seleccionar o arrastra y suelta</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv"
                      className="hidden" 
                    />
                  </div>

                  <div className="rounded-[2rem] bg-black/5 p-6 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Columnas soportadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {["nombre*", "teléfono", "email", "acompañantes", "relación", "invitado_por"].map(h => (
                        <span key={h} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[var(--color-midnight)] border border-black/5">
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
                    <div className="rounded-[2rem] bg-emerald-50 p-6 border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Válidos</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-700">{validationResults.valid.length}</div>
                    </div>
                    <div className="rounded-[2rem] bg-rose-50 p-6 border border-rose-100">
                      <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Errores</span>
                      </div>
                      <div className="text-2xl font-black text-rose-700">{validationResults.invalid.length}</div>
                    </div>
                  </div>

                  {validationResults.invalid.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 ml-1">Detalle de errores</h4>
                      <div className="space-y-2">
                        {validationResults.invalid.slice(0, 5).map((err, i) => (
                          <div key={i} className="text-xs p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                            Fila {err.row}: {err.errors.join(", ")}
                          </div>
                        ))}
                        {validationResults.invalid.length > 5 && (
                          <div className="text-[10px] text-center text-[var(--color-midnight)]/40 font-bold">
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
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40 ml-1">Vista previa (Primeros 5)</h4>
                    <div className="rounded-2xl border border-black/5 overflow-hidden">
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-black/5">
                          <tr>
                            <th className="px-4 py-2 font-black uppercase">Nombre</th>
                            <th className="px-4 py-2 font-black uppercase">Teléfono</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
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

            <div className="p-8 border-t border-black/5 bg-black/5 flex gap-4">
              <button
                onClick={step === 1 ? onClose : () => setStep(1)}
                className="flex-1 rounded-full bg-white py-4 text-sm font-bold text-[var(--color-midnight)] border border-black/5 hover:bg-black/10 transition-all"
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
                  "bg-[var(--color-midnight)] shadow-[var(--color-midnight)]/10 hover:shadow-[var(--color-midnight)]/20"
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
