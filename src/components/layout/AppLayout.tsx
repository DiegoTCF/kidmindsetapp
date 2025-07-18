import { ReactNode } from "react";
import { BottomNav } from "@/components/nav/BottomNav";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export function AppLayout({ children, hideNavigation = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
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