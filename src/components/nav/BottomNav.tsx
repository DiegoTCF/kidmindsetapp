import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomIcon } from "@/components/ui/custom-emoji";

interface NavItem {
  id: string;
  label: string;
  iconType: 'home' | 'stadium' | 'progress' | 'goals' | 'crusher';
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", iconType: "home", path: "/" },
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
        className="fixed top-4 right-4 z-50 w-10 h-10 glass rounded-full 
                   flex items-center justify-center text-muted-foreground hover:shadow-glow 
                   transition-all duration-300 shadow-modern hover:scale-110"
        aria-label="Grown Up Zone"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t 
                      border-white/10 px-2 py-2 safe-area-pb shadow-modern">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0 flex-1",
                  "transition-all duration-300 touch-manipulation",
                  isActive 
                    ? "gradient-card text-white shadow-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                aria-label={item.label}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                  isActive && "gradient-primary scale-110 shadow-glow"
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