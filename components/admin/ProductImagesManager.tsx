"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage, deleteProductImage } from "@/app/actions/upload";
import { cn } from "@/lib/utils";

export function ProductImagesManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // URLs subidas en esta sesión de edición: si se quitan antes de guardar,
  // también se borran del storage (aún no las referencia ningún producto).
  const sessionUploads = useRef(new Set<string>());
  const [uploading, setUploading] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // Acumulador local: evita que subidas consecutivas pisen el estado
    let acc = [...imagesRef.current];

    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const formData = new FormData();
        formData.append(
          "file",
          new File([compressed], file.name.replace(/\.\w+$/, ".webp"), {
            type: "image/webp",
          })
        );

        const result = await uploadProductImage(formData);
        if (result.success && result.url) {
          sessionUploads.current.add(result.url);
          acc = [...acc, result.url];
          onChange(acc);
        } else {
          toast.error(result.error ?? "Error al subir la imagen");
        }
      } catch (e) {
        console.error(e);
        toast.error(`No se pudo procesar ${file.name}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  // Ref espejo para que las subidas en serie no pisen el estado entre sí
  const imagesRef = useRef(images);
  imagesRef.current = images;

  async function handleRemove(url: string) {
    onChange(images.filter((i) => i !== url));
    if (sessionUploads.current.has(url)) {
      sessionUploads.current.delete(url);
      await deleteProductImage(url);
    }
  }

  function makePrincipal(url: string) {
    onChange([url, ...images.filter((i) => i !== url)]);
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Fotos del producto
      </span>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {images.map((url, i) => (
          <div
            key={url}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-2xl border bg-background",
              i === 0 ? "border-accent" : "border-border"
            )}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />

            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                Principal
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrincipal(url)}
                  aria-label="Hacer principal"
                  title="Hacer principal"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors duration-200 hover:text-accent"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label="Quitar imagen"
                title="Quitar"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors duration-200 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Tile de subida */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors duration-200 hover:border-accent hover:text-accent disabled:cursor-wait"
        >
          {uploading > 0 ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Subiendo {uploading}...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Agregar fotos</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        aria-label="Subir fotos del producto"
      />

      <p className="mt-2 text-xs text-muted-foreground">
        JPG, PNG o WebP. Se comprimen automáticamente antes de subir. La primera
        foto es la portada — usa la estrella para cambiarla.
      </p>
    </div>
  );
}
