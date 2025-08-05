import React from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProcessedAvatar } from '@/components/ui/ProcessedAvatar';

interface LevelProgressCardProps {
  currentLevel: number;
  totalPoints: number;
  playerName: string;
  showLevelUpAnimation?: boolean;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  currentLevel,
  totalPoints,
  playerName,
  showLevelUpAnimation = false
}) => {
  // Calculate points in current level and progress to next level
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const pointsToNextLevel = 100 - pointsInCurrentLevel;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  const getLevelIcon = (level: number) => {
    if (level === 1) return <Star className="h-6 w-6 text-yellow-500" />;
    if (level <= 3) return <Zap className="h-6 w-6 text-orange-500" />;
    return <Trophy className="h-6 w-6 text-gold-500" />;
  };

  const getLevelColor = (level: number) => {
    if (level === 1) return "from-yellow-400 to-yellow-600";
    if (level <= 3) return "from-orange-400 to-orange-600";
    if (level <= 5) return "from-purple-400 to-purple-600";
    return "from-gold-400 to-gold-600";
  };

  const getLevelBadgeText = (level: number) => {
    if (level === 1) return "Rising Star";
    if (level === 2) return "Goal Getter";
    if (level === 3) return "Champion";
    if (level === 4) return "Legend";
    if (level === 5) return "SuperStar";
    return "Elite Master";
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 ${
      showLevelUpAnimation ? 'ring-4 ring-gold-500 animate-pulse' : ''
    }`}>
      <CardContent className="p-6">
        {/* Level Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ProcessedAvatar 
              className="w-16 h-16 rounded-full shadow-lg"
            />
            <div>
              <h3 className="text-lg font-bold text-foreground">{playerName}</h3>
              <p className="text-sm text-muted-foreground">{getLevelBadgeText(currentLevel)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">Level {currentLevel}</div>
            <div className="text-sm text-muted-foreground">{totalPoints} total points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
            <span className="font-medium text-primary">{pointsInCurrentLevel}/100</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-muted"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {currentLevel}</span>
            <span className="text-primary font-medium">
              {pointsToNextLevel > 0 ? `${pointsToNextLevel} points to go!` : 'Level up!'}
            </span>
            <span>Level {currentLevel + 1}</span>
          </div>
        </div>

        {/* Level Up Animation */}
        {showLevelUpAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-gold-400/20 to-yellow-400/20 animate-pulse pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-2xl font-bold text-gold-600 animate-bounce">
                🎉 LEVEL UP! 🎉
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};