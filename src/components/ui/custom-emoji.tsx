import { cn } from "@/lib/utils";

interface CustomEmojiProps {
  type: 'sad' | 'not-great' | 'okay' | 'good' | 'amazing' | 'target' | 'home' | 'stadium' | 'progress';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const emojiStyles = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

const emojiMap = {
  sad: '😢',
  'not-great': '😕',
  okay: '😐',
  good: '😊',
  amazing: '😁',
  target: '🎯',
  home: '🏠',
  stadium: '🏟️',
  progress: '📈'
};

export function CustomEmoji({ type, size = 'md', className }: CustomEmojiProps) {
  return (
    <span 
      className={cn(
        "font-bold inline-block transition-all duration-200",
        emojiStyles[size],
        className
      )}
      style={{
        color: '#ff0066',
        filter: 'brightness(1) contrast(1.1)',
        textShadow: 'none'
      }}
      role="img"
      aria-label={type}
    >
      {emojiMap[type]}
    </span>
  );
}