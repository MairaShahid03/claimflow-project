import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function PHSIncharge() {
  return (
    <WorkflowDashboard
      role="PHS Incharge"
      title="PHS Incharge Dashboard"
      subtitle="Approve or object claims at PHS level"
      chartType="bar"
      actions={{
        success: { label: 'Approve', status: 'Completed' },
        error: { label: 'Object', status: 'Objected' },
      }}
    />
  );
}
