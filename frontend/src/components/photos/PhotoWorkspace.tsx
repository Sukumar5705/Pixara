import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Images } from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { useEventPhotos } from "../../hooks/photos/useEventPhotos";
import { useUploadPhoto } from "../../hooks/photos/useUploadPhoto";
import { useDeletePhoto } from "../../hooks/photos/useDeletePhoto";
import { useTogglePhotoSelection } from "../../hooks/photos/useTogglePhotoSelection";

import { PhotoUploader } from "./PhotoUploader";
import { UploadQueue } from "./UploadQueue";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoLightbox } from "./PhotoLightbox";
import { DeletePhotoDialog } from "./DeletePhotoDialog";

import type { Photo, UploadItem } from "../../types/photo";

interface PhotoWorkspaceProps {
  eventId: string;
}

type ActiveFilter = "all" | "selected";

/**
 * Top-level Photo Workspace for an event.
 * Composes: stats bar → uploader → upload queue → filter tabs → photo grid → lightbox → delete dialog
 *
 * Server state (photo list) lives in React Query.
 * Upload queue state lives in local component state.
 */
export const PhotoWorkspace: React.FC<PhotoWorkspaceProps> = ({ eventId }) => {
  const { isAdmin, user } = useAuthStore();

  // ── Server state ────────────────────────────────────────────────────────
  const {
    data: photos,
    isLoading,
    isError,
    refetch,
  } = useEventPhotos(eventId);

  const { uploadFile } = useUploadPhoto();
  const deletePhotoMutation = useDeletePhoto(eventId);
  const toggleSelectMutation = useTogglePhotoSelection(eventId);

  // ── Local UI state ───────────────────────────────────────────────────────
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const totalPhotos = photos?.length ?? 0;
  const selectedCount = useMemo(
    () => photos?.filter((p) => p.isSelected).length ?? 0,
    [photos]
  );

  // ── Filtered photos shown in the grid ────────────────────────────────────
  const filteredPhotos = useMemo(() => {
    if (!photos) return [];
    if (activeFilter === "selected") return photos.filter((p) => p.isSelected);
    return photos;
  }, [photos, activeFilter]);

  // ── Upload handlers ───────────────────────────────────────────────────────

  const runUpload = useCallback(
    async (item: UploadItem) => {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "uploading", progress: 0 } : q
        )
      );

      try {
        await uploadFile({
          file: item.file,
          eventId,
          onProgress: (pct) => {
            setUploadQueue((prev) =>
              prev.map((q) =>
                q.id === item.id ? { ...q, progress: pct } : q
              )
            );
          },
        });

        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "complete", progress: 100 } : q
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please retry.";
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "failed", error: message } : q
          )
        );
      }
    },
    [eventId, uploadFile]
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending" as const,
        progress: 0,
        thumbnail: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);

      // Upload all files in parallel
      await Promise.allSettled(newItems.map((item) => runUpload(item)));
    },
    [runUpload]
  );

  const handleRetry = useCallback(
    (item: UploadItem) => {
      runUpload(item);
    },
    [runUpload]
  );

  const handleRemoveFromQueue = useCallback((id: string) => {
    setUploadQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.thumbnail) URL.revokeObjectURL(item.thumbnail);
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  // ── Delete handlers ───────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deletePhotoMutation.mutateAsync(deleteTarget._id);
      // Close lightbox if the deleted photo was open
      if (lightboxIndex !== null) {
        const remaining = filteredPhotos.filter(
          (p) => p._id !== deleteTarget._id
        );
        if (remaining.length === 0) {
          setLightboxIndex(null);
        } else if (lightboxIndex >= remaining.length) {
          setLightboxIndex(remaining.length - 1);
        }
      }
      setDeleteTarget(null);
    } catch {
      // Error is surfaced by the mutation; keep dialog open
    }
  };

  // ── Lightbox handlers ─────────────────────────────────────────────────────

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i > 0 ? i - 1 : i
    );
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < filteredPhotos.length - 1 ? i + 1 : i
    );
  }, [filteredPhotos.length]);

  // ── Cleanup object URLs on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      uploadQueue.forEach((item) => {
        if (item.thumbnail) URL.revokeObjectURL(item.thumbnail);
      });
    };
    // intentionally empty deps: cleanup only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
      {/* ── Header + Stats ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#E4E8EE]">
        <div className="flex items-center gap-2">
          <Images size={17} className="text-[#1769FF]" />
          <h2 className="text-[15px] font-extrabold text-[#111B33]">
            Photos
          </h2>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[20px] font-extrabold text-[#111B33] leading-none tabular-nums">
              {isLoading ? "—" : totalPhotos.toLocaleString()}
            </p>
            <p className="text-[10.5px] font-semibold text-[#8290A5] mt-0.5">
              {isAdmin ? "total photos" : "my photos"}
            </p>
          </div>

          {isAdmin && (
            <>
              <div className="h-8 w-px bg-[#E4E8EE]" />
              <div className="text-right">
                <p className="text-[20px] font-extrabold text-[#1769FF] leading-none tabular-nums">
                  {isLoading ? "—" : selectedCount.toLocaleString()}
                </p>
                <p className="text-[10.5px] font-semibold text-[#8290A5] mt-0.5">
                  selected
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* ── Uploader ─────────────────────────────────────────────────────── */}
        <PhotoUploader onFilesSelected={handleFilesSelected} />

        {/* ── Upload Queue ─────────────────────────────────────────────────── */}
        {uploadQueue.length > 0 && (
          <UploadQueue
            items={uploadQueue}
            onRetry={handleRetry}
            onRemove={handleRemoveFromQueue}
          />
        )}

        {/* ── Filter Tabs (Admin, when photos exist) ────────────────────────── */}
        {isAdmin && totalPhotos > 0 && (
          <div className="flex border-b border-[#E4E8EE]">
            {(["all", "selected"] as ActiveFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 pb-2.5 pt-0.5 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
                  activeFilter === tab
                    ? "border-[#1769FF] text-[#1769FF]"
                    : "border-transparent text-[#586982] hover:text-[#111B33]"
                }`}
              >
                {tab === "all"
                  ? `All Photos (${totalPhotos})`
                  : `Selected (${selectedCount})`}
              </button>
            ))}
          </div>
        )}

        {/* ── Photo Grid ───────────────────────────────────────────────────── */}
        <PhotoGrid
          photos={filteredPhotos}
          isLoading={isLoading}
          isError={isError}
          isAdmin={isAdmin}
          currentUserId={user?._id}
          onRefetch={refetch}
          onDeletePhoto={setDeleteTarget}
          onToggleSelect={(photo) => toggleSelectMutation.mutate(photo._id)}
          onPhotoClick={openLightbox}
        />
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && filteredPhotos.length > 0 && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      <DeletePhotoDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        photoName={deleteTarget?.originalName ?? ""}
        isDeleting={deletePhotoMutation.isPending}
      />
    </div>
  );
};
