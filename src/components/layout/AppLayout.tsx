import { Suspense } from "react";
import { AppHeader } from "./AppHeader";
import { PageBackButton } from "./PageBackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/lib/router-compat";
import { lazyRetry } from "@/lib/lazy-retry";

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
  const pagePath = pathname.replace(/\/+$/, "") || "/";
  const showBackButton = pagePath !== "/" && pagePath !== "/dashboard";

  return (
    <div className="min-h-dvh flex flex-col w-full overflow-x-hidden">
      <AppHeader />
      {/* The page scrolls with the window, so the header stays pinned at the top. */}
      <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
        {showBackButton && (
          <div className="mx-auto w-full max-w-6xl px-4 pt-2">
            <PageBackButton />
          </div>
        )}
        {children}
      </main>
      <AuthenticatedBottomBar />
    </div>
  );
}
