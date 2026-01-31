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
  borderGradient: string;
  glowColor: string;
  glowRgba: string;
  textGlow: string;
  label: string;
}> = {
  elite: {
    borderGradient: 'linear-gradient(135deg, #ffd700 0%, #ffb800 25%, #ff9500 50%, #ffb800 75%, #ffd700 100%)',
    glowColor: '#ffd700',
    glowRgba: 'rgba(255, 215, 0, 0.5)',
    textGlow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)',
    label: 'ELITE'
  },
  gold: {
    borderGradient: 'linear-gradient(135deg, #f5c542 0%, #d4a84b 25%, #c9963c 50%, #d4a84b 75%, #f5c542 100%)',
    glowColor: '#f5c542',
    glowRgba: 'rgba(245, 197, 66, 0.45)',
    textGlow: '0 0 20px rgba(245, 197, 66, 0.8), 0 0 40px rgba(245, 197, 66, 0.4)',
    label: 'GOLD'
  },
  silver: {
    borderGradient: 'linear-gradient(135deg, #e8eaed 0%, #c0c7d4 25%, #9ca3af 50%, #c0c7d4 75%, #e8eaed 100%)',
    glowColor: '#c0c7d4',
    glowRgba: 'rgba(192, 199, 212, 0.45)',
    textGlow: '0 0 20px rgba(192, 199, 212, 0.8), 0 0 40px rgba(192, 199, 212, 0.4)',
    label: 'SILVER'
  },
  bronze: {
    borderGradient: 'linear-gradient(135deg, #cd7f32 0%, #b87333 25%, #a0522d 50%, #b87333 75%, #cd7f32 100%)',
    glowColor: '#cd7f32',
    glowRgba: 'rgba(205, 127, 50, 0.4)',
    textGlow: '0 0 20px rgba(205, 127, 50, 0.8), 0 0 40px rgba(205, 127, 50, 0.4)',
    label: 'BRONZE'
  },
  nodata: {
    borderGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #b91c1c 50%, #dc2626 75%, #ef4444 100%)',
    glowColor: '#ef4444',
    glowRgba: 'rgba(239, 68, 68, 0.4)',
    textGlow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)',
    label: 'NO DATA'
  }
};

const clipPath = 'polygon(0 8%, 50% 0, 100% 8%, 100% 92%, 50% 100%, 0 92%)';

export function PlayerCard({ playerName, overallRating, avatarUrl, hasData }: PlayerCardProps) {
  const tier = getTier(overallRating, hasData);
  const styles = tierStyles[tier];
  const displayRating = hasData ? overallRating : '—';

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 240 }}
      initial={{ opacity: 0, rotateY: -15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -6 }}
    >
      {/* Pulsing outer glow */}
      <motion.div
        className="absolute inset-0 blur-2xl rounded-2xl"
        style={{
          background: styles.glowRgba,
          clipPath,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [0.98, 1.03, 0.98],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Drop shadow */}
      <div
        className="absolute inset-0 blur-2xl opacity-60 translate-y-4"
        style={{
          background: styles.glowRgba,
          clipPath,
        }}
      />

      {/* Card container */}
      <div
        className="relative overflow-hidden"
        style={{
          clipPath,
          aspectRatio: '3/4',
          borderRadius: 16,
        }}
      >
        {/* Metallic gradient border (3px) */}
        <div
          className="absolute inset-0"
          style={{
            background: styles.borderGradient,
            clipPath,
          }}
        />

        {/* Inner card */}
        <div
          className="absolute inset-[3px] bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] overflow-hidden"
          style={{
            clipPath,
            borderRadius: 14,
          }}
        >
          {/* Background photo */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={playerName}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#2a2a4a] to-[#1a1a2e]">
              <User 
                className="w-24 h-24 opacity-30"
                style={{ color: styles.glowColor }}
              />
            </div>
          )}

          {/* Dark gradient overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.85) 100%)'
            }}
          />

          {/* Top vignette for rating */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)'
            }}
          />

          {/* Holographic shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />

          {/* Rating display - top left */}
          <motion.div
            className="absolute top-4 left-4 z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div
              className="text-5xl font-black text-white leading-none"
              style={{ textShadow: styles.textGlow }}
            >
              {displayRating}
            </div>
            <div
              className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1"
              style={{ 
                color: styles.glowColor,
                textShadow: styles.textGlow 
              }}
            >
              {styles.label}
            </div>
          </motion.div>

          {/* Player name - bottom */}
          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center z-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Decorative line above name */}
            <div
              className="w-16 h-[2px] mx-auto mb-2 rounded-full"
              style={{ background: styles.borderGradient }}
            />
            
            <h2
              className="text-lg font-bold text-white uppercase tracking-wider truncate"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              {playerName}
            </h2>

            {/* Accent line below name */}
            <div
              className="w-10 h-[2px] mx-auto mt-2 rounded-full"
              style={{ background: styles.borderGradient }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
