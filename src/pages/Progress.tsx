import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLogging } from "@/hooks/useUserLogging";
import ActivityLog from "@/components/Progress/ActivityLog";
import Charts from "@/components/Progress/Charts";
import BehaviourCharts from "@/components/Progress/BehaviourCharts";

const activityFilters = [
  "All",
  "Match", 
  "Training",
  "1to1",
  "Futsal",
  "Small Group",
  "Other"
];

export default function Progress() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { logProgressView } = useUserLogging();

  // Log progress view when component mounts
  React.useEffect(() => {
    logProgressView();
  }, [logProgressView]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          📈 Progress
        </h1>
        <p className="text-muted-foreground">
          Track your activities, view stats, and celebrate your growth
        </p>
      </div>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="behaviours">Super Behaviours</TabsTrigger>
          <TabsTrigger value="stats">Stats & Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {activityFilters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          <ActivityLog selectedFilter={selectedFilter} />
        </TabsContent>

        <TabsContent value="behaviours" className="space-y-6">
          <BehaviourCharts selectedFilter={selectedFilter} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {activityFilters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <Charts selectedFilter={selectedFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}