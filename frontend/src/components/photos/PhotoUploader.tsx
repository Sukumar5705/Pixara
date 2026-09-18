import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, FolderOpen } from "lucide-react";

interface PhotoUploaderProps {
  /** Called with validated File objects when the user selects or drops files */
  onFilesSelected: (files: File[]) => void;
}

// ── Validation ────────────────────────────────────────────────────────────────

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const isAcceptedImage = (file: File): boolean => {
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif|tiff?|gif|bmp|avif)$/i.test(file.name)
  );
};

const validateFiles = (
  rawFiles: FileList | null
): { valid: File[]; rejectedCount: number } => {
  if (!rawFiles) return { valid: [], rejectedCount: 0 };

  let rejectedCount = 0;
  const valid: File[] = [];

  Array.from(rawFiles).forEach((file) => {
    if (!isAcceptedImage(file)) {
      rejectedCount++;
      return;
    }
    if (file.size > MAX_BYTES) {
      rejectedCount++;
      return;
    }
    valid.push(file);
  });

  return { valid, rejectedCount };
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Compact drag-and-drop upload zone.
 * Validates file type (images only) and size (≤ 50 MB).
 * Does NOT handle the upload itself — delegates to onFilesSelected.
 */
export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onFilesSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFiles = useCallback(
    (rawFiles: FileList | null) => {
      const { valid, rejectedCount } = validateFiles(rawFiles);

      if (rejectedCount > 0) {
        setWarning(
          `${rejectedCount} file${rejectedCount > 1 ? "s" : ""} skipped — only images under 50 MB are accepted.`
        );
        setTimeout(() => setWarning(null), 5000);
      } else {
        setWarning(null);
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [onFilesSelected]
  );

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── File input ────────────────────────────────────────────────────────────
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        role="region"
        aria-label="Photo upload area"
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border py-6 px-4 text-center transition-all duration-150 ${
          isDragging
            ? "border-[#1769FF] bg-[#EEF4FF]"
            : "border-dashed border-[#D1D9E6] bg-[#FAFAFA] hover:border-[#AABBCC] hover:bg-white"
        }`}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="sr-only"
          onChange={onInputChange}
          id="photo-upload-input"
          aria-label="Choose photos to upload"
        />

        {/* Icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            isDragging ? "bg-[#1769FF]/10 text-[#1769FF]" : "bg-[#E4E8EE] text-[#8290A5]"
          }`}
        >
          <UploadCloud size={20} />
        </div>

        {/* Copy */}
        <div>
          <p className="text-[13.5px] font-bold text-[#111B33]">
            {isDragging ? "Drop photos here" : "Drag & drop photos here"}
          </p>
          <p className="text-[12px] text-[#8290A5] mt-0.5">or</p>
        </div>

        {/* Browse button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[12.5px] font-bold text-[#111B33] hover:bg-[#F7F9FC] hover:border-[#D1D9E6] transition-all shadow-[0_1px_4px_rgba(17,27,51,0.06)]"
        >
          <FolderOpen size={14} className="text-[#586982]" />
          Browse files
        </button>

        {/* Format hint */}
        <p className="text-[11px] text-[#8290A5]">
          JPEG · PNG · WebP · HEIC &nbsp;·&nbsp; Max 50 MB per file
        </p>
      </div>

      {/* Validation warning */}
      {warning && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700 font-semibold">
          ⚠️ {warning}
        </p>
      )}
    </div>
  );
};
