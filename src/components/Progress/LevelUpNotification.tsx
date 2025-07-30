import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LevelUpNotificationProps {
  isVisible: boolean;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isVisible,
  newLevel,
  onClose
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getLevelTitle = (level: number) => {
    if (level === 2) return "Goal Getter";
    if (level === 3) return "Champion";
    if (level === 4) return "Legend";
    if (level === 5) return "SuperStar";
    if (level >= 6) return "Elite Master";
    return "Rising Star";
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return "from-yellow-400 to-yellow-600";
    if (level <= 4) return "from-orange-400 to-orange-600";
    if (level <= 6) return "from-purple-400 to-purple-600";
    return "from-gold-400 to-gold-600";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`mx-4 max-w-sm w-full overflow-hidden ${
        showAnimation ? 'animate-bounce-in' : ''
      }`}>
        <CardContent className="p-6 text-center relative">
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse" />
          
          {/* Content */}
          <div className="relative z-10 space-y-4">
            {/* Trophy icon with sparkles */}
            <div className="relative flex justify-center">
              <div className={`p-4 rounded-full bg-gradient-to-r ${getLevelColor(newLevel)} shadow-xl`}>
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
              <Star className="absolute -bottom-1 -left-1 h-4 w-4 text-yellow-400 animate-pulse" />
            </div>

            {/* Level up text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground animate-glow">
                🎉 LEVEL UP! 🎉
              </h2>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary">
                  Level {newLevel}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {getLevelTitle(newLevel)}
                </p>
              </div>
            </div>

            {/* Congratulations message */}
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">
                Incredible work! You've earned your way to the next level!
              </p>
              <p className="text-xs text-muted-foreground">
                Keep completing activities and daily tasks to reach even higher levels!
              </p>
            </div>

            {/* Close button */}
            <Button 
              onClick={onClose}
              variant="default"
              className="w-full mt-4"
            >
              Continue Playing! 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};