import { useNavigate } from "react-router-dom";
import { Video, TrendingUp, Calendar, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const TestDesign = () => {
  const navigate = useNavigate();
  
  const { data: childData } = useQuery({
    queryKey: ['child-data-test'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_current_user_child_data');
      return data?.[0] || null;
    }
  });
  
  const playerName = childData?.child_name || "Player";

  const navItems = [
    {
      icon: Video,
      label: "Video Library",
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500",
      position: "top",
      onClick: () => navigate("/stadium"),
    },
    {
      icon: TrendingUp,
      label: "Performance",
      color: "from-cyan-400 to-blue-500",
      borderColor: "border-cyan-400",
      position: "left",
      onClick: () => navigate("/progress"),
    },
    {
      icon: Calendar,
      label: "Football Diet",
      color: "from-purple-400 to-violet-500",
      borderColor: "border-purple-400",
      position: "right",
      onClick: () => navigate("/stadium"),
    },
    {
      icon: Target,
      label: "Goals",
      color: "from-pink-500 to-rose-500",
      borderColor: "border-pink-500",
      position: "bottom",
      onClick: () => navigate("/goals"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Project Enzo
          </h1>
        </div>
        <p className="text-slate-400 text-sm">Football Journey Tracker</p>
      </div>

      {/* Circular Hub Layout */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Top Circle - Video Library */}
        <NavCircle
          icon={navItems[0].icon}
          label={navItems[0].label}
          borderColor={navItems[0].borderColor}
          onClick={navItems[0].onClick}
          className="absolute top-0 left-1/2 -translate-x-1/2"
        />

        {/* Left Circle - Performance */}
        <NavCircle
          icon={navItems[1].icon}
          label={navItems[1].label}
          borderColor={navItems[1].borderColor}
          onClick={navItems[1].onClick}
          className="absolute left-0 top-1/2 -translate-y-1/2"
        />

        {/* Right Circle - Football Diet */}
        <NavCircle
          icon={navItems[2].icon}
          label={navItems[2].label}
          borderColor={navItems[2].borderColor}
          onClick={navItems[2].onClick}
          className="absolute right-0 top-1/2 -translate-y-1/2"
        />

        {/* Bottom Circle - Goals */}
        <NavCircle
          icon={navItems[3].icon}
          label={navItems[3].label}
          borderColor={navItems[3].borderColor}
          onClick={navItems[3].onClick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
        />

        {/* Center Avatar */}
        <div 
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => navigate("/profile")}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500/50 bg-gradient-to-br from-purple-900/50 to-slate-900 flex items-center justify-center overflow-hidden shadow-lg shadow-purple-500/20 group-hover:border-purple-400 transition-colors">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <User className="w-16 h-16 md:w-20 md:h-20 text-slate-400" />
            </div>
          </div>
          <h2 className="mt-4 text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {playerName}
          </h2>
          <p className="text-slate-500 text-sm">Click for profile</p>
        </div>
      </div>
    </div>
  );
};

interface NavCircleProps {
  icon: React.ElementType;
  label: string;
  borderColor: string;
  onClick: () => void;
  className?: string;
}

const NavCircle = ({ icon: Icon, label, borderColor, onClick, className }: NavCircleProps) => {
  return (
    <div 
      className={`flex flex-col items-center cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 ${borderColor} bg-slate-800/50 flex items-center justify-center backdrop-blur-sm hover:bg-slate-700/50 transition-all hover:scale-105`}>
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-white transition-colors" />
      </div>
      <span className="mt-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  );
};

export default TestDesign;
