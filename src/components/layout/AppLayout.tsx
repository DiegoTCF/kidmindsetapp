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
      {/* Header with logo and logout button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-8" /> {/* Spacer for balance */}
          <img 
            src="/lovable-uploads/620c4617-1719-4bc3-ba59-eeaa7cc63a8d.png" 
            alt="The Confident Footballer Logo" 
            className="h-24 w-auto"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen pt-16", // Account for header
        !hideNavigation && "pb-20" // Account for bottom nav
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && <BottomNav />}
    </div>
  );
}