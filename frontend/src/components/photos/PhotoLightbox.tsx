import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "../../types/photo";

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Full-screen lightbox for viewing photos.
 * - Keyboard: Escape → close, ← → navigate
 * - Click backdrop → close
 * Rendered via a portal so it sits above all z-index layers.
 */
export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrev) onPrev();
          break;
        case "ArrowRight":
          if (hasNext) onNext();
          break;
      }
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  const uploaderName =
    typeof photo.uploadedBy === "object" ? photo.uploadedBy.name : null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo: ${photo.originalName}`}
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/40 px-4 py-1.5 text-[12px] font-bold text-white/80 backdrop-blur-sm">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Image */}
      <div className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[85vh]">
        <img
          key={photo._id}
          src={photo.url}
          alt={photo.originalName}
          className="max-h-[78vh] max-w-[88vw] w-auto h-auto object-contain rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          draggable={false}
        />

        {/* Caption bar */}
        <div className="mt-3 flex items-center gap-4">
          <p className="text-[13px] font-semibold text-white/80 truncate max-w-[60vw]">
            {photo.originalName}
          </p>
          {uploaderName && (
            <p className="text-[12px] text-white/50 shrink-0">
              by {uploaderName}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
