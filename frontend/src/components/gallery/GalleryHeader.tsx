import React from "react";
import { Camera, Images } from "lucide-react";

interface GalleryHeaderProps {
  title: string;
  description?: string;
  photoCount: number;
}

/**
 * Minimal editorial header for the public gallery.
 * Intentionally no admin nav, no sidebar, no user actions.
 */
const GalleryHeader: React.FC<GalleryHeaderProps> = ({ title, description, photoCount }) => {
  return (
    <div className="bg-white border-b border-[#E4E8EE]">
      {/* ── Brand strip ──────────────────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center gap-2 border-b border-[#F1F4F9]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769FF]">
          <Camera size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
          Photo<span className="text-[#1769FF]">Share</span>
        </span>
      </div>

      {/* ── Gallery identity ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-8 sm:py-10">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8290A5] mb-2">
          Private Collection
        </p>
        <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-[#111B33] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[14.5px] text-[#586982] leading-relaxed max-w-[560px]">
            {description}
          </p>
        )}

        {/* Photo count badge */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F1F4F9] px-3 py-1">
            <Images size={13} className="text-[#8290A5]" />
            <span className="text-[12.5px] font-bold text-[#586982]">
              {photoCount.toLocaleString()} {photoCount === 1 ? "photograph" : "photographs"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryHeader;
