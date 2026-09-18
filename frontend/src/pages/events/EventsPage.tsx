import React, { useMemo, useState } from "react";
import { Plus, Search, CalendarDays, RefreshCw, AlertCircle } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useAuthStore } from "../../store/authStore";
import { EventCard } from "../../components/events/EventCard";
import { CreateEventModal } from "../../components/events/CreateEventModal";
import type { Event } from "../../types/event";

export const EventsPage: React.FC = () => {
  const { isAdmin } = useAuthStore();
  const { data: events = [], isLoading, isError, refetch } = useEvents();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    const eventList = (events as Event[]) || [];
    return eventList.filter((ev: Event) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || (ev.status && ev.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  return (
    <div className="p-6 xl:p-8">
      {/* ── Page Header ── */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#8290A5]">
            Event Management
          </p>
          <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-[#111B33] xl:text-[28px]">
            Your Events
          </h1>
          <p className="mt-1 text-[14px] text-[#586982]">
            Manage photography events and team assignments from one workspace.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1769FF] px-5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(23,105,255,0.30)] transition-all hover:bg-[#0F5BE7] hover:-translate-y-px active:translate-y-0 shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or description..."
            className="h-[44px] w-full rounded-xl border border-[#E4E8EE] bg-white pl-10 pr-4 text-[14px] font-medium text-[#111B33] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/12"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#586982] hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[44px] rounded-xl border border-[#E4E8EE] bg-white px-3.5 text-[13.5px] font-semibold text-[#111B33] outline-none focus:border-[#1769FF]"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* ── State Handling: Loading ── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-[#E4E8EE] bg-white p-5 shadow-[0_2px_12px_rgba(17,27,51,0.04)] animate-pulse"
            >
              <div className="h-28 w-full rounded-xl bg-[#F4F4F5]" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[#F4F4F5]" />
                <div className="h-3 w-1/2 rounded bg-[#F4F4F5]" />
              </div>
              <div className="mt-6 h-8 w-full rounded-lg bg-[#F4F4F5]" />
            </div>
          ))}
        </div>
      )}

      {/* ── State Handling: Error ── */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E4E8EE] bg-white p-12 text-center shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-[18px] font-extrabold text-[#111B33]">Unable to load events</h2>
          <p className="mt-1 text-[14px] text-[#586982]">
            Unable to load events. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-5 flex items-center gap-2 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2.5 text-[13.5px] font-bold text-[#111B33] hover:bg-[#F7F9FC] transition-colors"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* ── State Handling: Empty ── */}
      {!isLoading && !isError && filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E8EE] bg-white p-12 sm:p-16 text-center shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#1769FF] mb-4">
            <CalendarDays size={28} />
          </div>

          {(events as Event[]).length === 0 ? (
            <>
              <h2 className="text-[18px] font-extrabold text-[#111B33]">
                {isAdmin ? "No events yet" : "No events assigned"}
              </h2>
              <p className="mt-1 text-[14px] text-[#586982] max-w-sm">
                {isAdmin
                  ? "Create your first photography event to get started."
                  : "You currently don't have any events assigned to your account."}
              </p>

              {isAdmin && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-6 flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1769FF] px-5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(23,105,255,0.30)] hover:bg-[#0F5BE7] transition-all"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Create Event</span>
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-[18px] font-extrabold text-[#111B33]">No matching events</h2>
              <p className="mt-1 text-[14px] text-[#586982]">
                No events matched your search query or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-5 text-[13.5px] font-bold text-[#1769FF] hover:underline"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Event Grid ── */}
      {!isLoading && !isError && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((ev: Event) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}

      {/* ── Create Event Modal ── */}
      {isAdmin && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EventsPage;
