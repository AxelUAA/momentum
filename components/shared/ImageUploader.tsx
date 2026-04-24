"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { uploadEventImage, deleteEventImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onUpload: (value: string | string[] | null) => void;
  eventId: string;
  category: 'cover' | 'gallery' | 'dress-code' | 'timeline';
  maxFiles?: number;
  existing?: string | string[] | null;
  className?: string;
}

export function ImageUploader({ onUpload, eventId, category, maxFiles = 1, existing, className }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImages = Array.isArray(existing) 
    ? existing 
    : (existing ? [existing] : []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileList = Array.from(files);
    
    // Validar límite de archivos
    if (maxFiles > 1 && currentImages.length + fileList.length > maxFiles) {
      toast.error(`Solo puedes subir hasta ${maxFiles} imágenes`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const uploadedUrls: string[] = maxFiles === 1 ? [] : [...currentImages];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Compresión client-side
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        };
        
        const compressedFile = await imageCompression(file, options);
        
        const formData = new FormData();
        formData.append("file", compressedFile);

        const result = await uploadEventImage(formData, eventId, category);
        
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
          setProgress(((i + 1) / fileList.length) * 100);
          
          if (maxFiles === 1) break; // Si solo es una, paramos después de la primera
        } else {
          toast.error(result.error || "Error al subir imagen");
        }
      }

      if (maxFiles === 1) {
        onUpload(uploadedUrls[0] || null);
      } else {
        onUpload(uploadedUrls);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ocurrió un error al procesar las imágenes");
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    try {
      const result = await deleteEventImage(url);
      if (result.success) {
        if (maxFiles === 1) {
          onUpload(null);
        } else {
          const remaining = currentImages.filter(u => u !== url);
          onUpload(remaining);
        }
        toast.success("Imagen eliminada");
      } else {
        toast.error(result.error || "No se pudo eliminar la imagen");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      >
        {currentImages.map((url, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-black/5 bg-black/5 shadow-sm">
            <img 
              src={url} 
              alt={`Imagen ${i + 1}`} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {(maxFiles === 1 ? currentImages.length === 0 : currentImages.length < maxFiles) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all duration-300",
              isDragging 
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 scale-[0.98]" 
                : "border-black/5 bg-black/5 hover:bg-black/[0.07] hover:border-[var(--color-brand)]/30",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/40">Subiendo...</span>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-white p-3 text-[var(--color-brand)] shadow-lg shadow-black/5">
                   <Upload className="h-5 w-5" />
                </div>
                <div className="text-center px-4">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-midnight)]/60">
                    {maxFiles === 1 ? "Subir Portada" : "Añadir Fotos"}
                  </span>
                  <span className="block text-[8px] font-bold text-[var(--color-midnight)]/30 mt-1 uppercase">JPG, PNG o WebP (Máx 5MB)</span>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleUpload(e.target.files)}
        multiple={maxFiles > 1}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      
      {isUploading && (
        <div className="space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div 
              className="h-full bg-[var(--color-brand)] transition-all duration-500 ease-out shadow-[0_0_8px_var(--color-brand)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-[10px] font-black text-[var(--color-brand)] tabular-nums">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
