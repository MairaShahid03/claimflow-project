import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function ZHSPage() {
  return (
    <WorkflowDashboard
      role="ZHS"
      title="ZHS Dashboard"
      subtitle="Zonal Head Secretary approval stage"
      chartType="bar"
      actions={{
        success: { label: 'Approve', status: 'Completed' },
        error: { label: 'Disapprove', status: 'Disapproved' },
      }}
    />
  );
}
