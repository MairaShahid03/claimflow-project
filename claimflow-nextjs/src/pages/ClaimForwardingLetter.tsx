'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function ClaimForwardingLetter() {
  return (
    <WorkflowDashboard
      role="Claim Forwarding Letter"
      title="Claim Forwarding Letter Dashboard"
      subtitle="Forward claim letters to dispatching"
      chartType="area"
      actions={{
        success: { label: 'Letter Forwarded', status: 'Completed' },
      }}
    />
  );
}
