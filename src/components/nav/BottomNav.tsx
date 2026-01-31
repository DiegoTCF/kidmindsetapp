import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomIcon } from "@/components/ui/custom-emoji";

interface NavItem {
  id: string;
  label: string;
  iconType: 'home' | 'stadium' | 'progress' | 'goals' | 'dna';
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", iconType: "home", path: "/" },
  { id: "stadium", label: "Stadium", iconType: "stadium", path: "/stadium" },
  { id: "progress", label: "Progress", iconType: "progress", path: "/progress" },
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
        className="fixed top-4 right-4 z-50 w-11 h-11 
                   bg-gradient-to-br from-secondary to-muted
                   backdrop-blur-sm rounded-full 
                   flex items-center justify-center text-muted-foreground 
                   hover:text-foreground hover:shadow-glow-primary
                   transition-all duration-300 shadow-lg border border-border/50"
        aria-label="Grown Up Zone"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Bottom Navigation - FIFA Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        {/* Gradient border top */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        
        {/* Navigation container */}
        <div className="bg-gradient-to-t from-background via-card/98 to-card/95 backdrop-blur-md px-2 py-2 safe-area-pb">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0 flex-1",
                    "transition-all duration-300 touch-manipulation",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={item.label}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 
                                    bg-gradient-to-r from-transparent via-primary to-transparent 
                                    rounded-full animate-pulse" />
                  )}
                  
                  {/* Icon container with glow effect */}
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-primary/20 scale-110 shadow-glow-primary" 
                      : "hover:bg-muted/50"
                  )}>
                    <CustomIcon type={item.iconType} size="md" />
                    
                    {/* Ring effect on active */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider truncate transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom padding for content */}
      <div className="h-24" />
    </>
  );
}