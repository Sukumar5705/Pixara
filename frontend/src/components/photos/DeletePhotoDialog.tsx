import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface DeletePhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  photoName: string;
  isDeleting: boolean;
}

/**
 * Confirmation dialog for photo deletion.
 * Follows the same pattern as DeleteEventDialog.
 * No window.confirm() — uses a proper modal.
 */
export const DeletePhotoDialog: React.FC<DeletePhotoDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  photoName,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        onClick={() => { if (!isDeleting) onClose(); }}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] animate-fade-up">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-[19px] font-extrabold text-[#111B33]">
          Delete photo?
        </h3>
        <p className="mt-2 text-[13.5px] text-[#586982] leading-relaxed">
          <span className="font-bold text-[#111B33]">
            "{photoName}"
          </span>{" "}
          will be permanently removed from this event. This cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-[42px] px-5 rounded-xl text-[13.5px] font-bold text-[#586982] hover:bg-[#F4F4F5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex h-[42px] items-center gap-2 rounded-xl bg-red-600 px-5 text-[13.5px] font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Deleting…</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
