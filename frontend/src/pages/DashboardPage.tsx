import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Images,
  CircleCheck,
  LayoutGrid,
  Users,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useEvents } from "../hooks/useEvents";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../api/events";
import type { User } from "../types";
import type { Event } from "../types/event";

/* ─── Greeting ───────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ─── Status badge ───────────────────────────────────────── */
const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, string> = {
    published: "bg-[#20A66A]/10 text-[#20A66A] border-[#20A66A]/20",
    active:    "bg-[#1769FF]/10 text-[#1769FF] border-[#1769FF]/20",
    draft:     "bg-[#586982]/10 text-[#586982] border-[#586982]/20",
  };
  const key = status ?? "draft";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold capitalize ${
        map[key] ?? map.draft
      }`}
    >
      {key}
    </span>
  );
};

/* ─── KPI Card ───────────────────────────────────────────── */
const KpiCard = ({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-[#E4E8EE] bg-white p-5 shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
    <div className={`inline-flex rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
    <p className="mt-3 text-[12.5px] font-semibold text-[#586982]">{label}</p>
    <p className="mt-0.5 text-[26px] font-extrabold leading-none text-[#111B33]">{value}</p>
    {sub && <p className="mt-1.5 text-[11.5px] font-semibold text-[#8290A5]">{sub}</p>}
  </div>
);

