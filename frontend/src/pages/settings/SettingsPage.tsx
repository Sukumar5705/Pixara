import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Camera,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-[#F1F4F9] last:border-b-0">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F4F9] text-[#8290A5]">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#8290A5] mb-0.5">
        {label}
      </p>
      <p className="text-[14px] font-semibold text-[#111B33] truncate">{value}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="p-6 xl:p-8">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8290A5]">
          Account
        </p>
        <h1 className="mt-0.5 text-[26px] font-extrabold tracking-tight text-[#111B33]">
          Settings
        </h1>
        <p className="mt-1 text-[14px] text-[#586982]">
          Your profile and account information.
        </p>
      </div>

      <div className="max-w-[600px] space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
          {/* Avatar section */}
          <div className="flex items-center gap-5 p-6 border-b border-[#E4E8EE]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1769FF] text-[20px] font-extrabold text-white">
              {initials}
            </div>
            <div>
              <p className="text-[18px] font-extrabold text-[#111B33]">
                {user?.name ?? "User"}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${
                  isAdmin
                    ? "bg-[#1769FF]/10 text-[#1769FF]"
                    : "bg-[#F1F4F9] text-[#586982]"
                }`}
              >
                <ShieldCheck size={11} />
                {isAdmin ? "Administrator" : "Team Member"}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-6">
            <InfoRow
              icon={<User size={16} />}
              label="Full Name"
              value={user?.name ?? "—"}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email Address"
              value={user?.email ?? "—"}
            />
            <InfoRow
              icon={<ShieldCheck size={16} />}
              label="Role"
              value={isAdmin ? "Administrator" : "Team Member"}
            />
            {memberSince && (
              <InfoRow
                icon={<Calendar size={16} />}
                label="Member Since"
                value={memberSince}
              />
            )}
          </div>
        </div>

        {/* Note about editing */}
        <div className="flex items-start gap-3 rounded-xl border border-[#E4E8EE] bg-[#F7F9FC] px-4 py-3.5">
          <Camera size={15} className="text-[#8290A5] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#586982] leading-relaxed">
            Profile editing is managed by your administrator. Contact your admin if you need to update your name, email, or password.
          </p>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-[#E4E8EE] bg-white shadow-[0_2px_12px_rgba(17,27,51,0.04)] p-6">
          <h2 className="text-[14px] font-extrabold text-[#111B33] mb-1">Session</h2>
          <p className="text-[13px] text-[#586982] mb-5">
            You are currently signed in as <strong>{user?.name}</strong>. Sign out to end your session.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-[13.5px] font-bold text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
