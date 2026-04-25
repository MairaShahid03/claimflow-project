'use client';
import React from 'react';
import WorkflowDashboard from '@/components/WorkflowDashboard';

export default function ClaimPaymentVoucher() {
  return (
    <WorkflowDashboard
      role="Claim Payment Voucher"
      title="Claim Payment Voucher Dashboard"
      subtitle="Generate payment vouchers for approved claims"
      chartType="area"
      actions={{
        success: { label: 'Generate Voucher', status: 'Completed' },
      }}
    />
  );
}
