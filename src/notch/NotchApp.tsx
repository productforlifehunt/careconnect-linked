import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NotchAuthProvider, useNotchAuth } from "@/notch/context/NotchAuthContext";
import { NotchSidebar } from "@/notch/components/NotchSidebar";
import NotchAuth from "@/notch/pages/NotchAuth";
import NotchHome from "@/notch/pages/NotchHome";
import NotchPage from "@/notch/pages/NotchPage";
import NotchSearch from "@/notch/pages/NotchSearch";
import NotchSettings from "@/notch/pages/NotchSettings";
import "@/notch/styles/notch.css";

function Shell() {
  const { user, loading } = useNotchAuth();
  const location = useLocation();
  if (loading) return <div className="notch-app" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Loading…</div>;
  if (!user && location.pathname !== "/notch/auth") return <Navigate to="/notch/auth" replace />;
  if (user && location.pathname === "/notch/auth") return <Navigate to="/notch" replace />;

  if (!user) {
    return (
      <div className="notch-app">
        <Routes>
          <Route path="auth" element={<NotchAuth />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="notch-app" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <NotchSidebar />
      <div className="nn-main">
        <Routes>
          <Route index element={<NotchHome />} />
          <Route path="p/:pageId" element={<NotchPage />} />
          <Route path="search" element={<NotchSearch />} />
          <Route path="settings" element={<NotchSettings />} />
          <Route path="*" element={<Navigate to="/notch" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function NotchApp() {
  return (
    <NotchAuthProvider>
      <Shell />
    </NotchAuthProvider>
  );
}
