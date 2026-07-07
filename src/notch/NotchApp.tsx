import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NotchAuthProvider, useNotchAuth } from "@/notch/context/NotchAuthContext";
import { NotchBaseContext } from "@/notch/context/NotchBaseContext";
import { NotchSidebar } from "@/notch/components/NotchSidebar";
import { NotchQuickFind } from "@/notch/components/NotchQuickFind";
import NotchAuth from "@/notch/pages/NotchAuth";
import NotchHome from "@/notch/pages/NotchHome";
import NotchPage from "@/notch/pages/NotchPage";
import NotchSearch from "@/notch/pages/NotchSearch";
import NotchSettings from "@/notch/pages/NotchSettings";
import NotchTrash from "@/notch/pages/NotchTrash";
import NotchTemplates from "@/notch/pages/NotchTemplates";
import NotchLanding from "@/notch/pages/NotchLanding";
import "@/notch/styles/notch.css";

interface Props {
  /** Base path this app is mounted under. "" for standalone site, "/notch" when embedded. */
  base?: string;
  /** In standalone mode, show landing page for unauthenticated visitors at "/". */
  standalone?: boolean;
}

function Shell({ standalone }: { standalone: boolean }) {
  const { user, loading } = useNotchAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickFind, setQuickFind] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Cmd/Ctrl + K quick find
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setQuickFind((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apply theme (light/dark) from localStorage
  useEffect(() => {
    const apply = () => {
      const t = localStorage.getItem("nn_theme") || "light";
      const el = document.querySelector(".notch-app");
      if (el) el.classList.toggle("dark", t === "dark");
    };
    apply();
    window.addEventListener("nn:theme-changed", apply);
    return () => window.removeEventListener("nn:theme-changed", apply);
  }, [user]);

  if (loading) return <div className="notch-app" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Loading…</div>;

  const authRoutes = (
    <Routes>
      <Route path="auth" element={<NotchAuth />} />
      {standalone && <Route index element={<NotchLanding />} />}
      <Route path="*" element={<Navigate to={standalone ? "/" : "/auth"} replace />} />
    </Routes>
  );

  if (!user) {
    return <div className="notch-app">{authRoutes}</div>;
  }

  // Prevent authenticated users from lingering on /auth
  if (location.pathname.endsWith("/auth")) {
    return <Navigate to={standalone ? "/" : "/notch"} replace />;
  }

  return (
    <div className="notch-app" style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      {isMobile ? (
        <>
          {drawerOpen && (
            <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }} />
          )}
          <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 41, transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.2s ease", boxShadow: drawerOpen ? "0 0 30px rgba(0,0,0,0.2)" : "none" }}>
            <NotchSidebar />
          </div>
        </>
      ) : (
        <NotchSidebar />
      )}
      <div className="nn-main">
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", height: 45, padding: "0 8px", borderBottom: "1px solid var(--nn-border)", gap: 6 }}>
            <button className="nn-topbar-btn" onClick={() => setDrawerOpen((s) => !s)} aria-label="Menu">
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Notch Note</div>
          </div>
        )}
        <Routes>
          <Route index element={<NotchHome />} />
          <Route path="p/:pageId" element={<NotchPage />} />
          <Route path="search" element={<NotchSearch />} />
          <Route path="settings" element={<NotchSettings />} />
          <Route path="trash" element={<NotchTrash />} />
          <Route path="templates" element={<NotchTemplates />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {quickFind && <NotchQuickFind onClose={() => setQuickFind(false)} />}
    </div>
  );
}

export default function NotchApp({ base = "/notch", standalone = false }: Props) {
  return (
    <NotchBaseContext.Provider value={standalone ? "" : base}>
      <NotchAuthProvider>
        <Shell standalone={standalone} />
      </NotchAuthProvider>
    </NotchBaseContext.Provider>
  );
}
