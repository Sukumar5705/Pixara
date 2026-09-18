import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import type { Event } from "../../types/event";
import type { User } from "../../types";
import { useTeamMembers, useUpdateEventTeam } from "../../hooks/useEvents";
import { Button } from "../ui/Button";

interface TeamAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export const TeamAssignmentModal: React.FC<TeamAssignmentModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { data: availableTeam = [], isLoading: isLoadingTeam } = useTeamMembers();
  const updateTeamMutation = useUpdateEventTeam();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && event) {
      const currentIds = event.teamMembers
        ? event.teamMembers.map((m) => (typeof m === "string" ? m : m._id))
        : [];
      setSelectedIds(currentIds);
    }
  }, [isOpen, event]);

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

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      await updateTeamMutation.mutateAsync({
        id: event._id,
        teamMembers: selectedIds,
      });
      onClose();
    } catch {
      // Handled in mutation state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] rounded-[24px] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-all animate-fade-up max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E8EE]">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#111B33]">Manage Team</h2>
            <p className="text-[13px] text-[#586982] mt-0.5">
              Select the team members assigned to this event.
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

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#111B33]">Team Members</span>
          <span className="text-[12.5px] font-semibold text-[#1769FF]">
            Selected: {selectedIds.length} members
          </span>
        </div>

        <div className="my-4 flex-1 overflow-y-auto pr-1">
          {updateTeamMutation.isError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              {(updateTeamMutation.error as Error)?.message || "Unable to update team assignment."}
            </div>
          )}

          {isLoadingTeam ? (
            <div className="p-8 text-center text-[13px] text-[#8290A5]">Loading team members...</div>
          ) : (availableTeam as User[]).length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E4E8EE] p-6 text-center text-[13px] text-[#8290A5]">
              No team members available.
            </div>
          ) : (
            <div className="space-y-2">
              {(availableTeam as User[]).map((member: User) => {
                const isSelected = selectedIds.includes(member._id);
                return (
                  <div
                    key={member._id}
                    onClick={() => toggleUser(member._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1769FF]/40 bg-[#EEF2FF]"
                        : "border-[#E4E8EE] bg-white hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1769FF]/10 text-[13px] font-bold text-[#1769FF]">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-[#111B33] leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[11.5px] text-[#8290A5]">{member.email}</p>
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
              type="button"
              onClick={handleSave}
              isLoading={updateTeamMutation.isPending}
              loadingText="Saving..."
            >
              Save Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
