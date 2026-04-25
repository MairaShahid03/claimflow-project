'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function Dispatching() {
  return (
    <WorkflowDashboard
      role="Dispatching"
      title="Dispatching Dashboard"
      subtitle="Final dispatch of claim documents"
      chartType="area"
      actions={{
        success: { label: 'Dispatched', status: 'Completed' },
      }}
    />
  );
}
