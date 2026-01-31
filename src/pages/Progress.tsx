import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLogging } from "@/hooks/useUserLogging";
import { useChildData } from "@/hooks/useChildData";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import ActivityLog from "@/components/Progress/ActivityLog";
import Charts from "@/components/Progress/Charts";
import BehaviourCharts from "@/components/Progress/BehaviourCharts";
import { CoreSkillsHistory } from "@/components/Progress/CoreSkillsHistory";
import { BestSelfTracker } from "@/components/Progress/BestSelfTracker";
import { ProgressPlayerCard } from "@/components/Progress/ProgressPlayerCard";
import { FloatingParticles } from "@/components/Home/GameEffects";
import { BottomNav } from "@/components/nav/BottomNav";
import { TrendingUp } from "lucide-react";
import stadiumBackground from "@/assets/stadium-background.jpg";

const activityFilters = ["All", "Match", "Training", "1to1", "Futsal", "Small Group", "Other"];

export default function Progress() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { logProgressView } = useUserLogging();
  const { childId, loading } = useChildData();

  // Log progress view when component mounts
  React.useEffect(() => {
    logProgressView();
  }, [logProgressView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Stadium Background with Effects */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${stadiumBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/98" />
        <div className="absolute inset-0 hex-pattern opacity-20" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 flex-1 p-4 pb-28">
        <PlayerViewIndicator />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 
              className="text-2xl font-bold text-foreground tracking-wide"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              PROGRESS
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Track your activities, view stats, and celebrate your growth
          </p>
        </div>

        {/* FIFA-style Player Card at the top */}
        <div className="flex justify-center mb-6">
          <ProgressPlayerCard />
        </div>

        {/* Tabs with FIFA styling */}
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
            <TabsTrigger 
              value="activities" 
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              Activity Log
            </TabsTrigger>
            <TabsTrigger 
              value="behaviours" 
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              Behaviours
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              Stats
            </TabsTrigger>
            <TabsTrigger 
              value="core-skills" 
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              Core Skills
            </TabsTrigger>
            <TabsTrigger 
              value="best-self" 
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              Best Self
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
                <Button 
                  key={filter} 
                  variant={selectedFilter === filter ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedFilter(filter)}
                  className={selectedFilter === filter 
                    ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 font-bold" 
                    : "bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50"
                  }
                >
                  {filter}
                </Button>
              ))}
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <ActivityLog selectedFilter={selectedFilter} childId={childId} />
            </div>
          </TabsContent>

          <TabsContent value="behaviours" className="space-y-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <BehaviourCharts selectedFilter={selectedFilter} childId={childId} />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
                <Button 
                  key={filter} 
                  variant={selectedFilter === filter ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedFilter(filter)}
                  className={selectedFilter === filter 
                    ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 font-bold" 
                    : "bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50"
                  }
                >
                  {filter}
                </Button>
              ))}
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <Charts selectedFilter={selectedFilter} childId={childId} />
            </div>
          </TabsContent>

          <TabsContent value="core-skills" className="space-y-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <CoreSkillsHistory />
            </div>
          </TabsContent>

          <TabsContent value="best-self" className="space-y-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
              <BestSelfTracker />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}