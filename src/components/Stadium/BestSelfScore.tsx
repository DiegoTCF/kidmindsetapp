import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";

interface BestSelfScoreProps {
  score: number;
  onScoreChange: (score: number) => void;
}

export function BestSelfScore({ score, onScoreChange }: BestSelfScoreProps) {
  const handleScoreChange = (value: number[]) => {
    onScoreChange(value[0]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "🔥 Outstanding!";
    if (score >= 80) return "⭐ Excellent!";
    if (score >= 70) return "👍 Great!";
    if (score >= 60) return "✅ Good";
    if (score >= 40) return "🟡 Getting there";
    return "🔴 Room to grow";
  };

  return (
    <Card className="shadow-soft border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Best Self Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-base font-medium">
            How close were you to your best self this week?
          </Label>
          <div className="px-3">
            <Slider
              value={[score]}
              onValueChange={handleScoreChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-sm font-medium">
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          Rate yourself honestly based on your behavior, attitude, and performance compared to the best version of yourself you defined.
        </div>
      </CardContent>
    </Card>
  );
}