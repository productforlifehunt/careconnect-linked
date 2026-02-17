import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, LayoutDashboard, Bell, Settings, Heart } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg hero-gradient">
            <span className="text-primary-foreground font-bold text-sm">C·C</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            <span className="text-primary">Care</span>
            <span className="text-muted-foreground">Connected</span>
          </span>
        </Link>

        <div className="flex-1" />

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-coral text-coral-foreground text-xs">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline text-sm">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="coral" onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
