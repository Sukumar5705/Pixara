import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Edit3,
  UserPlus,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useEvent, useDeleteEvent } from "../../hooks/useEvents";
import { useAuthStore } from "../../store/authStore";
import { EditEventModal } from "../../components/events/EditEventModal";
import { TeamAssignmentModal } from "../../components/events/TeamAssignmentModal";
import { DeleteEventDialog } from "../../components/events/DeleteEventDialog";
import { EventStatusBadge } from "../../components/events/EventStatusBadge";
import { PhotoWorkspace } from "../../components/photos/PhotoWorkspace";
import GalleryWorkspace from "../../components/gallery/GalleryWorkspace";
import type { User } from "../../types";

export const EventDetailPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const { data: event, isLoading, isError, refetch } = useEvent(eventId);
  const deleteEventMutation = useDeleteEvent();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 xl:p-8 space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-[#E4E8EE]" />
        <div className="h-10 w-2/3 rounded bg-[#E4E8EE]" />
        <div className="h-32 w-full rounded-2xl bg-[#E4E8EE]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-2xl bg-[#E4E8EE]" />
          <div className="h-48 rounded-2xl bg-[#E4E8EE]" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="p-6 xl:p-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E4E8EE] bg-white p-12 text-center shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-[18px] font-extrabold text-[#111B33]">Event not found</h2>
          <p className="mt-1 text-[14px] text-[#586982]">
            Unable to load this event. It may have been deleted or you may not have access.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[13.5px] font-bold text-[#111B33] hover:bg-[#F7F9FC]"
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
            <Link
              to="/app/events"
              className="flex items-center gap-2 rounded-xl bg-[#1769FF] px-4 py-2 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7]"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdDate = new Date(event.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const updatedDate = new Date(event.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const creatorName =
    typeof event.createdBy === "object" && event.createdBy !== null
      ? (event.createdBy as User).name
      : "Admin";

  const handleDelete = async () => {
    try {
      await deleteEventMutation.mutateAsync(event._id);
      setIsDeleteDialogOpen(false);
      navigate("/app/events");
    } catch {
      // Error handled in mutation hook
    }
  };

  return (
    <div className="p-6 xl:p-8">
      {/* ── Back Navigation ── */}
      <Link
        to="/app/events"
        className="inline-flex items-center gap-2 text-[13px] font-bold text-[#586982] hover:text-[#1769FF] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Back to Events</span>
      </Link>

      {/* ── Header Banner & Actions ── */}
      <div className="mb-8 rounded-2xl border border-[#E4E8EE] bg-white p-6 shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1769FF]">
                EVENT WORKSPACE
              </span>
              <EventStatusBadge status={event.status} variant="page" />
            </div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#111B33] sm:text-[30px]">
              {event.title}
            </h1>
            <p className="mt-1 text-[14.5px] text-[#586982] max-w-2xl">
              {event.description || "No description provided."}
            </p>
          </div>

          {/* Admin Mutation Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-3.5 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC] hover:border-[#D4D4D8] transition-all"
              >
                <Edit3 size={15} className="text-[#586982]" />
                <span>Edit Event</span>
              </button>

              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-3.5 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC] hover:border-[#D4D4D8] transition-all"
              >
                <UserPlus size={15} className="text-[#586982]" />
                <span>Manage Team</span>
              </button>

              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] font-bold text-red-600 hover:bg-red-100 transition-all"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Event Overview Details */}
        <div className="rounded-2xl border border-[#E4E8EE] bg-white p-6 shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
          <h2 className="text-[15px] font-extrabold text-[#111B33] pb-3 border-b border-[#E4E8EE]">
            Event Information
          </h2>

          <div className="mt-4 space-y-4 text-[13.5px]">
            <div>
              <p className="text-[11.5px] font-bold text-[#8290A5] uppercase tracking-wider">Title</p>
              <p className="font-bold text-[#111B33] mt-0.5">{event.title}</p>
            </div>

            <div>
              <p className="text-[11.5px] font-bold text-[#8290A5] uppercase tracking-wider">Created By</p>
              <p className="font-medium text-[#111B33] mt-0.5">{creatorName}</p>
            </div>

            <div>
              <p className="text-[11.5px] font-bold text-[#8290A5] uppercase tracking-wider">Created Date</p>
              <p className="font-medium text-[#111B33] mt-0.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#8290A5]" />
                {createdDate}
              </p>
            </div>

            <div>
              <p className="text-[11.5px] font-bold text-[#8290A5] uppercase tracking-wider">Last Updated</p>
              <p className="font-medium text-[#111B33] mt-0.5">{updatedDate}</p>
            </div>

            <div>
              <p className="text-[11.5px] font-bold text-[#8290A5] uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <EventStatusBadge status={event.status} variant="page" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Team Members */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E4E8EE] bg-white p-6 shadow-[0_2px_12px_rgba(17,27,51,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E8EE]">
              <h2 className="text-[15px] font-extrabold text-[#111B33]">Assigned Team</h2>
              <span className="text-[12.5px] font-bold text-[#1769FF]">
                {event.teamMembers?.length ?? 0} members
              </span>
            </div>

            {!event.teamMembers || event.teamMembers.length === 0 ? (
              <div className="my-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F9FC] text-[#8290A5] mb-2">
                  <Users size={20} />
                </div>
                <p className="text-[13.5px] font-bold text-[#111B33]">No team members assigned</p>
                <p className="text-[12.5px] text-[#586982]">
                  Assign photographers or editors to collaborate on this event.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.teamMembers.map((member: User | string) => {
                  const userObj = typeof member === "object" ? (member as User) : null;
                  const name = userObj ? userObj.name : "Team Member";
                  const email = userObj ? userObj.email : "";

                  return (
                    <div
                      key={userObj?._id || String(member)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E8EE] bg-[#FAFAFA]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1769FF]/10 text-[13px] font-bold text-[#1769FF]">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-bold text-[#111B33] truncate leading-tight">
                          {name}
                        </p>
                        {email && <p className="text-[11.5px] text-[#8290A5] truncate">{email}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="mt-6 pt-4 border-t border-[#E4E8EE] flex justify-end">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="flex items-center gap-1.5 text-[13px] font-bold text-[#1769FF] hover:text-[#0F5BE7]"
              >
                <UserPlus size={15} />
                <span>Manage Team Assignments</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Photo Workspace + Gallery Workspace ── */}
      <div className="space-y-6">
        <PhotoWorkspace eventId={eventId!} />
        {isAdmin && <GalleryWorkspace eventId={eventId!} />}
      </div>

      {/* ── Modals / Dialogs ── */}
      {isAdmin && (
        <>
          <EditEventModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            event={event}
          />
          <TeamAssignmentModal
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
            event={event}
          />
          <DeleteEventDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            event={event}
            isDeleting={deleteEventMutation.isPending}
          />
        </>
      )}
    </div>
  );
};

export default EventDetailPage;
