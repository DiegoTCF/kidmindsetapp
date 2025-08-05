import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalSettingFlow } from '@/components/Goals/GoalSettingFlow';
import { SillyANTFlow } from '@/components/SillyANT/SillyANTFlow';
import { IdentityBuilder } from '@/components/Goals/IdentityBuilder';

const Goals = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identity">🏆 IDENTITY BUILDER</TabsTrigger>
            <TabsTrigger value="goals">🎯 GOAL SETTING</TabsTrigger>
            <TabsTrigger value="ant">🐜 MEET MY SILLY ANT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="identity">
            <IdentityBuilder />
          </TabsContent>
          
          <TabsContent value="goals">
            <GoalSettingFlow />
          </TabsContent>
          
          <TabsContent value="ant">
            <SillyANTFlow />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Goals;