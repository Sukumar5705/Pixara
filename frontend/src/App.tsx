import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";
import AppLayout from "./components/layout/AppLayout";

// ── Auth pages (no shell) ─────────────────────────────────────────────────────
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// ── Core app pages ────────────────────────────────────────────────────────────
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/events/EventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";

// ── Admin-only pages ──────────────────────────────────────────────────────────
import TeamPage from "./pages/team/TeamPage";
import GalleriesPage from "./pages/galleries/GalleriesPage";

// ── Shared authenticated pages ────────────────────────────────────────────────
import SettingsPage from "./pages/settings/SettingsPage";

// ── Public pages (no auth required) ──────────────────────────────────────────
import PublicGalleryPage from "./pages/public/PublicGalleryPage";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public auth routes — no app shell ──────────────────── */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <RegisterPage />}
        />

        {/* ── Public customer gallery (PIN-protected, no JWT) ─────── */}
        <Route path="/gallery/:slug" element={<PublicGalleryPage />} />

        {/* ── Protected app shell (all /app/* routes) ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Default redirect */}
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard" element={<DashboardPage />} />

            {/* Events — accessible to all authenticated users */}
            <Route path="/app/events" element={<EventsPage />} />
            <Route path="/app/events/:id" element={<EventDetailPage />} />

            {/* Settings — accessible to all authenticated users */}
            <Route path="/app/settings" element={<SettingsPage />} />

            {/* ── Admin-only routes ────────────────────────────────── */}
            <Route element={<AdminRoute />}>
              <Route path="/app/team" element={<TeamPage />} />
              <Route path="/app/galleries" element={<GalleriesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />}
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;