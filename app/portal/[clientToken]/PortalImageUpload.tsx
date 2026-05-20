"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, Camera } from "lucide-react";
import { uploadPortalImage } from "@/app/actions/upload";
import { savePortalCoverImage, addPortalGalleryImage, removePortalGalleryImage } from "@/app/actions/portal";

interface Props {
  clientToken: string;
  initialCover: string | null;
  initialGallery: string[];
}

const MAX_GALLERY = 5;

export function PortalImageUpload({ clientToken, initialCover, initialGallery }: Props) {
  const [cover, setCover] = useState<string | null>(initialCover);
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const totalImages = (cover ? 1 : 0) + gallery.length;
  const canAddMore = gallery.length < MAX_GALLERY;

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadPortalImage(fd, clientToken, "cover");
      if (result.success && result.url) {
        const saveResult = await savePortalCoverImage(clientToken, result.url);
        if (saveResult.success) {
          setCover(result.url);
        } else {
          setError(saveResult.error ?? "Error al guardar");
        }
      } else {
        setError(result.error ?? "Error al subir");
      }
    } catch {
      setError("Error de red");
    } finally {
      setUploadingCover(false);
      if (coverRef.current) coverRef.current.value = "";
    }
  }

  async function handleRemoveCover() {
    const result = await savePortalCoverImage(clientToken, "");
    if (result.success) setCover(null);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_GALLERY - gallery.length);
    if (files.length === 0) return;
    setUploadingGallery(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadPortalImage(fd, clientToken, "gallery");
        if (result.success && result.url) {
          const saveResult = await addPortalGalleryImage(clientToken, result.url);
          if (saveResult.success) {
            setGallery((prev) => [...prev, result.url!]);
          }
        } else {
          setError(result.error ?? "Error al subir imagen");
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
    const result = await removePortalGalleryImage(clientToken, url);
    if (result.success) setGallery((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Camera className="h-5 w-5 text-[var(--color-champagne)]" />
        <div>
          <h2 className="text-base font-bold text-[var(--color-midnight)]">Fotos de tu evento</h2>
          <p className="text-xs text-[var(--color-midnight)]/50">
            {totalImages === 0
              ? "Sube hasta 5 fotos para tu invitación"
              : `${totalImages} foto${totalImages !== 1 ? "s" : ""} subida${totalImages !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2 text-xs text-red-600">{error}</p>
      )}

      {/* Cover image */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/40">
          Foto de portada
        </p>
        {cover ? (
          <div className="relative rounded-xl overflow-hidden border border-black/8 group">
            <img src={cover} alt="Portada" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <button
              onClick={handleRemoveCover}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => coverRef.current?.click()}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--color-midnight)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Cambiar
            </button>
          </div>
        ) : (
          <div
            onClick={() => coverRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 p-8 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/5"
          >
            {uploadingCover ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-champagne)]" />
            ) : (
              <ImagePlus className="h-6 w-6 text-[var(--color-midnight)]/30" />
            )}
            <p className="text-sm font-semibold text-[var(--color-midnight)]/50">
              {uploadingCover ? "Subiendo..." : "Subir foto de portada"}
            </p>
            <p className="text-xs text-[var(--color-midnight)]/30">JPG, PNG o WebP · máx. 5 MB</p>
          </div>
        )}
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" />
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-midnight)]/40">
            Galería ({gallery.length}/{MAX_GALLERY})
          </p>
          {canAddMore && (
            <button
              onClick={() => galleryRef.current?.click()}
              disabled={uploadingGallery}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-champagne)] hover:underline disabled:opacity-50"
            >
              {uploadingGallery ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
              {uploadingGallery ? "Subiendo..." : "Agregar"}
            </button>
          )}
        </div>

        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((url, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-black/8 group aspect-square">
                <img src={url} alt={`Galería ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveGallery(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {canAddMore && (
              <div
                onClick={() => galleryRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/10 aspect-square transition-colors hover:border-[var(--color-champagne)]"
              >
                {uploadingGallery ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--color-champagne)]" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-[var(--color-midnight)]/30" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => galleryRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 p-6 text-center transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/5"
          >
            {uploadingGallery ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-champagne)]" />
            ) : (
              <ImagePlus className="h-6 w-6 text-[var(--color-midnight)]/30" />
            )}
            <p className="text-sm font-semibold text-[var(--color-midnight)]/50">
              {uploadingGallery ? "Subiendo..." : "Agregar fotos a la galería"}
            </p>
            <p className="text-xs text-[var(--color-midnight)]/30">Puedes subir hasta {MAX_GALLERY} fotos</p>
          </div>
        )}
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
