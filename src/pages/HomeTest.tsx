import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, TrendingUp, Wrench, Map, Brain } from "lucide-react";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";

interface DiamondCircleProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  position: 'top' | 'left' | 'center' | 'right' | 'bottom';
  color: string;
  isCenter?: boolean;
  centerContent?: React.ReactNode;
  badge?: number;
}

const DiamondCircle = ({ 
  icon, 
  label, 
  sublabel,
  onClick, 
  position, 
  color,
  isCenter = false,
  centerContent,
  badge
}: DiamondCircleProps) => {
  const positionClasses = {
    top: 'col-start-2 row-start-1',
    left: 'col-start-1 row-start-2',
    center: 'col-start-2 row-start-2',
    right: 'col-start-3 row-start-2',
    bottom: 'col-start-2 row-start-3',
  };

  const sizeClasses = isCenter 
    ? 'w-28 h-28 sm:w-36 sm:h-36' 
    : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <motion.div 
      className={`${positionClasses[position]} flex flex-col items-center justify-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: position === 'center' ? 0 : 0.1 + Math.random() * 0.2, duration: 0.5, ease: "easeOut" }}
    >
      <motion.button
        onClick={onClick}
        className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 relative`}
        style={{ 
          background: isCenter 
            ? 'linear-gradient(145deg, hsl(0 0% 98%) 0%, hsl(0 0% 92%) 100%)' 
            : 'linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(0 0% 95%) 100%)',
          boxShadow: isCenter 
            ? `0 8px 32px ${color}40, 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)` 
            : `0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)`,
          border: `3px solid ${color}`,
        }}
        whileHover={{ 
          scale: 1.08,
          boxShadow: `0 12px 40px ${color}50, 0 6px 20px rgba(0,0,0,0.15)`,
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isCenter ? 0 : [0, -3, 0],
        }}
        transition={{
          y: {
            duration: 2 + Math.random(),
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {/* Badge for unseen tasks */}
        {badge && badge > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {badge > 9 ? '9+' : badge}
          </motion.div>
        )}
        
        {isCenter && centerContent ? centerContent : (
          <div style={{ color }}>{icon}</div>
        )}
      </motion.button>
      
      <motion.span 
        className="mt-3 text-sm sm:text-base font-bold text-center tracking-tight"
        style={{ color }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.span>
      
      {sublabel && (
        <motion.span 
          className="text-xs text-muted-foreground text-center max-w-[80px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {sublabel}
        </motion.span>
      )}
      
      {isCenter && (
        <motion.span 
          className="text-xs text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5 }}
        >
          Tap to view
        </motion.span>
      )}
    </motion.div>
  );
};

export default function HomeTest() {
  const navigate = useNavigate();
  const { childId, loading } = useChildData();
  const [profileName, setProfileName] = useState<string>("Player");
  const [unseenTasks, setUnseenTasks] = useState<number>(0);

  useEffect(() => {
    // Load profile name from localStorage
    const savedProfile = localStorage.getItem('kidmindset_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfileName(profileData.name || "Player");
    }
  }, []);

  // Fetch unseen tasks count
  useEffect(() => {
    const fetchUnseenTasks = async () => {
      if (!childId) return;
      
      try {
        const { data, error } = await supabase
          .from('player_tasks')
          .select('id', { count: 'exact' })
          .eq('child_id', childId)
          .is('seen_at', null)
          .neq('status', 'locked');
        
        if (!error && data) {
          setUnseenTasks(data.length);
        }
      } catch (err) {
        console.error('Error fetching unseen tasks:', err);
      }
    };

    fetchUnseenTasks();
  }, [childId]);

  // Colors - Red and Black theme with accents
  const colors = {
    journey: 'hsl(45, 90%, 45%)', // Gold/Yellow for journey
    performance: 'hsl(210, 80%, 50%)', // Blue for performance
    profile: 'hsl(0, 85%, 50%)', // Red for profile (center)
    mindset: 'hsl(280, 70%, 55%)', // Purple for mindset/identity
    tools: 'hsl(160, 70%, 45%)', // Teal for tools
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0, 0%, 0%) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(0, 85%, 50%) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, hsl(0, 0%, 0%) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="text-center pt-8 pb-4 px-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.img 
            src="/lovable-uploads/0c9470e1-345e-4fca-81f4-74d09d83b37e.png" 
            alt="Logo" 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
          />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            The Confident Footballer
          </h1>
        </div>
        <motion.p 
          className="text-muted-foreground text-base font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome back, <span className="text-primary font-bold">{profileName}</span>!
        </motion.p>
      </motion.div>

      {/* Diamond Layout */}
      <div className="flex items-center justify-center px-4 py-6 sm:py-10 relative z-10">
        <div className="grid grid-cols-3 grid-rows-3 gap-3 sm:gap-5 max-w-sm">
          {/* Top - Your Journey (Tasks) */}
          <DiamondCircle
            icon={<Map className="w-8 h-8 sm:w-10 sm:h-10" />}
            label="Your Journey"
            sublabel="Your tasks"
            onClick={() => navigate('/journey')}
            position="top"
            color={colors.journey}
            badge={unseenTasks}
          />

          {/* Left - Performance */}
          <DiamondCircle
            icon={<TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />}
            label="Performance"
            sublabel="Track progress"
            onClick={() => navigate('/performance')}
            position="left"
            color={colors.performance}
          />

          {/* Center - Profile */}
          <DiamondCircle
            icon={<User className="w-12 h-12 sm:w-14 sm:h-14" />}
            label={profileName}
            onClick={() => navigate('/profile')}
            position="center"
            color={colors.profile}
            isCenter={true}
            centerContent={
              <div className="flex flex-col items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: colors.profile }} />
              </div>
            }
          />

          {/* Right - Your Identity (DNA + Best Self) */}
          <DiamondCircle
            icon={<Brain className="w-8 h-8 sm:w-10 sm:h-10" />}
            label="Your Identity"
            sublabel="DNA & Best Self"
            onClick={() => navigate('/identity')}
            position="right"
            color={colors.mindset}
          />

          {/* Bottom - Your Tools */}
          <DiamondCircle
            icon={<Wrench className="w-8 h-8 sm:w-10 sm:h-10" />}
            label="Your Tools"
            sublabel="Mental skills"
            onClick={() => navigate('/tools')}
            position="bottom"
            color={colors.tools}
          />
        </div>
      </div>

      {/* Footer hint */}
      <motion.div 
        className="text-center pb-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-muted-foreground">
          Tap any circle to explore
        </p>
      </motion.div>
    </motion.div>
  );
}
