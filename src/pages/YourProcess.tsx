import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelfWorthTracker } from '@/components/Process/SelfWorthTracker';
import { GoalTracker } from '@/components/Process/GoalTracker';
import { RoutineTracker } from '@/components/Process/RoutineTracker';
import { BehaviourTracker } from '@/components/Process/BehaviourTracker';
import { ANTsTracker } from '@/components/Process/ANTsTracker';
import { ResilienceTracker } from '@/components/Process/ResilienceTracker';
import { Badge } from '@/components/ui/badge';

const YourProcess = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="heading-coach text-4xl md:text-5xl mb-4 text-gradient-primary">
            YOUR PROCESS
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            "What you need to improve on your development journey"
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="text-lg px-4 py-2 border-primary/30">
              Building Confidence Through Core Skills
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="identity" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">1</span>
              <span>IDENTITY</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">2</span>
              <span>GOALS</span>
            </TabsTrigger>
            <TabsTrigger value="routine" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">3</span>
              <span>ROUTINE</span>
            </TabsTrigger>
            <TabsTrigger value="behaviours" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">4</span>
              <span>BEHAVIOURS</span>
            </TabsTrigger>
            <TabsTrigger value="ants" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">5</span>
              <span>MIND ANTs</span>
            </TabsTrigger>
            <TabsTrigger value="resilience" className="text-xs px-2 py-3 flex flex-col gap-1">
              <span className="font-bold">6</span>
              <span>RESILIENCE</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity">
            <SelfWorthTracker />
          </TabsContent>

          <TabsContent value="goals">
            <GoalTracker />
          </TabsContent>

          <TabsContent value="routine">
            <RoutineTracker />
          </TabsContent>

          <TabsContent value="behaviours">
            <BehaviourTracker />
          </TabsContent>

          <TabsContent value="ants">
            <ANTsTracker />
          </TabsContent>

          <TabsContent value="resilience">
            <ResilienceTracker />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default YourProcess;