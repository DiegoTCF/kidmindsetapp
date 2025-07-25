import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalsManager } from '@/components/Goals/GoalsManager';

const Goals = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <GoalsManager />
      </div>
    </AppLayout>
  );
};

export default Goals;