'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function ChequePreparation() {
  return (
    <WorkflowDashboard
      role="Cheque Preparation"
      title="Cheque Preparation Dashboard"
      subtitle="Prepare cheques for approved claims"
      chartType="area"
      actions={{
        success: { label: 'Cheque Prepared', status: 'Completed' },
      }}
    />
  );
}
