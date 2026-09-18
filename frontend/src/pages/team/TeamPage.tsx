import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  UserPlus,
  Mail,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../../api/events";
import { createUserByAdmin } from "../../api/auth";
import type { User } from "../../types";

// ─── Add Member Form ──────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface AddMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onSuccess }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await createUserByAdmin(data.name, data.email, data.password);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(
        error.response?.data?.message ?? "Failed to create team member. Please try again."
      );
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full h-11 rounded-xl border bg-white px-4 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-2 focus:ring-[#1769FF]/15 ${
      hasError ? "border-[#DC4C4C]" : "border-[#E4E8EE]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[440px] rounded-2xl bg-white shadow-[0_8px_40px_rgba(17,27,51,0.14)] animate-fade-up"
        role="dialog"
        aria-modal="true"
        aria-label="Add Team Member"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E8EE] px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus size={17} className="text-[#1769FF]" />
            <h2 className="text-[15px] font-extrabold text-[#111B33]">Add Team Member</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F7F9FC] text-[#8290A5]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#DC4C4C]/30 bg-[#DC4C4C]/8 p-3 text-[13px] font-medium text-[#DC4C4C]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12.5px] font-bold text-[#586982]">Full Name</label>
            <input
              {...register("name")}
              placeholder="Jane Doe"
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-[11.5px] text-[#DC4C4C]">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-bold text-[#586982]">Email Address</label>
            <input
              {...register("email")}
              type="email"
              placeholder="jane@example.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-[11.5px] text-[#DC4C4C]">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-bold text-[#586982]">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="Min. 6 characters"
                className={inputClass(!!errors.password)}
              />
              {errors.password && (
                <p className="mt-1 text-[11.5px] text-[#DC4C4C]">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-bold text-[#586982]">Confirm</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Repeat password"
                className={inputClass(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11.5px] text-[#DC4C4C]">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <p className="text-[12px] text-[#8290A5]">
            The new member will be created with the <strong>Team</strong> role and can be assigned to events.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#E4E8EE] bg-white text-[13.5px] font-bold text-[#586982] hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-[#1769FF] text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating…
                </>
              ) : (
                "Add Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Member Card ──────────────────────────────────────────────────────────────

const MemberCard: React.FC<{ member: User; eventCount?: number }> = ({ member, eventCount }) => {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E4E8EE] bg-white p-4 shadow-[0_2px_8px_rgba(17,27,51,0.04)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1769FF]/10 text-[14px] font-extrabold text-[#1769FF]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-extrabold text-[#111B33] truncate">{member.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Mail size={11} className="text-[#8290A5] shrink-0" />
          <p className="text-[12px] text-[#586982] truncate">{member.email}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1769FF]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1769FF]">
          <ShieldCheck size={10} />
          Team
        </span>
        {eventCount !== undefined && (
          <span className="text-[11px] text-[#8290A5]">
            {eventCount} {eventCount === 1 ? "event" : "events"}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#E4E8EE] bg-white p-4 animate-pulse">
    <div className="h-11 w-11 rounded-full bg-[#E4E8EE]" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded bg-[#E4E8EE]" />
      <div className="h-3 w-48 rounded bg-[#E4E8EE]" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TeamPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useQuery<User[]>({
    queryKey: ["team-members"],
    queryFn: () => eventsApi.getTeamMembers(),
  });

  return (
    <div className="p-6 xl:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#8290A5]">
            Admin
          </p>
          <h1 className="mt-0.5 text-[26px] font-extrabold tracking-tight text-[#111B33]">
            Team Members
          </h1>
          <p className="mt-1 text-[14px] text-[#586982]">
            Manage photographers and editors who collaborate on events.
          </p>
        </div>
        <button
          onClick={() => { setSuccessMsg(null); setIsModalOpen(true); }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1769FF] px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] transition-colors"
        >
          <UserPlus size={15} />
          Add Team Member
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#20A66A]/30 bg-[#EDFBF4] p-3.5 text-[13px] font-medium text-[#20A66A]">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E8EE] bg-white py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-500 mb-3">
            <AlertCircle size={22} />
          </div>
          <p className="text-[14px] font-bold text-[#111B33]">Unable to load team members</p>
          <p className="text-[12.5px] text-[#586982] mt-1 mb-4">
            Something went wrong while fetching the team list.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && members?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E8EE] bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#8290A5] mb-4">
            <Users size={22} />
          </div>
          <p className="text-[14.5px] font-bold text-[#111B33]">No team members yet</p>
          <p className="text-[13px] text-[#586982] mt-1 mb-5 max-w-[280px]">
            Add photographers and editors to collaborate on your events.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1769FF] px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] transition-colors"
          >
            <UserPlus size={15} />
            Add First Member
          </button>
        </div>
      )}

      {/* Member grid */}
      {!isLoading && !isError && members && members.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#586982]">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <MemberCard key={m._id} member={m} />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AddMemberModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccessMsg("Team member added successfully.")}
        />
      )}
    </div>
  );
};

export default TeamPage;
