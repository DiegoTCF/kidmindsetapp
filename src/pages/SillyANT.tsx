import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SillyANTFlow } from '@/components/SillyANT/SillyANTFlow';

const SillyANT = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SillyANTFlow />
      </div>
    </AppLayout>
  );
};

export default SillyANT;