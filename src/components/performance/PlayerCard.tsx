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
  gradient: string;
  glow: string;
  border: string;
  text: string;
  label: string;
}> = {
  elite: {
    gradient: 'from-purple-500 via-blue-500 to-cyan-400',
    glow: 'shadow-[0_0_40px_rgba(147,51,234,0.5)]',
    border: 'border-purple-400',
    text: 'text-purple-300',
    label: 'ELITE'
  },
  gold: {
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.5)]',
    border: 'border-yellow-400',
    text: 'text-yellow-300',
    label: 'GOLD'
  },
  silver: {
    gradient: 'from-slate-300 via-gray-400 to-slate-500',
    glow: 'shadow-[0_0_40px_rgba(148,163,184,0.4)]',
    border: 'border-slate-400',
    text: 'text-slate-300',
    label: 'SILVER'
  },
  bronze: {
    gradient: 'from-orange-400 via-amber-600 to-yellow-700',
    glow: 'shadow-[0_0_40px_rgba(217,119,6,0.4)]',
    border: 'border-orange-500',
    text: 'text-orange-300',
    label: 'BRONZE'
  },
  nodata: {
    gradient: 'from-red-600 via-red-700 to-red-900',
    glow: 'shadow-[0_0_40px_rgba(220,38,38,0.4)]',
    border: 'border-red-500',
    text: 'text-red-300',
    label: 'NO DATA'
  }
};

export function PlayerCard({ playerName, overallRating, avatarUrl, hasData, position = 'CAM' }: PlayerCardProps) {
  const tier = getTier(overallRating, hasData);
  const styles = tierStyles[tier];
  const displayRating = hasData ? overallRating : '—';

  return (
    <motion.div
      className="relative mx-auto w-64"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Card container with FIFA clip-path */}
      <div
        className={`relative bg-gradient-to-b ${styles.gradient} ${styles.glow} overflow-hidden`}
        style={{
          clipPath: 'polygon(0 8%, 50% 0, 100% 8%, 100% 92%, 50% 100%, 0 92%)',
          aspectRatio: '3/4'
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3,
            duration: 1.5,
            ease: "easeInOut"
          }}
        />

        {/* Inner card content */}
        <div className="absolute inset-2 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-between py-6 px-4"
          style={{
            clipPath: 'polygon(0 8%, 50% 0, 100% 8%, 100% 92%, 50% 100%, 0 92%)'
          }}
        >
          {/* Rating and Position */}
          <div className="flex items-start justify-between w-full px-2">
            <div className="text-left">
              <div className={`text-4xl font-black ${styles.text}`}>
                {displayRating}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {position}
              </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded ${styles.text} bg-white/10`}>
              {styles.label}
            </div>
          </div>

          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${styles.border} bg-muted flex items-center justify-center`}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={playerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          {/* Player Name */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide truncate max-w-full">
              {playerName}
            </h2>
            <div className={`text-xs ${styles.text} uppercase tracking-widest mt-1`}>
              The Confident Footballer
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className={`w-16 h-0.5 bg-gradient-to-r ${styles.gradient} rounded-full`} />
        </div>
      </div>
    </motion.div>
  );
}
