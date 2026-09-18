import React from "react";
import { Images } from "lucide-react";
import type { GalleryPhoto } from "../../types/gallery";

interface GalleryGridProps {
  photos: GalleryPhoto[];
  onPhotoClick: (index: number) => void;
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="aspect-[4/3] rounded-xl bg-[#E4E8EE] overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

/**
 * Public-facing photo grid.
 * Columns: 2 (mobile) → 3 (md) → 4 (lg)
 * No admin controls. Photo is the card.
 */
const GalleryGrid: React.FC<GalleryGridProps> = ({ photos, onPhotoClick }) => {
  // ── Empty state ───────────────────────────────────────────────────────────
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E8EE] bg-white py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#8290A5] mb-4">
          <Images size={22} />
        </div>
        <p className="text-[14.5px] font-bold text-[#111B33]">No photographs yet</p>
        <p className="text-[13px] text-[#586982] mt-1.5 max-w-[280px]">
          The gallery is ready, but no photos are available right now. Check back soon.
        </p>
      </div>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {photos.map((photo, index) => (
        <button
          key={photo._id}
          type="button"
          onClick={() => onPhotoClick(index)}
          aria-label={`Open photo: ${photo.originalName}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] focus-visible:ring-offset-2"
        >
          <img
            src={photo.url}
            alt={photo.originalName}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          {/* Subtle hover veil — very light so photos stay dominant */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
        </button>
      ))}
    </div>
  );
};

export { SkeletonCard };
export default GalleryGrid;
