import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  ExternalLink,
  Copy,
  Check,
  Globe,
  AlertCircle,
  PowerOff,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../../api/events";
import { galleriesApi } from "../../api/galleries";
import type { Event } from "../../types/event";
import type { GalleryCredentials } from "../../api/galleries";

// ─── Per-event gallery card ───────────────────────────────────────────────────

interface GalleryCardProps {
  event: Event;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ event }) => {
  const [copied, setCopied] = useState(false);

  const {
    data: gallery,
    isLoading,
    isError,
    error,
  } = useQuery<GalleryCredentials>({
    queryKey: ["gallery-credentials", event._id],
    queryFn: () => galleriesApi.getGalleryCredentials(event._id),
    retry: false, // 404 = not published — don't retry
  });

  const httpStatus = (error as { response?: { status?: number } })?.response?.status;
  const notPublished = isError && httpStatus === 404;

  const handleCopy = () => {
    if (!gallery?.url) return;
    navigator.clipboard.writeText(gallery.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const publishedDate = gallery?.publishedAt
    ? new Date(gallery.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_8px_rgba(17,27,51,0.04)] overflow-hidden">
      {/* Color band */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1769FF] to-[#0F2D53]" />

      <div className="p-5">
        {/* Event info */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <Link
              to={`/app/events/${event._id}`}
              className="text-[14.5px] font-extrabold text-[#111B33] hover:text-[#1769FF] transition-colors truncate block"
            >
              {event.title}
            </Link>
            {event.description && (
              <p className="text-[12px] text-[#8290A5] mt-0.5 truncate">{event.description}</p>
            )}
          </div>
          {/* Status badge */}
          {isLoading && (
            <div className="h-5 w-16 rounded-full bg-[#E4E8EE] animate-pulse shrink-0" />
          )}
          {gallery && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                gallery.isActive
                  ? "bg-[#EDFBF4] text-[#20A66A]"
                  : "bg-[#FEF9EC] text-amber-700"
              }`}
            >
              {gallery.isActive ? (
                <>
                  <Globe size={10} /> Live
                </>
              ) : (
                <>
                  <PowerOff size={10} /> Inactive
                </>
              )}
            </span>
          )}
          {notPublished && (
            <span className="inline-flex items-center rounded-full bg-[#F1F4F9] px-2.5 py-0.5 text-[11px] font-bold text-[#8290A5] shrink-0">
              Not published
            </span>
          )}
        </div>

        {/* Gallery details */}
        {gallery && (
          <div className="space-y-2.5">
            {publishedDate && (
              <p className="text-[12px] text-[#8290A5]">Published {publishedDate}</p>
            )}

            {/* URL row */}
            <div className="flex items-center gap-2 rounded-xl bg-[#F7F9FC] border border-[#E4E8EE] px-3 py-2">
              <p className="flex-1 text-[12px] text-[#586982] truncate font-mono">
                {gallery.url}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={gallery.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open gallery"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#586982] hover:text-[#1769FF] hover:bg-white transition-colors"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={handleCopy}
                  aria-label="Copy gallery link"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    copied
                      ? "text-[#20A66A]"
                      : "text-[#586982] hover:text-[#1769FF] hover:bg-white"
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not published */}
        {notPublished && (
          <p className="text-[12.5px] text-[#8290A5]">
            No gallery has been published for this event yet.
          </p>
        )}

        {/* Error (non-404) */}
        {isError && !notPublished && (
          <p className="text-[12.5px] text-[#DC4C4C]">Could not load gallery status.</p>
        )}

        {/* Footer link */}
        <div className="mt-4 pt-3 border-t border-[#F1F4F9]">
          <Link
            to={`/app/events/${event._id}`}
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#1769FF] hover:text-[#0F5BE7] transition-colors"
          >
            Manage event <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-[#E4E8EE] bg-white overflow-hidden animate-pulse">
    <div className="h-1.5 bg-[#E4E8EE]" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-40 rounded bg-[#E4E8EE]" />
      <div className="h-3 w-28 rounded bg-[#E4E8EE]" />
      <div className="h-9 w-full rounded-xl bg-[#E4E8EE]" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const GalleriesPage: React.FC = () => {
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: eventsApi.getEvents,
  });

  // Show all events — each card's query determines whether a gallery exists
  const allEvents = events ?? [];

  return (
    <div className="p-6 xl:p-8">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8290A5]">Admin</p>
        <h1 className="mt-0.5 text-[26px] font-extrabold tracking-tight text-[#111B33]">
          Published Galleries
        </h1>
        <p className="mt-1 text-[14px] text-[#586982]">
          Customer-ready galleries for your events. Share the link and PIN with your clients.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E8EE] bg-white py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-500 mb-3">
            <AlertCircle size={22} />
          </div>
          <p className="text-[14px] font-bold text-[#111B33]">Unable to load events</p>
          <p className="text-[12.5px] text-[#586982] mt-1 mb-4">
            Something went wrong loading event data.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && allEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E8EE] bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#8290A5] mb-4">
            <LayoutGrid size={22} />
          </div>
          <p className="text-[14.5px] font-bold text-[#111B33]">No galleries published yet</p>
          <p className="text-[13px] text-[#586982] mt-1 mb-5 max-w-[300px]">
            Select photos in an event and publish a gallery to share with your customer.
          </p>
          <Link
            to="/app/events"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1769FF] px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] transition-colors"
          >
            Go to Events <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Gallery grid */}
      {!isLoading && !isError && allEvents.length > 0 && (
        <>
          <p className="mb-4 text-[13px] font-bold text-[#586982]">
            {allEvents.length} {allEvents.length === 1 ? "event" : "events"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allEvents.map((event) => (
              <GalleryCard key={event._id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GalleriesPage;
