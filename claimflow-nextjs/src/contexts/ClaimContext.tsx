'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Role } from './AuthContext';

export type ClaimStatus = 'Pending' | 'Completed' | 'Missing' | 'Error' | 'Objected' | 'Disapproved' | 'Rejected';

export interface ClaimStageEntry {
  role: Role;
  status: ClaimStatus;
  timestamp: string;
  reason?: string;
}

export interface Claim {
  claimNo: string;
  currentStage: Role;
  stages: ClaimStageEntry[];
  missingDocs?: string[];
}

export interface Notification {
  id: string;
  role: Role;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ClaimContextType {
  claims: Claim[];
  notifications: Notification[];
  addClaim: (claimNo: string) => void;
  updateClaimStatus: (claimNo: string, role: Role, status: ClaimStatus, reason?: string) => void;
  setMissingDocs: (claimNo: string, docs: string[]) => void;
  getClaimsForRole: (role: Role) => Claim[];
  getNotificationsForRole: (role: Role) => Notification[];
  markNotificationRead: (id: string) => void;
  searchClaim: (query: string, role: Role) => Claim[];
}

const WORKFLOW_ORDER: Role[] = [
  'Claim Intimation',
  'Requirements Manager',
  'Claim Payment Voucher',
  'CPV Checking',
  'Claim Incharge',
  'PHS Incharge',
  'F&A Incharge',
  'Auditor',
  'ZHS',
  'Cheque Preparation',
  'Claim Forwarding Letter',
  'Dispatching',
];

function getNextRole(current: Role): Role | null {
  const idx = WORKFLOW_ORDER.indexOf(current);
  if (idx === -1 || idx >= WORKFLOW_ORDER.length - 1) return null;
  return WORKFLOW_ORDER[idx + 1];
}

const ClaimContext = createContext<ClaimContextType | null>(null);

export function ClaimProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((role: Role, message: string) => {
    setNotifications(prev => [
      {
        id: Date.now().toString() + Math.random(),
        role,
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const addClaim = useCallback((claimNo: string) => {
    const now = new Date().toLocaleString();
    const newClaim: Claim = {
      claimNo,
      currentStage: 'Requirements Manager',
      stages: [
        { role: 'Claim Intimation', status: 'Completed', timestamp: now },
      ],
    };
    setClaims(prev => [...prev, newClaim]);
    addNotification('Requirements Manager', `Claim ${claimNo}: New claim intimated. Ready for requirements review.`);
  }, [addNotification]);

  const updateClaimStatus = useCallback((claimNo: string, role: Role, status: ClaimStatus, reason?: string) => {
    setClaims(prev => prev.map(c => {
      if (c.claimNo !== claimNo) return c;
      const now = new Date().toLocaleString();
      const newStage: ClaimStageEntry = { role, status, timestamp: now, reason };
      const isSuccess = status === 'Completed';
      const nextRole = isSuccess ? getNextRole(role) : null;

      const updated: Claim = {
        ...c,
        stages: [...c.stages, newStage],
        currentStage: nextRole || role,
      };

      if (isSuccess && nextRole) {
        addNotification(nextRole, `Claim ${claimNo}: Ready for ${nextRole} review.`);
      }

      return updated;
    }));
  }, [addNotification]);

  const setMissingDocs = useCallback((claimNo: string, docs: string[]) => {
    setClaims(prev => prev.map(c =>
      c.claimNo === claimNo ? { ...c, missingDocs: docs } : c
    ));
  }, []);

  const getClaimsForRole = useCallback((role: Role): Claim[] => {
    if (role === 'Claim Intimation') {
      return claims.filter(c => c.stages.some(s => s.role === 'Claim Intimation'));
    }
    if (role === 'Zonal Head') return claims;
    // Show all claims that have reached this role OR were acted upon by this role
    return claims.filter(c => {
      const hasActed = c.stages.some(s => s.role === role);
      const isCurrentStage = c.currentStage === role;
      return hasActed || isCurrentStage;
    });
  }, [claims]);

  const getNotificationsForRole = useCallback((role: Role) => {
    return notifications.filter(n => n.role === role);
  }, [notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const searchClaim = useCallback((query: string, role: Role) => {
    const roleClaims = getClaimsForRole(role);
    if (!query) return roleClaims;
    return roleClaims.filter(c => c.claimNo.toLowerCase().includes(query.toLowerCase()));
  }, [getClaimsForRole]);

  return (
    <ClaimContext.Provider value={{
      claims, notifications, addClaim, updateClaimStatus,
      setMissingDocs, getClaimsForRole, getNotificationsForRole,
      markNotificationRead, searchClaim,
    }}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaims() {
  const ctx = useContext(ClaimContext);
  if (!ctx) throw new Error('useClaims must be used within ClaimProvider');
  return ctx;
}
