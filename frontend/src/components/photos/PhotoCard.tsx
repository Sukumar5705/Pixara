import React, { useState } from "react";
import { Trash2, Check } from "lucide-react";
import type { Photo } from "../../types/photo";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isAdmin: boolean;
  currentUserId?: string;
  onDelete: (photo: Photo) => void;
  onToggleSelect: (photo: Photo) => void;
  onClick: (index: number) => void;
}

/**
 * Individual photo card in the event workspace grid.
 *
 * Visual priority:
 *  1. Photograph (full card, object-cover)
 *  2. Selection state — blue ring (admin only)
 *  3. Actions — appear on hover
 *  4. Filename — subtle bottom overlay
 *
 * Admin:   can select/deselect, can delete any photo
 * Team:    can only delete their own photos, no selection
 */
export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  index,
  isAdmin,
  currentUserId,
  onDelete,
  onToggleSelect,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const uploaderObj =
    typeof photo.uploadedBy === "object" ? photo.uploadedBy : null;
  const uploaderName = uploaderObj?.name ?? null;
  const isOwner = uploaderObj?._id === currentUserId;
  const canDelete = isAdmin || isOwner;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open lightbox if clicking a control
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-action]")
    ) {
      return;
    }
    onClick(index);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Photo: ${photo.originalName}`}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(index); }}
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[13px] bg-[#E4E8EE] transition-all duration-150 ${
        photo.isSelected
          ? "ring-2 ring-[#1769FF] ring-offset-1"
          : "ring-0"
      }`}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      {imgError ? (
        <div className="flex h-full w-full items-center justify-center bg-[#F1F4F9]">
          <span className="text-[11px] text-[#8290A5] font-medium text-center px-2">
            {photo.originalName}
          </span>
        </div>
      ) : (
        <img
          src={photo.url}
          alt={photo.originalName}
          loading={index < 8 ? "eager" : "lazy"}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          draggable={false}
        />
      )}

      {/* ── Admin: Selection checkbox (top-left) ────────── */}
      {isAdmin && (
        <button
          data-action="select"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(photo);
          }}
          aria-label={photo.isSelected ? "Deselect photo" : "Select photo"}
          className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all duration-150 ${
            photo.isSelected
              ? "border-[#1769FF] bg-[#1769FF] opacity-100"
              : "border-white/70 bg-black/20 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          }`}
        >
          {photo.isSelected && <Check size={13} strokeWidth={3} className="text-white" />}
        </button>
      )}

      {/* ── Selected badge (always visible when selected) ── */}
      {photo.isSelected && (
        <div className="absolute top-2 right-2 z-10 rounded-md bg-[#1769FF] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          ✓
        </div>
      )}

      {/* ── Hover overlay with filename + delete ─────────── */}
      <div className="absolute inset-0 z-[5] flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex items-end justify-between p-2.5 gap-2">
          {/* Filename + uploader */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold text-white leading-tight">
              {photo.originalName}
            </p>
            {uploaderName && isAdmin && (
              <p className="text-[10px] text-white/60 truncate mt-0.5">
                {uploaderName}
              </p>
            )}
          </div>

          {/* Delete button */}
          {canDelete && (
            <button
              data-action="delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo);
              }}
              aria-label={`Delete ${photo.originalName}`}
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
