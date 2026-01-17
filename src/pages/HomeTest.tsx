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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, hsl(0, 0%, 8%) 0%, hsl(0, 0%, 12%) 25%, hsl(0, 85%, 15%) 50%, hsl(0, 0%, 10%) 75%, hsl(0, 0%, 5%) 100%)'
        }}
      >
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
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(0, 0%, 8%) 0%, hsl(0, 0%, 12%) 25%, hsl(0, 85%, 15%) 50%, hsl(0, 0%, 10%) 75%, hsl(0, 0%, 5%) 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(0, 85%, 50%, 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0, 85%, 50%, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glowing orbs for gamified effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top right red glow */}
        <motion.div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(0, 85%, 50%, 0.4) 0%, hsl(0, 85%, 40%, 0.2) 30%, transparent 70%)' }}
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.4, 0.6, 0.4],
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bottom left dark glow */}
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(0, 0%, 0%, 0.8) 0%, hsl(0, 0%, 0%, 0.4) 40%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Center subtle red pulse */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(0, 85%, 50%, 0.15) 0%, transparent 60%)' }}
          animate={{ 
            scale: [0.8, 1, 0.8], 
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? 'hsl(0, 85%, 50%)' : 'hsl(0, 0%, 100%)',
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              boxShadow: i % 2 === 0 ? '0 0 10px hsl(0, 85%, 50%)' : '0 0 8px hsl(0, 0%, 100%)'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(0, 0%, 0%, 0.6) 100%)'
        }}
      />

      {/* Header */}
      <motion.div 
        className="text-center pt-8 pb-4 px-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center gap-3 mb-3">
          <motion.img 
            src="/lovable-uploads/confident-footballer-logo.png" 
            alt="The Confident Footballer Logo" 
            className="h-20 sm:h-24 w-auto drop-shadow-2xl"
            whileHover={{ scale: 1.05 }}
            animate={{
              filter: ['drop-shadow(0 0 20px hsl(0, 85%, 50%, 0.3))', 'drop-shadow(0 0 30px hsl(0, 85%, 50%, 0.5))', 'drop-shadow(0 0 20px hsl(0, 85%, 50%, 0.3))']
            }}
            transition={{
              filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        </div>
        <motion.p 
          className="text-white/80 text-base font-medium"
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
        className="text-center pb-8 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-white/50">
          Tap any circle to explore
        </p>
      </motion.div>
    </motion.div>
  );
}
