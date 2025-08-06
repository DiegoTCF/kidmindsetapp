import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomIcon } from "@/components/ui/custom-emoji";

interface NavItem {
  id: string;
  label: string;
  iconType: 'home' | 'stadium' | 'progress' | 'goals' | 'crusher' | 'process';
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", iconType: "home", path: "/" },
  { id: "process", label: "Process", iconType: "process", path: "/your-process" },
  { id: "stadium", label: "Stadium", iconType: "stadium", path: "/stadium" },
  { id: "crusher", label: "Skill Crusher", iconType: "crusher", path: "/skill-crusher" },
  { id: "progress", label: "Progress", iconType: "progress", path: "/progress" },
  { id: "goals", label: "Goals", iconType: "goals", path: "/goals" },
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
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t 
                      border-neon-pink/20 px-2 py-3 safe-area-pb shadow-lg shadow-neon-pink/10">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-0 flex-1",
                  "transition-all duration-300 touch-manipulation font-bold uppercase text-xs tracking-wide",
                  isActive 
                    ? "bg-neon-pink/20 text-neon-pink shadow-lg shadow-neon-pink/30 scale-105 border border-neon-pink/30" 
                    : "text-muted-foreground hover:text-electric-blue hover:bg-electric-blue/10 hover:scale-102"
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                  isActive && "bg-neon-pink/30 scale-110 shadow-lg shadow-neon-pink/40 border border-neon-pink/50"
                )}>
                  <CustomIcon type={item.iconType} size="md" />
                </div>
                <span className={cn(
                  "text-xs font-bold truncate transition-all duration-300",
                  isActive && "text-neon-pink font-black"
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