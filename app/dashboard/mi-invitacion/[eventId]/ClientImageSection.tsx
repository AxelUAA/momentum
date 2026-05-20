"use client";

import { useState, useRef } from "react";
import { Camera, ImagePlus, X, Loader2 } from "lucide-react";
import { uploadClientImage } from "@/app/actions/upload";
import { saveClientCoverImage, addClientGalleryImage, removeClientGalleryImage } from "@/app/actions/client-event";

interface Props {
  eventId: string;
  initialCover: string | null;
  initialGallery: string[];
  isEditable: boolean;
}

const MAX_GALLERY = 8;

export function ClientImageSection({ eventId, initialCover, initialGallery, isEditable }: Props) {
  const [cover, setCover] = useState<string | null>(initialCover);
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upload = await uploadClientImage(fd, eventId, "cover");
      if (!upload.success || !upload.url) { setError(upload.error ?? "Error al subir"); return; }
      const save = await saveClientCoverImage(eventId, upload.url);
      if (save.success) setCover(upload.url);
      else setError(save.error ?? "Error al guardar");
    } catch {
      setError("Error de red");
    } finally {
      setUploadingCover(false);
      if (coverRef.current) coverRef.current.value = "";
    }
  }

  async function handleRemoveCover() {
    const result = await saveClientCoverImage(eventId, "");
    if (result.success) setCover(null);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_GALLERY - gallery.length);
    if (!files.length) return;
    setUploadingGallery(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const upload = await uploadClientImage(fd, eventId, "gallery");
        if (upload.success && upload.url) {
          const save = await addClientGalleryImage(eventId, upload.url);
          if (save.success) setGallery((prev) => [...prev, upload.url!]);
          else setError(save.error ?? "Error al guardar");
        } else {
          setError(upload.error ?? "Error al subir");
        }
      }
    } catch {
      setError("Error de red");
    } finally {
      setUploadingGallery(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  async function handleRemoveGallery(url: string) {
    const result = await removeClientGalleryImage(eventId, url);
    if (result.success) setGallery((prev) => prev.filter((u) => u !== url));
  }

  const canAddGallery = isEditable && gallery.length < MAX_GALLERY;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <Camera className="h-4 w-4 text-[var(--color-champagne)]" />
        <div>
          <h2 className="text-base font-bold">Fotos de tu evento</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {!isEditable
              ? "Las fotos ya no pueden cambiarse mientras la invitación está activa."
              : `Portada + hasta ${MAX_GALLERY} fotos en galería`}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <p className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Cover */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Foto de portada
          </p>
          {cover ? (
            <div className="relative rounded-xl overflow-hidden border border-border group aspect-[16/7]">
              <img src={cover} alt="Portada" className="w-full h-full object-cover" />
              {isEditable && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                  <button
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => coverRef.current?.click()}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Cambiar
                  </button>
                </>
              )}
            </div>
          ) : isEditable ? (
            <div
              onClick={() => coverRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/5"
            >
              {uploadingCover ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-champagne)]" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
              )}
              <p className="text-sm font-semibold text-muted-foreground">
                {uploadingCover ? "Subiendo…" : "Subir foto de portada"}
              </p>
              <p className="text-xs text-muted-foreground/50">JPG, PNG o WebP · máx. 5 MB</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground/40 text-sm">
              Sin foto de portada
            </div>
          )}
          <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" />
        </div>

        {/* Gallery */}
        {(gallery.length > 0 || isEditable) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Galería ({gallery.length}/{MAX_GALLERY})
              </p>
              {canAddGallery && (
                <button
                  onClick={() => galleryRef.current?.click()}
                  disabled={uploadingGallery}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--color-champagne)] hover:underline disabled:opacity-50"
                >
                  {uploadingGallery ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                  {uploadingGallery ? "Subiendo…" : "Agregar foto"}
                </button>
              )}
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((url, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-border group aspect-square">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {isEditable && (
                      <button
                        onClick={() => handleRemoveGallery(url)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {canAddGallery && (
                  <div
                    onClick={() => galleryRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border aspect-square transition-colors hover:border-[var(--color-champagne)]"
                  >
                    {uploadingGallery ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[var(--color-champagne)]" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => galleryRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/5"
              >
                {uploadingGallery ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-champagne)]" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                )}
                <p className="text-sm font-semibold text-muted-foreground">
                  {uploadingGallery ? "Subiendo…" : "Agregar fotos a la galería"}
                </p>
              </div>
            )}
            <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryUpload} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
