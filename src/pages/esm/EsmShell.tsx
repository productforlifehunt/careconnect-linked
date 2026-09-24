import { Link, useLocation } from "react-router-dom";
import { CircleHelp, ClipboardList, Home, ListChecks, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TABS = [
  { to: "/", label: "Today", icon: Home },
  { to: "/log", label: "Log entry", icon: ClipboardList },
  { to: "/entries", label: "My entries", icon: ListChecks },
  { to: "/help", label: "Help", icon: CircleHelp },
];

/** The study's own shell — no care-app menus, just the four study screens. */
export function EsmShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link to="/" className="truncate text-sm font-semibold text-foreground">
            A Week in the Life of Dementia Caregivers
          </Link>
          <Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="Me">
            <Link to="/me"><UserRound className="h-5 w-5" /></Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
