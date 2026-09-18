import React, { useEffect } from "react";
import { X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateEvent, useTeamMembers } from "../../hooks/useEvents";
import { Button } from "../ui/Button";
import type { User } from "../../types";

const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required").trim(),
  description: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamMembers();
  const [selectedTeam, setSelectedTeam] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedTeam([]);
    }
  }, [isOpen, reset]);

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

  const toggleMember = (memberId: string) => {
    setSelectedTeam((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      const createdEvent = await createEventMutation.mutateAsync({
        title: data.title,
        description: data.description,
        teamMembers: selectedTeam,
      });
      onClose();
      if (createdEvent && createdEvent._id) {
        navigate(`/app/events/${createdEvent._id}`);
      }
    } catch {
      // Error handled by mutation error state or interceptors
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[520px] rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-all animate-fade-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E8EE]">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#111B33]">Create Event</h2>
            <p className="text-[13px] text-[#586982] mt-0.5">
              Create a new photography event for your team.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 overflow-y-auto pr-1">
          {createEventMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              {(createEventMutation.error as Error)?.message || "Failed to create event. Please try again."}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-[#111B33] mb-1.5">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="e.g. Arjun & Priya Wedding"
              className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12 ${
                errors.title ? "border-red-500" : "border-[#E4E8EE]"
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
              placeholder="Brief details about this photography event..."
              className="w-full rounded-xl border border-[#E4E8EE] bg-white p-3 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-[#111B33]">Team Members</label>
              {selectedTeam.length > 0 && (
                <span className="text-[12px] font-semibold text-[#1769FF]">
                  {selectedTeam.length} selected
                </span>
              )}
            </div>

            {isLoadingTeam ? (
              <div className="p-4 text-center text-[13px] text-[#8290A5]">Loading team members...</div>
            ) : (teamMembers as User[]).length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E4E8EE] p-4 text-center text-[12.5px] text-[#8290A5]">
                No team members available.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-[#E4E8EE] p-2 bg-[#FAFAFA]">
                {(teamMembers as User[]).map((member: User) => {
                  const isSelected = selectedTeam.includes(member._id);
                  return (
                    <div
                      key={member._id}
                      onClick={() => toggleMember(member._id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-[#EEF2FF] border border-[#1769FF]/30" : "hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1769FF]/10 text-[12px] font-bold text-[#1769FF]">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#111B33] leading-none">{member.name}</p>
                          <p className="text-[11px] text-[#8290A5]">{member.email}</p>
                        </div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                          isSelected
                            ? "bg-[#1769FF] border-[#1769FF] text-white"
                            : "border-[#D4D4D8] bg-white"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E4E8EE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] px-5 rounded-xl text-[14px] font-bold text-[#586982] hover:bg-[#F4F4F5] transition-colors"
            >
              Cancel
            </button>
            <div className="w-36">
              <Button
                type="submit"
                isLoading={createEventMutation.isPending}
                loadingText="Creating..."
              >
                Create Event
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
