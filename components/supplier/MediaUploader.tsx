"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

export type UploadedImage = {
  url: string;
  name: string;
};

type GalleryPreview = {
  id: string;
  url: string;
  fileName: string;
};

type MediaUploaderProps = {
  minGallery?: number;
  maxGallery?: number;
  hero: UploadedImage | null;
  gallery: UploadedImage[];
  onHeroChange: (image: UploadedImage | null) => void;
  onGalleryChange: (images: UploadedImage[]) => void;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB soft limit (keep <= server)

export function MediaUploader({
  minGallery = 7,
  maxGallery = 20,
  hero,
  gallery,
  onHeroChange,
  onGalleryChange
}: MediaUploaderProps) {
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [heroFileName, setHeroFileName] = useState<string | null>(hero?.name ?? null);
  const [heroLocalUrl, setHeroLocalUrl] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<GalleryPreview[]>([]);
  const [pendingGalleryUploads, setPendingGalleryUploads] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const galleryPreviewRefs = useRef<string[]>([]);
  const galleryMessage = useMemo(() => {
    const previewCount = galleryPreviews.length;
    if (previewCount) {
      return `Subiendo ${previewCount} imagen${previewCount === 1 ? "" : "es"}...`;
    }
    if (gallery.length) {
      return `Galería lista (${gallery.length} foto${gallery.length === 1 ? "" : "s"})`;
    }
    return "Sin fotos seleccionadas";
  }, [gallery.length, galleryPreviews.length]);
  const isUploading = uploadingCount > 0;
  useEffect(() => {
    return () => {
      galleryPreviewRefs.current.forEach((url) => URL.revokeObjectURL(url));
      galleryPreviewRefs.current = [];
    };
  }, []);

  const registerGalleryPreview = (preview: GalleryPreview) => {
    galleryPreviewRefs.current.push(preview.url);
    setGalleryPreviews((prev) => [...prev, preview]);
  };

  const releaseGalleryPreviewUrl = (url: string) => {
    galleryPreviewRefs.current = galleryPreviewRefs.current.filter((value) => value !== url);
    URL.revokeObjectURL(url);
  };

  const removeGalleryPreview = (id: string) => {
    setGalleryPreviews((prev) => {
      const next = prev.filter((preview) => preview.id !== id);
      const removed = prev.find((preview) => preview.id === id);
      if (removed) {
        releaseGalleryPreviewUrl(removed.url);
      }
      return next;
    });
  };
  useEffect(() => {
    setHeroFileName(hero?.name ?? null);
  }, [hero?.name]);

  useEffect(() => {
    const previews = galleryPreviews;
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviews]);

  useEffect(() => {
    if (!heroLocalUrl) return () => undefined;
    return () => {
      URL.revokeObjectURL(heroLocalUrl);
    };
  }, [heroLocalUrl]);

  useEffect(() => {
    if (pendingGalleryUploads === 0 && galleryPreviews.length > 0) {
      setGalleryPreviews([]);
    }
  }, [pendingGalleryUploads, galleryPreviews.length]);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`El archivo "${file.name}" excede el límite de ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploadingCount((prev) => prev + 1);
    setError(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.error("API Upload Error", res.status, errorText);
        setError(`Error (${res.status}): No se pudo subir la imagen.`);
        return null;
      }
      const data = await res.json();
      const returnedUrl =
        (data.url as string | undefined) ??
        (data.fileId ? `/api/uploaded/${encodeURIComponent(data.fileId)}` : undefined) ??
        (data.path ? `/${data.path}` : undefined);
      if (!returnedUrl) {
        setError("La API no devolvió la URL de la imagen.");
        return null;
      }
      setLastUploadedUrl(returnedUrl);
      console.debug("MediaUploader returnedUrl", returnedUrl);
      return returnedUrl;
    } catch (err) {
      console.error("Fetch upload error", err);
      setError("Error subiendo la imagen. Verifica tu conexión.");
      return null;
    } finally {
      setUploadingCount((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleHero = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const localPreview = URL.createObjectURL(file);
    setHeroLocalUrl(localPreview);
    setHeroFileName(file.name);
    const url = await uploadFile(file);
    if (url) {
      onHeroChange({ url, name: file.name });
      setHeroLocalUrl((prev) => (prev === localPreview ? null : prev));
    }
    event.target.value = "";
  };

  const handleGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    setError(null);
    const slotsTaken = gallery.length + galleryPreviews.length;
    const availableSlots = Math.max(maxGallery - slotsTaken, 0);
    if (availableSlots === 0) {
      setError(`Ya tienes ${maxGallery} imágenes; elimina alguna para subir otra.`);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
      return;
    }
    const toUpload = Array.from(files).slice(0, availableSlots);
    const items = toUpload.map((file) => {
      const preview: GalleryPreview = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        fileName: file.name
      };
      registerGalleryPreview(preview);
      return { file, preview };
    });
    setPendingGalleryUploads((prev) => prev + items.length);
    const next = [...gallery];
    for (const { file, preview } of items) {
      const url = await uploadFile(file);
      if (url) {
        next.push({ url, name: file.name });
      }
      removeGalleryPreview(preview.id);
      setPendingGalleryUploads((prev) => Math.max(prev - 1, 0));
    }
    if (next.length !== gallery.length) {
      onGalleryChange(next);
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeGalleryItem = (url: string) => {
    onGalleryChange(gallery.filter((item) => item.url !== url));
  };

  const meetsMinimum = gallery.length >= minGallery;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hero image</p>
      <div className="mt-2 flex flex-col gap-2">
        <label
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 20h14a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm0-8V6a1 1 0 011-1h3l2-2h4l2 2h3a1 1 0 011 1v6h-2V7h-5.586l-2-2H10.586l-2 2H3v5h2z" />
            </svg>
            Subir imagen principal
            <input type="file" accept="image/*" onChange={handleHero} className="hidden" />
          </label>
        <p className="text-xs text-slate-500">
          {heroLocalUrl
            ? `Cargando ${heroFileName ?? "imagen"}...`
            : heroFileName
            ? `Archivo listo: ${heroFileName}`
            : "Sin archivo seleccionado"}
        </p>
        {lastUploadedUrl && (
          <p className="text-[0.6rem] text-slate-500">
            URL activa: <span className="font-semibold">{lastUploadedUrl}</span>
          </p>
        )}
      </div>
    </div>

      <div>
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Galería (min {minGallery}, max {maxGallery})
            </p>
            <span className="text-[0.65rem] text-slate-500">
              {gallery.length} foto{gallery.length === 1 ? "" : "s"} agregada{gallery.length === 1 ? "" : "s"}
            </span>
          </div>
          <label
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 5h14a1 1 0 001-1V3a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm0 4h14a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm0 4h8a1 1 0 001-1v-1h4v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-7a1 1 0 011-1z" />
            </svg>
            Subir fotos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGallery}
              ref={galleryInputRef}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500">{galleryMessage}</p>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          {isUploading && <p className="text-xs text-slate-500">Subiendo...</p>}
          {gallery.length >= maxGallery && (
            <p className="text-xs text-slate-500">
              Ya alcanzaste el límite de {maxGallery} imágenes. Quita alguna para subir otra.
            </p>
          )}
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          {galleryPreviews.map((preview) => (
            <p key={`preview-${preview.id}`} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
              <span>{preview.fileName}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-600">Subiendo</span>
            </p>
          ))}
          {gallery.map((item) => (
            <div key={item.url} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-slate-600">
              <span>{item.name}</span>
              <button
                type="button"
                aria-label={`Eliminar ${item.name}`}
                onClick={() => removeGalleryItem(item.url)}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-rose-600 hover:text-rose-900"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        {!meetsMinimum && (
          <p className="mt-1 text-[0.7rem] text-amber-600">
            Agrega al menos {minGallery} imágenes para que el tour pueda publicarse.
          </p>
        )}
      </div>
    </div>
  );
}
