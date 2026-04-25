import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function ClaimIncharge() {
  return (
    <WorkflowDashboard
      role="Claim Incharge"
      title="Claim Incharge Dashboard"
      subtitle="Approve or object claims before forwarding"
      chartType="bar"
      actions={{
        success: { label: 'Approve', status: 'Completed' },
        error: { label: 'Object', status: 'Objected' },
      }}
    />
  );
}
