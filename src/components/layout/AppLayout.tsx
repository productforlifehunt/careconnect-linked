import { Suspense } from "react";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/lib/router-compat";
import { lazyRetry } from "@/lib/lazy-retry";
import { isWorkspacePath } from "@/config/nav";

const MobileBottomBar = lazyRetry(
  () =>
    import("./MobileBottomBar").then((module) => ({
      default: module.MobileBottomBar,
    })),
  "MobileBottomBar",
);

function AuthenticatedBottomBar() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated || pathname === "/") return null;

  return (
    <Suspense fallback={null}>
      <MobileBottomBar />
    </Suspense>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const hasBottomNav = isWorkspacePath(pathname);

  return (
    <div className="flex min-h-dvh w-full min-w-0 max-w-full flex-col overflow-x-clip">
      <AppHeader />
      {/* The page scrolls with the window, so the header stays pinned at the top. */}
      <main
        className={`w-full min-w-0 max-w-full flex-1 overflow-x-hidden ${hasBottomNav ? "pb-16" : ""}`}
      >
        {children}
      </main>
      <AuthenticatedBottomBar />
    </div>
  );
}
