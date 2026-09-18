import React from "react";
import { AlertCircle, RefreshCw, Images } from "lucide-react";
import { PhotoCard } from "./PhotoCard";
import type { Photo } from "../../types/photo";

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  isError: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onRefetch: () => void;
  onDeletePhoto: (photo: Photo) => void;
  onToggleSelect: (photo: Photo) => void;
  onPhotoClick: (index: number) => void;
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="aspect-square rounded-[13px] bg-[#E4E8EE] overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

/**
 * Responsive photo grid.
 * Columns: 2 (mobile) → 3 (sm) → 4 (lg) → 5 (xl)
 * Handles loading, error, and empty states.
 */
export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isLoading,
  isError,
  isAdmin,
  currentUserId,
  onRefetch,
  onDeletePhoto,
  onToggleSelect,
  onPhotoClick,
}) => {
  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E8EE] bg-[#FAFAFA] py-14 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-500 mb-3">
          <AlertCircle size={22} />
        </div>
        <p className="text-[14px] font-bold text-[#111B33]">
          Unable to load photos
        </p>
        <p className="text-[12.5px] text-[#586982] mt-1 mb-4">
          Something went wrong while fetching this event's photos.
        </p>
        <button
          onClick={onRefetch}
          className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC] transition-colors"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E8EE] bg-[#FAFAFA] py-14 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#8290A5] mb-3">
          <Images size={22} />
        </div>
        <p className="text-[14px] font-bold text-[#111B33]">
          No photos yet
        </p>
        <p className="text-[12.5px] text-[#586982] mt-1 max-w-[280px]">
          {isAdmin
            ? "Upload or wait for team members to add photos to this event."
            : "Start by uploading the event photographs using the area above."}
        </p>
      </div>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo._id}
          photo={photo}
          index={index}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onDelete={onDeletePhoto}
          onToggleSelect={onToggleSelect}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  );
};
