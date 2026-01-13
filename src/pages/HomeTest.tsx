import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, TrendingUp, Wrench, Map, Brain } from "lucide-react";
import { useChildData } from "@/hooks/useChildData";

interface DiamondCircleProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  position: 'top' | 'left' | 'center' | 'right' | 'bottom';
  color: string;
  isCenter?: boolean;
  centerContent?: React.ReactNode;
}

const DiamondCircle = ({ 
  icon, 
  label, 
  onClick, 
  position, 
  color,
  isCenter = false,
  centerContent
}: DiamondCircleProps) => {
  const positionClasses = {
    top: 'col-start-2 row-start-1',
    left: 'col-start-1 row-start-2',
    center: 'col-start-2 row-start-2',
    right: 'col-start-3 row-start-2',
    bottom: 'col-start-2 row-start-3',
  };

  const sizeClasses = isCenter 
    ? 'w-32 h-32 sm:w-40 sm:h-40' 
    : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <motion.div 
      className={`${positionClasses[position]} flex flex-col items-center justify-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: position === 'center' ? 0 : 0.2, duration: 0.4 }}
    >
      <motion.button
        onClick={onClick}
        className={`${sizeClasses} rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95`}
        style={{ 
          borderColor: color,
          background: isCenter 
            ? 'radial-gradient(circle at center, hsl(0 0% 15%) 0%, hsl(0 0% 8%) 100%)' 
            : 'transparent',
          boxShadow: isCenter 
            ? `0 0 30px ${color}40, inset 0 0 20px ${color}20` 
            : `0 0 15px ${color}30`
        }}
        whileHover={{ 
          boxShadow: `0 0 40px ${color}60, inset 0 0 25px ${color}30` 
        }}
        whileTap={{ scale: 0.95 }}
      >
        {isCenter && centerContent ? centerContent : icon}
      </motion.button>
      <span 
        className="mt-2 text-xs sm:text-sm font-medium text-center"
        style={{ color }}
      >
        {label}
      </span>
      {isCenter && (
        <span className="text-xs text-muted-foreground mt-1">
          Click for profile
        </span>
      )}
    </motion.div>
  );
};

export default function HomeTest() {
  const navigate = useNavigate();
  const { childId, loading } = useChildData();
  const [profileName, setProfileName] = useState<string>("Player");

  useEffect(() => {
    // Load profile name from localStorage
    const savedProfile = localStorage.getItem('kidmindset_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfileName(profileData.name || "Player");
    }
  }, []);

  // Colors for each circle
  const colors = {
    journey: 'hsl(45, 100%, 50%)', // Gold/Yellow
    performance: 'hsl(200, 80%, 55%)', // Blue
    profile: 'hsl(0, 100%, 50%)', // Red
    mindset: 'hsl(280, 80%, 60%)', // Purple
    tools: 'hsl(340, 80%, 55%)', // Pink/Magenta
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 60%, hsl(0, 100%, 50%, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, hsl(200, 80%, 55%, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, hsl(280, 80%, 60%, 0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Header */}
      <motion.div 
        className="text-center pt-8 pb-4 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <img 
            src="/lovable-uploads/0c9470e1-345e-4fca-81f4-74d09d83b37e.png" 
            alt="Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-primary">
            The Confident Footballer
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Player Hub
        </p>
      </motion.div>

      {/* Diamond Layout */}
      <div className="flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="grid grid-cols-3 grid-rows-3 gap-4 sm:gap-6 max-w-md">
          {/* Top - Your Journey (Goals) */}
          <DiamondCircle
            icon={<Map className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: colors.journey }} />}
            label="Your Journey"
            onClick={() => navigate('/goals')}
            position="top"
            color={colors.journey}
          />

          {/* Left - Performance */}
          <DiamondCircle
            icon={<TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: colors.performance }} />}
            label="Performance"
            onClick={() => navigate('/performance')}
            position="left"
            color={colors.performance}
          />

          {/* Center - Profile */}
          <DiamondCircle
            icon={<User className="w-12 h-12 sm:w-14 sm:h-14 text-muted-foreground" />}
            label={profileName}
            onClick={() => navigate('/profile')}
            position="center"
            color={colors.profile}
            isCenter={true}
            centerContent={
              <div className="flex flex-col items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
            }
          />

          {/* Right - Your Mindset (DNA) */}
          <DiamondCircle
            icon={<Brain className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: colors.mindset }} />}
            label="Your Mindset"
            onClick={() => navigate('/dna')}
            position="right"
            color={colors.mindset}
          />

          {/* Bottom - Your Tools */}
          <DiamondCircle
            icon={<Wrench className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: colors.tools }} />}
            label="Your Tools"
            onClick={() => navigate('/tools')}
            position="bottom"
            color={colors.tools}
          />
        </div>
      </div>
    </div>
  );
}
