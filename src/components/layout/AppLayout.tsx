import { ReactNode } from "react";
import { BottomNav } from "@/components/nav/BottomNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export function AppLayout({ children, hideNavigation = false }: AppLayoutProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logout button */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen",
        !hideNavigation && "pb-20" // Account for bottom nav
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && <BottomNav />}
    </div>
  );
}