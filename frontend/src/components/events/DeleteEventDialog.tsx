import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import type { Event } from "../../types/event";

interface DeleteEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: Event;
  isDeleting: boolean;
}

export const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
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
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-all animate-fade-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-[20px] font-extrabold text-[#111B33]">Delete Event?</h3>
        <p className="mt-2 text-[14px] text-[#586982] leading-relaxed">
          Are you sure you want to delete <strong className="text-[#111B33]">"{event.title}"</strong>? This action cannot be undone and will permanently delete event details.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-[44px] px-5 rounded-xl text-[14px] font-bold text-[#586982] hover:bg-[#F4F4F5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex h-[44px] items-center justify-center rounded-xl bg-red-600 px-5 text-[14px] font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>
    </div>
  );
};
