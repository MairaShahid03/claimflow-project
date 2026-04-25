'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function AuditorPage() {
  return (
    <WorkflowDashboard
      role="Auditor"
      title="Auditor Dashboard"
      subtitle="Audit claims for compliance and accuracy"
      chartType="bar"
      actions={{
        success: { label: 'Pass Audit', status: 'Completed' },
        error: { label: 'Reject', status: 'Rejected' },
      }}
    />
  );
}
