import { motion } from "framer-motion";
import { User } from "lucide-react";

export type TierType = 'elite' | 'gold' | 'silver' | 'bronze' | 'nodata';

interface PlayerCardProps {
  playerName: string;
  overallRating: number;
  avatarUrl?: string | null;
  hasData: boolean;
  position?: string;
}

const getTier = (rating: number, hasData: boolean): TierType => {
  if (!hasData) return 'nodata';
  if (rating >= 85) return 'elite';
  if (rating >= 75) return 'gold';
  if (rating >= 60) return 'silver';
  return 'bronze';
};

const tierStyles: Record<TierType, {
  cardBg: string;
  frameBorder: string;
  frameGlow: string;
  ratingColor: string;
  labelColor: string;
  accentGradient: string;
  label: string;
}> = {
  elite: {
    cardBg: 'bg-gradient-to-b from-[#2a1f4e] via-[#1a1235] to-[#0f0a1f]',
    frameBorder: 'from-purple-400 via-blue-400 to-cyan-400',
    frameGlow: 'shadow-[0_0_60px_rgba(147,51,234,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
    ratingColor: 'text-white',
    labelColor: 'text-purple-300',
    accentGradient: 'from-purple-400 to-cyan-400',
    label: 'ELITE'
  },
  gold: {
    cardBg: 'bg-gradient-to-b from-[#3d3420] via-[#2a2415] to-[#1a180f]',
    frameBorder: 'from-yellow-300 via-amber-400 to-yellow-500',
    frameGlow: 'shadow-[0_0_60px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
    ratingColor: 'text-white',
    labelColor: 'text-yellow-300',
    accentGradient: 'from-yellow-400 to-amber-500',
    label: 'GOLD'
  },
  silver: {
    cardBg: 'bg-gradient-to-b from-[#2d2d35] via-[#1e1e24] to-[#14141a]',
    frameBorder: 'from-slate-300 via-gray-400 to-slate-500',
    frameGlow: 'shadow-[0_0_60px_rgba(148,163,184,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]',
    ratingColor: 'text-white',
    labelColor: 'text-slate-300',
    accentGradient: 'from-slate-300 to-gray-500',
    label: 'SILVER'
  },
  bronze: {
    cardBg: 'bg-gradient-to-b from-[#3d2a1a] via-[#2a1f15] to-[#1a140f]',
    frameBorder: 'from-orange-400 via-amber-500 to-orange-600',
    frameGlow: 'shadow-[0_0_60px_rgba(217,119,6,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
    ratingColor: 'text-white',
    labelColor: 'text-orange-300',
    accentGradient: 'from-orange-400 to-amber-600',
    label: 'BRONZE'
  },
  nodata: {
    cardBg: 'bg-gradient-to-b from-[#3d1a1a] via-[#2a1515] to-[#1a0f0f]',
    frameBorder: 'from-red-400 via-red-500 to-red-600',
    frameGlow: 'shadow-[0_0_60px_rgba(220,38,38,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
    ratingColor: 'text-white',
    labelColor: 'text-red-300',
    accentGradient: 'from-red-400 to-red-600',
    label: 'NO DATA'
  }
};

export function PlayerCard({ playerName, overallRating, avatarUrl, hasData }: PlayerCardProps) {
  const tier = getTier(overallRating, hasData);
  const styles = tierStyles[tier];
  const displayRating = hasData ? overallRating : '—';

  return (
    <motion.div
      className="relative mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Outer card with metallic frame */}
      <div 
        className={`relative w-72 ${styles.cardBg} ${styles.frameGlow} rounded-lg overflow-hidden`}
        style={{
          clipPath: 'polygon(0 6%, 6% 0, 94% 0, 100% 6%, 100% 94%, 94% 100%, 6% 100%, 0 94%)'
        }}
      >
        {/* Metallic border frame */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b ${styles.frameBorder} opacity-60`}
          style={{
            clipPath: 'polygon(0 6%, 6% 0, 94% 0, 100% 6%, 100% 94%, 94% 100%, 6% 100%, 0 94%)'
          }}
        />
        
        {/* Inner content area */}
        <div 
          className={`relative m-[3px] ${styles.cardBg} p-4`}
          style={{
            clipPath: 'polygon(0 6%, 6% 0, 94% 0, 100% 6%, 100% 94%, 94% 100%, 6% 100%, 0 94%)'
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              repeatDelay: 4,
              duration: 1.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Rating in top left */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`text-6xl font-black ${styles.ratingColor} leading-none drop-shadow-lg`}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              {displayRating}
            </div>
            <div className={`text-sm font-bold ${styles.labelColor} tracking-[0.2em] mt-1`}>
              {styles.label}
            </div>
          </div>

          {/* Photo container with beveled frame */}
          <div className="relative mt-6 mx-auto">
            {/* Photo frame border */}
            <div 
              className={`absolute inset-0 bg-gradient-to-b ${styles.frameBorder} opacity-50`}
              style={{
                clipPath: 'polygon(8% 0, 92% 0, 100% 8%, 100% 100%, 0 100%, 0 8%)'
              }}
            />
            
            {/* Photo container */}
            <div 
              className="relative m-[2px] bg-muted overflow-hidden aspect-[4/5]"
              style={{
                clipPath: 'polygon(8% 0, 92% 0, 100% 8%, 100% 100%, 0 100%, 0 8%)'
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={playerName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-muted to-muted/80">
                  <User className="w-20 h-20 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Photo overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Player name */}
          <div className="mt-4 text-center">
            <h2 className={`text-xl font-bold ${styles.ratingColor} uppercase tracking-[0.15em]`}
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            >
              {playerName}
            </h2>
            
            {/* Accent underline */}
            <div className={`mx-auto mt-3 w-12 h-[3px] rounded-full bg-gradient-to-r ${styles.accentGradient}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
