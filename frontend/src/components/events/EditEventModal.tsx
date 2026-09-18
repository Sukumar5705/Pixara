import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Event, EventStatus } from "../../types/event";
import { useUpdateEvent } from "../../hooks/useEvents";
import { Button } from "../ui/Button";

const editEventSchema = z.object({
  title: z.string().min(1, "Event title is required").trim(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "published"]).optional(),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event }) => {
  const updateEventMutation = useUpdateEvent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description || "",
      status: event.status || "draft",
    },
  });

  useEffect(() => {
    if (isOpen && event) {
      reset({
        title: event.title,
        description: event.description || "",
        status: event.status || "draft",
      });
    }
  }, [isOpen, event, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (data: EditEventFormData) => {
    try {
      await updateEventMutation.mutateAsync({
        id: event._id,
        data: {
          title: data.title,
          description: data.description,
          status: data.status as EventStatus,
        },
      });
      onClose();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[520px] rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-all animate-fade-up">
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E8EE]">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#111B33]">Edit Event</h2>
            <p className="text-[13px] text-[#586982] mt-0.5">
              Update details for {event.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#8290A5] hover:bg-[#F1F4F9] hover:text-[#111B33] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {updateEventMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              {(updateEventMutation.error as Error)?.message || "Unable to update event."}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-[#111B33] mb-1.5">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12 ${errors.title ? "border-red-500" : "border-[#E4E8EE]"
                }`}
            />
            {errors.title && (
              <p className="mt-1 text-[12px] font-semibold text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#111B33] mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-xl border border-[#E4E8EE] bg-white p-3 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#111B33] mb-1.5">Status</label>
            <select
              {...register("status")}
              className="w-full h-[48px] rounded-xl border border-[#E4E8EE] bg-white px-4 text-[14px] font-medium text-[#111B33] outline-none transition-all focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#E4E8EE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] px-5 rounded-xl text-[14px] font-bold text-[#586982] hover:bg-[#F4F4F5] transition-colors"
            >
              Cancel
            </button>
            <div className="w-auto">
              <Button type="submit" isLoading={updateEventMutation.isPending} loadingText="Saving..."  >  Save Changes  </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
