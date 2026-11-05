import { AppHeader } from "./AppHeader";
import { MobileBottomBar } from "./MobileBottomBar";
import { PageBackButton } from "./PageBackButton";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col w-full overflow-x-hidden">
        <AppHeader />
        {/* The page scrolls with the window, so the header stays pinned at the top. */}
        <main className="flex-1 overflow-x-hidden pb-16">
          <div className="mx-auto w-full max-w-6xl px-4 pt-2">
            <PageBackButton />
          </div>
          {children}
        </main>
        <MobileBottomBar />
    </div>
  );
}
