import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Camera,
  Home,
  CalendarDays,
  Users,
  LayoutGrid,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

/* ─── Nav item type ─────────────────────────────────────── */
interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

interface NavSection {
  group?: string;
  items: NavItem[];
}

/* ─── Navigation config ─────────────────────────────────── */
const ICON = 17;

const adminSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: <Home size={ICON} />, to: "/app/dashboard" },
    ],
  },
  {
    group: "Event Management",
    items: [
      { label: "Events", icon: <CalendarDays size={ICON} />, to: "/app/events" },
      { label: "Team Members", icon: <Users size={ICON} />, to: "/app/team" },
    ],
  },
  {
    group: "Gallery",
    items: [
      { label: "Published Galleries", icon: <LayoutGrid size={ICON} />, to: "/app/galleries" },
    ],
  },
];

const teamSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: <Home size={ICON} />, to: "/app/dashboard" },
    ],
  },
  {
    group: "My Work",
    items: [
      { label: "Assigned Events", icon: <CalendarDays size={ICON} />, to: "/app/events" },
    ],
  },
];

/* ─── Active link styles ─────────────────────────────────── */
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-150 ${
    isActive
      ? "bg-[#1769FF]/10 text-[#1769FF]"
      : "text-[#586982] hover:bg-[#F1F4F9] hover:text-[#111B33]"
  }`;

/* ─── Component ─────────────────────────────────────────── */
interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const sections = isAdmin ? adminSections : teamSections;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopoverOpen]);

  const handleLogout = () => {
    setIsPopoverOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col bg-white border-r border-[#E4E8EE]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#E4E8EE]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1769FF]">
          <Camera size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
            Photo<span className="text-[#1769FF]">Share</span>
          </span>
          <p className="text-[10px] font-medium text-[#8290A5] leading-none mt-0.5">
            Capture. Collaborate. Share.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" onClick={onClose}>
        {sections.map((section, si) => (
          <div key={si}>
            {section.group && (
              <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-widest text-[#8290A5]">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={navLinkClass} end={item.to === "/app/dashboard"}>
                    <span className="shrink-0">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile row with popover */}
      <div className="border-t border-[#E4E8EE] px-4 py-3 relative">
        <button
          ref={triggerRef}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className={`flex w-full items-center gap-3 rounded-xl p-1.5 transition-colors ${
            isPopoverOpen ? "bg-[#F7F9FC]" : "hover:bg-[#F7F9FC]"
          }`}
          aria-expanded={isPopoverOpen}
          aria-haspopup="true"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1769FF] text-[12px] font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] font-bold text-[#111B33] truncate">{user?.name ?? "User"}</p>
            <p className="text-[11px] text-[#8290A5] capitalize">{isAdmin ? "Admin" : "Team Member"}</p>
          </div>
          <ChevronRight
            size={14}
            className={`text-[#8290A5] transition-transform ${isPopoverOpen ? "rotate-90" : ""}`}
          />
        </button>

        {isPopoverOpen && (
          <div
            ref={popoverRef}
            className="absolute bottom-full left-4 mb-2 w-[calc(100%-2rem)] rounded-xl border border-[#E4E8EE] bg-white p-2 shadow-lg z-50"
          >
            <div className="mb-2 flex items-center gap-3 px-2 py-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1769FF] text-[12px] font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#111B33] truncate">{user?.name ?? "User"}</p>
                <p className="text-[11px] text-[#8290A5] capitalize">{isAdmin ? "Admin" : "Team Member"}</p>
              </div>
            </div>

            <div className="my-1 h-px w-full bg-[#E4E8EE]" />

            <div className="space-y-0.5">
              <NavLink
                to="/app/settings"
                onClick={() => setIsPopoverOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#1769FF]/10 text-[#1769FF]"
                      : "text-[#111B33] hover:bg-[#F1F4F9]"
                  }`
                }
              >
                <Settings size={15} className="text-[#586982]" />
                Settings
              </NavLink>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-[13px] font-medium text-[#111B33] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={15} className="text-[#586982] transition-colors group-hover:text-red-600" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
