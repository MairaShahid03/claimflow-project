import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function FAIncharge() {
  return (
    <WorkflowDashboard
      role="F&A Incharge"
      title="F&A Incharge Dashboard"
      subtitle="Finance & Accounts approval stage"
      chartType="bar"
      actions={{
        success: { label: 'Approve', status: 'Completed' },
        error: { label: 'Object', status: 'Objected' },
      }}
    />
  );
}
