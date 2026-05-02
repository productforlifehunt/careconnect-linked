import { AppHeader } from "./AppHeader";
import { MobileBottomBar } from "./MobileBottomBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <AppHeader />
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomBar />
    </div>
  );
}
