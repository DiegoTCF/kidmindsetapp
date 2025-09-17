import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomIcon } from "@/components/ui/custom-emoji";

interface NavItem {
  id: string;
  label: string;
  iconType: 'home' | 'stadium' | 'progress' | 'schedule' | 'goals' | 'dna';
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", iconType: "home", path: "/" },
  { id: "stadium", label: "Stadium", iconType: "stadium", path: "/stadium" },
  { id: "progress", label: "Progress", iconType: "progress", path: "/progress" },
  { id: "schedule", label: "Schedule", iconType: "schedule", path: "/schedule" },
  { id: "goals", label: "Goals", iconType: "goals", path: "/goals" },
  { id: "dna", label: "DNA", iconType: "dna", path: "/dna" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showGrownUpZone, setShowGrownUpZone] = useState(false);

  const handleNavClick = (path: string) => {
    console.log('[KidMindset] Navigation clicked:', path);
    navigate(path);
  };

  const handleGrownUpZone = () => {
    console.log('[KidMindset] Grown Up Zone accessed');
    navigate('/grown-up');
  };

  return (
    <>
      {/* Grown Up Zone Button - Floating */}
      <button
        onClick={handleGrownUpZone}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-muted/80 backdrop-blur-sm rounded-full 
                   flex items-center justify-center text-muted-foreground hover:bg-muted 
                   transition-all duration-200 shadow-lg"
        aria-label="Grown Up Zone"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t 
                      border-border px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0 flex-1",
                  "transition-all duration-200 touch-manipulation",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/20 scale-110"
                )}>
                  <CustomIcon type={item.iconType} size="md" />
                </div>
                <span className={cn(
                  "text-xs font-medium truncate transition-all duration-200",
                  isActive && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for content */}
      <div className="h-20" />
    </>
  );
}