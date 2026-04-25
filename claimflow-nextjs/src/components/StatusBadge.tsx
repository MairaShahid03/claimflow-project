import React from 'react';
import { ClaimStatus } from '@/contexts/ClaimContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: ClaimStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isCompleted = status === 'Completed';
  
  const isError = ['Missing', 'Error', 'Objected', 'Disapproved', 'Rejected'].includes(status);

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success">
        <CheckCircle size={14} /> {status}
      </span>
    );
  }

  if (isError) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
        <XCircle size={14} /> {status}
      </span>
    );
  }

  // Pending
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
      <Clock size={14} /> {status}
    </span>
  );
}
