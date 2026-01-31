import { useEffect, useState } from "react";
import { Star, Zap, Trophy, Target } from "lucide-react";

// Animated floating particles
export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    type: 'star' | 'circle' | 'diamond';
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      type: ['star', 'circle', 'diamond'][Math.floor(Math.random() * 3)] as 'star' | 'circle' | 'diamond'
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float opacity-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.type === 'star' && (
            <Star className="w-full h-full text-gold fill-gold/50" />
          )}
          {particle.type === 'circle' && (
            <div className="w-full h-full rounded-full bg-primary/60" />
          )}
          {particle.type === 'diamond' && (
            <div className="w-full h-full rotate-45 bg-cyan/60" />
          )}
        </div>
      ))}
    </div>
  );
}

// Level/XP Progress Bar
interface LevelProgressProps {
  level: number;
  points: number;
  maxPoints?: number;
}

export function LevelProgress({ level, points, maxPoints = 1000 }: LevelProgressProps) {
  const progressPercent = Math.min((points % maxPoints) / maxPoints * 100, 100);
  const pointsToNextLevel = maxPoints - (points % maxPoints);

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Level Badge */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gold/30 blur-md animate-pulse-glow" />
          
          {/* Level badge */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 via-gold to-gold-600 
                          flex items-center justify-center shadow-lg shadow-gold/30 border-2 border-gold-400/50">
            <div className="text-center">
              <span className="text-xs font-bold text-background/80 block leading-none">LVL</span>
              <span 
                className="text-lg font-black text-background block leading-none"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {level}
              </span>
            </div>
          </div>
        </div>

        {/* XP Display */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground font-medium">XP PROGRESS</span>
            <span className="text-gold font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {points.toLocaleString()} XP
            </span>
          </div>
          
          {/* XP Bar */}
          <div className="relative h-4 rounded-full overflow-hidden bg-muted/50 border border-gold/20">
            {/* Animated shimmer background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
                 style={{ backgroundSize: '200% 100%' }} />
            
            {/* Progress fill */}
            <div 
              className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold to-gold-400 transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glow effect on edge */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/40 blur-sm" />
            </div>
            
            {/* Tick marks */}
            <div className="absolute inset-0 flex">
              {[25, 50, 75].map((mark) => (
                <div 
                  key={mark}
                  className="absolute top-0 bottom-0 w-px bg-background/30"
                  style={{ left: `${mark}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1 text-right">
            <Zap className="w-3 h-3 inline mr-1 text-gold" />
            {pointsToNextLevel} XP to Level {level + 1}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Stats Row
interface QuickStatsProps {
  stats: {
    matches?: number;
    goals?: number;
    achievements?: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statItems = [
    { icon: Target, label: 'Sessions', value: stats.matches || 0, color: 'text-cyan' },
    { icon: Zap, label: 'Goals Set', value: stats.goals || 0, color: 'text-gold' },
    { icon: Trophy, label: 'Badges', value: stats.achievements || 0, color: 'text-primary' },
  ];

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {statItems.map((stat, index) => (
        <div 
          key={stat.label}
          className="flex flex-col items-center p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50
                     hover:border-primary/30 hover:bg-card/80 transition-all duration-300 min-w-[70px]"
        >
          <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
          <span 
            className="text-lg font-black text-foreground"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {stat.value}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Animated Power Ring around card
export function PowerRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Outer rotating glow */}
      <div className="absolute -inset-4 rounded-3xl opacity-60">
        <div 
          className="absolute inset-0 rounded-3xl bg-gradient-conic from-primary via-gold to-cyan animate-spin"
          style={{ 
            animationDuration: '8s',
            filter: 'blur(20px)'
          }}
        />
      </div>
      
      {/* Inner static glow */}
      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-gold/20 blur-xl" />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
