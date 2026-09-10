import { AppHeader } from "./AppHeader";
import { MobileBottomBar } from "./MobileBottomBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col w-full overflow-x-hidden">
        <AppHeader />
        {/* The page scrolls with the window, so the header stays pinned at the top. */}
        <main className="flex-1 overflow-x-hidden pb-16">{children}</main>
        <MobileBottomBar />
    </div>
  );
}
