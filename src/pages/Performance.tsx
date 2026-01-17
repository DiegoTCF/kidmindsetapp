import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChildData } from "@/hooks/useChildData";
import { PlayerViewIndicator } from "@/components/layout/PlayerViewIndicator";
import { BackToHomeButton } from "@/components/layout/BackToHomeButton";
import ActivityLog from "@/components/Progress/ActivityLog";
import Charts from "@/components/Progress/Charts";
import BehaviourCharts from "@/components/Progress/BehaviourCharts";
import { CoreSkillsHistory } from "@/components/Progress/CoreSkillsHistory";
import { BestSelfTracker } from "@/components/Progress/BestSelfTracker";
import { TrendingUp, Building2, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const activityFilters = ["All", "Match", "Training", "1to1", "Futsal", "Small Group", "Other"];

export default function Performance() {
  const navigate = useNavigate();
  const { childId, loading } = useChildData();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeSection, setActiveSection] = useState<'progress' | 'stadium'>('progress');

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
      <BackToHomeButton className="mb-4" />
      <PlayerViewIndicator />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Performance
        </h1>
        <p className="text-muted-foreground">
          Track your progress and manage your activities
        </p>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeSection === 'progress' ? 'default' : 'outline'}
          onClick={() => setActiveSection('progress')}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Progress
        </Button>
        <Button
          variant={activeSection === 'stadium' ? 'default' : 'outline'}
          onClick={() => setActiveSection('stadium')}
          className="flex-1"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Stadium
        </Button>
      </div>

      {/* Progress Section */}
      {activeSection === 'progress' && (
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="activities" className="flex-shrink-0 text-xs">Activity Log</TabsTrigger>
            <TabsTrigger value="behaviours" className="flex-shrink-0 text-xs">Super Behaviours</TabsTrigger>
            <TabsTrigger value="stats" className="flex-shrink-0 text-xs">Your Stats</TabsTrigger>
            <TabsTrigger value="core-skills" className="flex-shrink-0 text-xs">Core Skills</TabsTrigger>
            <TabsTrigger value="best-self" className="flex-shrink-0 text-xs">Best Self</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
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
            <ActivityLog selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="behaviours" className="space-y-6">
            <BehaviourCharts selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {activityFilters.map(filter => (
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
            <Charts selectedFilter={selectedFilter} childId={childId} />
          </TabsContent>

          <TabsContent value="core-skills" className="space-y-6">
            <CoreSkillsHistory />
          </TabsContent>

          <TabsContent value="best-self" className="space-y-6">
            <BestSelfTracker />
          </TabsContent>
        </Tabs>
      )}

      {/* Stadium Section */}
      {activeSection === 'stadium' && (
        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Your Stadium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Create new activities and track your sessions here.
              </p>
              
              <Button 
                onClick={() => navigate('/stadium')} 
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Activity
              </Button>

              <Button 
                variant="outline"
                onClick={() => navigate('/stadium')} 
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Full Stadium
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
