import React from "react";
import type { EventStatus } from "../../types/event";

interface EventStatusBadgeProps {
  status?: EventStatus;
  variant?: "card" | "page";
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
  status,
  variant = "page",
}) => {
  if (!status) return null;

  const labels: Record<EventStatus, string> = {
    draft: "Draft",
    active: "Active",
    published: "Published",
  };

  const cardStyles: Record<EventStatus, string> = {
    draft: "border-white/60 text-white bg-transparent",
    active: "border-white/70 text-white bg-transparent",
    published: "border-white/80 text-white bg-transparent",
  };

  const pageStyles: Record<EventStatus, string> = {
    draft: "border-[#D9E0EA] bg-[#F7F8FA] text-[#667085]",
    active: "border-[#C9D8EE] bg-[#F3F7FC] text-[#315A8A]",
    published: "border-[#C8D5E6] bg-[#F2F6FA] text-[#294A6B]",
  };

  const styles = variant === "card" ? cardStyles : pageStyles;

  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-md",
        "border",
        "px-3 py-1",
        "text-xs font-medium",
        "tracking-[-0.01em]",
        "whitespace-nowrap",
        styles[status] || styles.draft,
      ].join(" ")}
    >
      {labels[status] || status}
    </span>
  );
};