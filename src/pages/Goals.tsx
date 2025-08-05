import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalSettingFlow } from '@/components/Goals/GoalSettingFlow';
import { SillyANTFlow } from '@/components/SillyANT/SillyANTFlow';
import { ContentUpload } from '@/components/Content/ContentUpload';

const Goals = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">🎯 GOAL SETTING</TabsTrigger>
            <TabsTrigger value="ant">🐜 MEET MY SILLY ANT</TabsTrigger>
            <TabsTrigger value="content">📚 CONTENT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals">
            <GoalSettingFlow />
          </TabsContent>
          
          <TabsContent value="ant">
            <SillyANTFlow />
          </TabsContent>
          
          <TabsContent value="content">
            <ContentUpload />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Goals;