'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function CPVChecking() {
  return (
    <WorkflowDashboard
      role="CPV Checking"
      title="CPV Checking Dashboard"
      subtitle="Verify claim payment vouchers for accuracy"
      chartType="area"
      actions={{
        success: { label: 'Checked', status: 'Completed' },
        error: { label: 'Error', status: 'Error' },
      }}
      requiresReason
    />
  );
}
