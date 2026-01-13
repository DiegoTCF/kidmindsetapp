import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import { Wrench, Brain, Target, Eye, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  delay?: number;
}

const ToolCard = ({ title, description, icon, onClick, color, delay = 0 }: ToolCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Button
      variant="outline"
      className="w-full h-auto p-4 text-left border-2 hover:border-primary/30 hover:opacity-80 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 w-full">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Button>
  </motion.div>
);

export default function Tools() {
  const navigate = useNavigate();

  const openExternalLink = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tools = [
    {
      title: "Yoga",
      description: "Stretch and prepare your body before activity",
      icon: <Heart className="w-6 h-6" />,
      onClick: () => openExternalLink('https://www.youtube.com/watch?v=3lfBP1OdoG0'),
      color: 'hsl(340, 80%, 55%)',
    },
    {
      title: "Visualization",
      description: "Mental preparation techniques for peak performance",
      icon: <Eye className="w-6 h-6" />,
      onClick: () => openExternalLink('https://drive.google.com/file/d/12tItFhl7cqpjuPpjDwO_WRHDy_9ZOOK0/view'),
      color: 'hsl(200, 80%, 55%)',
    },
    {
      title: "Confidence Check",
      description: "Quick check-in before your activity",
      icon: <Sparkles className="w-6 h-6" />,
      onClick: () => navigate('/confidence-check'),
      color: 'hsl(45, 100%, 50%)',
    },
    {
      title: "Best Self Reflection",
      description: "Visualize and connect with your best performance",
      icon: <Brain className="w-6 h-6" />,
      onClick: () => navigate('/best-self'),
      color: 'hsl(280, 80%, 60%)',
    },
    {
      title: "Core Skills Self-Assessment",
      description: "Evaluate your mental game skills",
      icon: <Target className="w-6 h-6" />,
      onClick: () => navigate('/core-skills/self-assessment'),
      color: 'hsl(0, 100%, 50%)',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <PlayerViewIndicator />
      
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-primary" />
          Your Tools
        </h1>
        <p className="text-muted-foreground">
          Mental and physical preparation tools to help you perform at your best
        </p>
      </motion.div>

      {/* Tools Grid */}
      <div className="space-y-3">
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.title}
            {...tool}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-6"
      >
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 Quick Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use these tools 15-30 minutes before your activity for the best results. 
              Consistent preparation builds confidence and helps you perform at your peak!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
