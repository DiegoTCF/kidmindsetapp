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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, hsl(220 20% 96%) 0%, hsl(220 15% 88%) 100%)' }}>
      {/* Header with logo and branding - Light theme */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-md border-b border-border shadow-soft py-3">
        {/* Red accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
        
        <div className="flex flex-col items-center gap-1 pt-1">
          {/* Logo */}
          <img 
            src="/lovable-uploads/The_Confident_Footballer.png" 
            alt="The Confident Footballer Logo" 
            className="h-16 w-auto"
          />
          {/* Branding Text */}
          <div className="flex flex-col items-center">
            <span className="font-['Baloo_2'] text-lg font-bold text-primary">
              The Confident Footballer
            </span>
            <span className="font-['Baloo_2'] text-sm font-semibold text-foreground bg-secondary px-3 py-0.5 rounded-full border border-border">
              Players App
            </span>
          </div>
        </div>
        {/* Logout Button */}
        <div className="absolute top-4 left-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-card hover:bg-secondary border-border text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen pt-36", // Account for taller header with branding
        !hideNavigation && "pb-20" // Account for bottom nav
      )}>
        <div className="container max-w-4xl mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!hideNavigation && <BottomNav />}
    </div>
  );
}
