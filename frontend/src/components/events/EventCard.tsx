import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Calendar } from "lucide-react";
import type { Event } from "../../types/event";
import { EventStatusBadge } from "./EventStatusBadge";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(event.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const teamCount = event.teamMembers?.length ?? 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#E4E8EE] bg-white p-5 shadow-[0_2px_12px_rgba(17,27,51,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(17,27,51,0.08)]">
      {/* Top Banner Placeholder with subtle brand gradient */}
      <div className="relative mb-4 h-28 w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0F2D53] via-[#1769FF]/90 to-[#3B82F6]">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

        {/* Status Badge in top-right */}
        <div className="absolute top-3 right-3 z-10">
          <EventStatusBadge status={event.status} variant="card" />
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-[16px] font-extrabold text-white truncate drop-shadow-sm">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="flex-1">
        {event.description ? (
          <p className="line-clamp-2 text-[13px] text-[#586982] mb-3">
            {event.description}
          </p>
        ) : (
          <p className="text-[13px] italic text-[#8290A5] mb-3">No description provided</p>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-[#F1F4F9] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px] text-[#8290A5]">
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-[#586982]" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} className="text-[#586982]" />
            {teamCount} {teamCount === 1 ? "member" : "members"}
          </span>
        </div>

        <button
          onClick={() => navigate(`/app/events/${event._id}`)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#1769FF] transition-colors hover:text-[#0F5BE7]"
        >
          <span>Open Event</span>
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
