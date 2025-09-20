import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLogging } from "@/hooks/useUserLogging";
import { useChildData } from "@/hooks/useChildData";
import { useLocation } from "react-router-dom";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import ActivityLog from "@/components/Progress/ActivityLog";
import Charts from "@/components/Progress/Charts";
import BehaviourCharts from "@/components/Progress/BehaviourCharts";
import { CoreSkillsHistory } from "@/components/Progress/CoreSkillsHistory";
import { BestSelfTracker } from "@/components/Progress/BestSelfTracker";
const activityFilters = ["All", "Match", "Training", "1to1", "Futsal", "Small Group", "Other"];

export default function Progress() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("activities");
  const { logProgressView } = useUserLogging();
  const { childId, loading } = useChildData();
  const location = useLocation();

  // Log progress view when component mounts
  React.useEffect(() => {
    logProgressView();
  }, [logProgressView]);

  // Handle navigation from BestSelfTracker
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

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
    <div className="min-h-screen bg-background p-4">
      <PlayerViewIndicator />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          📈 Progress
        </h1>
        <p className="text-muted-foreground">
          Track your activities, view stats, and celebrate your growth
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="activities" className="flex-shrink-0 text-xs">Activity Log</TabsTrigger>
          <TabsTrigger value="behaviours" className="flex-shrink-0 text-xs">Super Behaviours</TabsTrigger>
          <TabsTrigger value="stats" className="flex-shrink-0 text-xs">Your Stats</TabsTrigger>
          <TabsTrigger value="core-skills" className="flex-shrink-0 text-xs">Core Skills</TabsTrigger>
          <TabsTrigger value="best-self" className="flex-shrink-0 text-xs">Best Self</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {activityFilters.map(filter => <Button key={filter} variant={selectedFilter === filter ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter(filter)}>
                {filter}
              </Button>)}
          </div>

          <ActivityLog 
            selectedFilter={selectedFilter} 
            childId={childId}
            filterDate={location.state?.filterDate}
            highlightActivityId={location.state?.activityId}
          />
        </TabsContent>

        <TabsContent value="behaviours" className="space-y-6">
          <BehaviourCharts selectedFilter={selectedFilter} childId={childId} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {activityFilters.map(filter => <Button key={filter} variant={selectedFilter === filter ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter(filter)}>
                {filter}
              </Button>)}
          </div>
          
          <Charts selectedFilter={selectedFilter} childId={childId} />
        </TabsContent>

        <TabsContent value="core-skills" className="space-y-6">
          <CoreSkillsHistory />
        </TabsContent>

        <TabsContent value="best-self" className="space-y-6">
          <BestSelfTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}