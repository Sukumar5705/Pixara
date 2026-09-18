import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Camera } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FC]">
      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* ─── Mobile Slide-Over Drawer ─────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          {/* Drawer */}
          <div className="relative flex h-full animate-fade-up">
            <Sidebar onClose={() => setMobileOpen(false)} />
            <button
              className="absolute top-4 right-[-40px] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Main column ─────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile topbar (hamburger variant) */}
        <div className="flex lg:hidden items-center gap-3 h-[64px] shrink-0 border-b border-[#E4E8EE] bg-white px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E8EE]"
            aria-label="Open navigation"
          >
            <Menu size={18} className="text-[#586982]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769FF]">
              <Camera size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
              Photo<span className="text-[#1769FF]">Share</span>
            </span>
          </div>
        </div>

        {/* Desktop Topbar */}
        <div className="hidden lg:block">
          <Topbar />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