/* ─── Page ───────────────────────────────────────────────── */
const DashboardPage = () => {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useEvents();

  const {
    data: teamMembers,
    isLoading: teamLoading,
  } = useQuery<User[]>({
    queryKey: ["team-members"],
    queryFn: eventsApi.getTeamMembers,
    enabled: isAdmin,
  });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalEvents = events?.length ?? 0;
  const publishedEvents = events?.filter((e) => e.status === "published").length ?? 0;
  const activeEvents = events?.filter((e) => e.status === "active").length ?? 0;
  const totalTeam = teamMembers?.length ?? 0;

  // Last 5 events for the recent list
  const recentEvents: Event[] = events
    ? [...events]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5)
    : [];

  return (
    <div className="p-6 xl:p-8">
      {/* ── Greeting ── */}
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8290A5]">
          Welcome back
        </p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-[#111B33] xl:text-[28px]">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-[14px] text-[#586982]">
          Manage your events, collaborate with your team, and deliver beautiful memories.
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<CalendarDays size={20} className="text-[#1769FF]" />}
          iconBg="bg-[#1769FF]/10"
          label="Total Events"
          value={eventsLoading ? "—" : totalEvents}
          sub={activeEvents > 0 ? `${activeEvents} active` : undefined}
        />
        <KpiCard
          icon={<CircleCheck size={20} className="text-[#20A66A]" />}
          iconBg="bg-[#20A66A]/10"
          label="Published Galleries"
          value={eventsLoading ? "—" : publishedEvents}
          sub="Ready for customers"
        />
        {isAdmin ? (
          <KpiCard
            icon={<Users size={20} className="text-[#8B5CF6]" />}
            iconBg="bg-[#8B5CF6]/10"
            label="Team Members"
            value={teamLoading ? "—" : totalTeam}
            sub="Photographers & editors"
          />
        ) : (
          <KpiCard
            icon={<Images size={20} className="text-[#8B5CF6]" />}
            iconBg="bg-[#8B5CF6]/10"
            label="My Events"
            value={eventsLoading ? "—" : totalEvents}
            sub="Assigned to me"
          />
        )}
        <KpiCard
          icon={<LayoutGrid size={20} className="text-[#F59E0B]" />}
          iconBg="bg-[#F59E0B]/10"
          label="Draft Events"
          value={eventsLoading ? "—" : events?.filter((e) => e.status === "draft").length ?? 0}
          sub="In progress"
        />
      </div>

      {/* ── Recent events ── */}
      <div className="rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_12px_rgba(17,27,51,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E8EE]">
          <h2 className="text-[15px] font-extrabold text-[#111B33]">Recent Events</h2>
          <button
            onClick={() => navigate("/app/events")}
            className="flex items-center gap-1 text-[12.5px] font-bold text-[#1769FF] hover:text-[#0F5BE7]"
          >
            View all <ArrowRight size={13} />
          </button>
        </div>

        {/* Loading */}
        {eventsLoading && (
          <div className="divide-y divide-[#F1F4F9]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-[#E4E8EE] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-[#E4E8EE]" />
                  <div className="h-3 w-24 rounded bg-[#E4E8EE]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {eventsError && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <AlertCircle size={20} className="text-[#DC4C4C] mb-2" />
            <p className="text-[13.5px] font-bold text-[#111B33]">Unable to load events</p>
            <button
              onClick={() => refetchEvents()}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-[#111B33] hover:bg-[#F7F9FC]"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!eventsLoading && !eventsError && recentEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <CalendarDays size={24} className="text-[#8290A5] mb-3" />
            <p className="text-[13.5px] font-bold text-[#111B33]">No events yet</p>
            <p className="text-[12.5px] text-[#586982] mt-1 mb-4">
              {isAdmin
                ? "Create your first event to get started."
                : "You'll see assigned events here once your admin assigns you to one."}
            </p>
            {isAdmin && (
              <button
                onClick={() => navigate("/app/events")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1769FF] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0F5BE7]"
              >
                Go to Events
              </button>
            )}
          </div>
        )}

        {/* Desktop table */}
        {!eventsLoading && !eventsError && recentEvents.length > 0 && (
          <>
            <div className="hidden sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E4E8EE] bg-[#F7F9FC]">
                    {["Event", "Status", "Last Updated", ""].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#8290A5]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4F9]">
                  {recentEvents.map((ev) => (
                    <tr key={ev._id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-[13.5px] font-bold text-[#111B33] leading-tight">
                          {ev.title}
                        </p>
                        {ev.description && (
                          <p className="text-[11.5px] text-[#8290A5] truncate max-w-[240px]">
                            {ev.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ev.status} />
                      </td>
                      <td className="px-6 py-4 text-[12.5px] text-[#586982] whitespace-nowrap">
                        {new Date(ev.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/app/events/${ev._id}`}
                          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#1769FF] hover:text-[#0F5BE7]"
                        >
                          Open <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-[#F1F4F9]">
              {recentEvents.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/app/events/${ev._id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F9FC]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1769FF]/10 text-[13px] font-extrabold text-[#1769FF]">
                    {ev.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#111B33] truncate">{ev.title}</p>
                    <p className="text-[11px] text-[#8290A5]">
                      {new Date(ev.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={ev.status} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="mt-5 rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
        <div className="px-6 py-4 border-b border-[#E4E8EE]">
          <h2 className="text-[15px] font-extrabold text-[#111B33]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F4F9]">
          {(isAdmin
            ? [
                { icon: <CalendarDays size={18} className="text-[#1769FF]" />, iconBg: "bg-[#1769FF]/10", title: "Events", desc: "Manage all events", to: "/app/events" },
                { icon: <Users size={18} className="text-[#8B5CF6]" />, iconBg: "bg-[#8B5CF6]/10", title: "Team", desc: "Manage team members", to: "/app/team" },
                { icon: <LayoutGrid size={18} className="text-[#20A66A]" />, iconBg: "bg-[#20A66A]/10", title: "Galleries", desc: "View published galleries", to: "/app/galleries" },
                { icon: <CircleCheck size={18} className="text-[#F59E0B]" />, iconBg: "bg-[#F59E0B]/10", title: "Settings", desc: "Profile & account", to: "/app/settings" },
              ]
            : [
                { icon: <CalendarDays size={18} className="text-[#1769FF]" />, iconBg: "bg-[#1769FF]/10", title: "My Events", desc: "View assigned events", to: "/app/events" },
                { icon: <CircleCheck size={18} className="text-[#20A66A]" />, iconBg: "bg-[#20A66A]/10", title: "Settings", desc: "Profile & account", to: "/app/settings" },
              ]
          ).map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.to)}
              className="flex items-center gap-4 px-6 py-4 hover:bg-[#F7F9FC] transition-colors text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconBg}`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-[#111B33]">{action.title}</p>
                <p className="text-[12px] text-[#586982]">{action.desc}</p>
              </div>
              <ArrowRight size={14} className="shrink-0 text-[#8290A5]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
