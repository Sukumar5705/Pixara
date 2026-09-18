import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

/* ─── Route → Page Title / Breadcrumb mapping ──────────── */
const routeMeta: Record<string, { title: string; crumb: string }> = {
  "/app/dashboard": { title: "Dashboard", crumb: "Home › Dashboard" },
  "/app/events": { title: "Events", crumb: "Home › Events" },
  "/app/team": { title: "Team Members", crumb: "Home › Team" },
  "/app/galleries": { title: "Published Galleries", crumb: "Home › Galleries" },
  "/app/settings": { title: "Settings", crumb: "Home › Settings" },
};

/* ─── Component ─────────────────────────────────────────── */
const Topbar = () => {
  const { pathname } = useLocation();

  // Match exact path first; fall back to prefix match for nested routes like /app/events/:id
  const meta =
    routeMeta[pathname] ??
    (pathname.startsWith("/app/events/")
      ? { title: "Event Detail", crumb: "Home › Events › Detail" }
      : { title: "Pixara", crumb: "Home" });

  return (
    <header className="sticky top-0 z-40 flex h-[64px] shrink-0 items-center justify-between gap-4 border-b border-[#E4E8EE] bg-white px-6">
      {/* Left: title + breadcrumb */}
      <div className="min-w-0">
        <h1 className="text-[17px] font-extrabold text-[#111B33] leading-none">
          {meta.title}
        </h1>
        <p className="mt-0.5 text-[11.5px] text-[#8290A5]">{meta.crumb}</p>
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell — placeholder for future notification system */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E8EE] bg-white transition-colors hover:bg-[#F7F9FC]"
          aria-label="Notifications"
        >
          <Bell size={16} className="text-[#586982]" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
