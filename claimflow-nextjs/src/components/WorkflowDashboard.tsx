import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { Role } from '@/contexts/AuthContext';
import { ClaimStatus } from '@/contexts/ClaimContext';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_TO_STAGE, getNextStage, getRoleDisplayName } from '@/lib/stageMapping';
import { FileText, Clock, CheckCircle, AlertCircle, Search, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface ClaimRow {
  id: string;
  claim_no: string;
  status: string | null;
  current_stage: string | null;
  created_at: string | null;
}

interface WorkflowHistoryRow {
  claim_no: string;
  department: string | null;
  action: string | null;
  reason: string | null;
  action_time: string | null;
}

interface WorkflowDashboardProps {
  role: Role;
  title: string;
  subtitle: string;
  chartType: 'bar' | 'area';
  actions: {
    success: { label: string; status: ClaimStatus };
    error?: { label: string; status: ClaimStatus };
  };
  requiresReason?: boolean;
}

export default function WorkflowDashboard({
  role, title, subtitle, chartType, actions, requiresReason
}: WorkflowDashboardProps) {
  const [claims, setClaims] = useState<(ClaimRow & { historyAction?: string; historyReason?: string; historyTime?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [reasonModal, setReasonModal] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const stageKey = ROLE_TO_STAGE[role];

  const fetchClaims = useCallback(async () => {
    // Get claims at this stage (pending) + claims that have history for this role (acted upon)
    const [pendingRes, historyRes] = await Promise.all([
      supabase.from('claims').select('*').eq('current_stage', stageKey),
      supabase.from('workflow_history').select('*').eq('department', stageKey),
    ]);

    const pendingClaims = pendingRes.data || [];
    const history = (historyRes.data || []) as WorkflowHistoryRow[];

    // Get claim_nos from history that aren't in pending
    const pendingNos = new Set(pendingClaims.map(c => c.claim_no));
    const historicalNos = [...new Set(history.map(h => h.claim_no))].filter(no => !pendingNos.has(no));

    let historicalClaims: ClaimRow[] = [];
    if (historicalNos.length > 0) {
      const { data } = await supabase.from('claims').select('*').in('claim_no', historicalNos);
      historicalClaims = data || [];
    }

    // Build history lookup
    const historyMap: Record<string, WorkflowHistoryRow> = {};
    history.forEach(h => {
      historyMap[h.claim_no] = h; // latest one wins
    });

    const allClaims = [...pendingClaims, ...historicalClaims].map(c => ({
      ...c,
      historyAction: historyMap[c.claim_no]?.action || undefined,
      historyReason: historyMap[c.claim_no]?.reason || undefined,
      historyTime: historyMap[c.claim_no]?.action_time || undefined,
    }));

    // Sort: pending first, then by created_at desc
    allClaims.sort((a, b) => {
      const aActed = !!a.historyAction;
      const bActed = !!b.historyAction;
      if (!aActed && bActed) return -1;
      if (aActed && !bActed) return 1;
      // Within same group, newest first
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    setClaims(allClaims);
  }, [stageKey]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const filtered = search
    ? claims.filter(c => c.claim_no.toLowerCase().includes(search.toLowerCase()))
    : claims;

  const completed = claims.filter(c => c.historyAction === 'completed').length;
  const errors = claims.filter(c => c.historyAction && c.historyAction !== 'completed').length;
  const pending = claims.filter(c => !c.historyAction && c.current_stage === stageKey).length;

  const chartData = actions.error ? [
    { name: actions.success.label, value: completed },
    { name: actions.error.label, value: errors },
    { name: 'Pending', value: pending },
  ] : [
    { name: 'Pending', value: pending },
    { name: 'Processing', value: 0 },
    { name: 'Completed', value: completed },
  ];

  const handleSuccess = async (claimNo: string) => {
    setLoading(true);
    const nextStage = getNextStage(stageKey);

    // Insert workflow history
    await supabase.from('workflow_history').insert({
      claim_no: claimNo,
      department: stageKey,
      action: 'completed',
    });

    // Update claim to next stage
    if (nextStage) {
      await supabase.from('claims').update({
        current_stage: nextStage,
        status: 'completed',
      }).eq('claim_no', claimNo);

      // Notify next role
      await supabase.from('notifications').insert({
        claim_no: claimNo,
        department: nextStage,
        message: `Claim ${claimNo}: Ready for ${getRoleDisplayName(nextStage)} review.`,
      });
    } else {
      // Final stage
      await supabase.from('claims').update({
        current_stage: 'dispatched',
        status: 'completed',
      }).eq('claim_no', claimNo);
    }

    toast({ title: 'Success', description: `Claim ${claimNo} marked as completed.` });
    setLoading(false);
    await fetchClaims();
  };

  const handleError = (claimNo: string) => {
    if (requiresReason) {
      setReasonModal(claimNo);
      setReason('');
    } else {
      submitError(claimNo);
    }
  };

  const submitError = async (claimNo: string, errorReason?: string) => {
    setLoading(true);
    const errorStatus = actions.error!.status.toLowerCase();

    await supabase.from('workflow_history').insert({
      claim_no: claimNo,
      department: stageKey,
      action: errorStatus,
      reason: errorReason || null,
    });

    // Don't move to next stage on error
    await supabase.from('claims').update({
      status: errorStatus,
    }).eq('claim_no', claimNo);

    toast({ title: actions.error!.label, description: `Claim ${claimNo} marked as ${errorStatus}.` });
    setLoading(false);
    setReasonModal(null);
    await fetchClaims();
  };

  const submitReasonAndError = () => {
    if (reasonModal && reason.trim()) {
      submitError(reasonModal, reason.trim());
    }
  };

  const getDisplayStatus = (c: typeof claims[0]): ClaimStatus => {
    if (!c.historyAction) return 'Pending';
    if (c.historyAction === 'completed') return 'Completed';
    if (c.historyAction === 'error') return 'Error';
    if (c.historyAction === 'objected') return 'Objected';
    if (c.historyAction === 'disapproved') return 'Disapproved';
    if (c.historyAction === 'rejected') return 'Rejected';
    if (c.historyAction === 'missing') return 'Missing';
    return 'Error';
  };

  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Claims" value={claims.length} color="blue" icon={FileText} />
        <StatsCard label="Pending" value={pending} color="orange" icon={Clock} />
        <StatsCard label="Completed" value={completed} color="green" icon={CheckCircle} />
        {actions.error && (
          <StatsCard label={actions.error.label} value={errors} color="red" icon={AlertCircle} />
        )}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Processing Status</h3>
        <ResponsiveContainer width="100%" height={220}>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => {
                  const colors = actions.error
                    ? ['#16a34a', '#dc2626', '#eab308']
                    : ['#eab308', '#3b82f6', '#16a34a'];
                  return <Cell key={i} fill={colors[i]} />;
                })}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
              <Area type="monotone" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by claim number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/70">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Claim No</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">No claims available</td></tr>
            ) : filtered.map((c, i) => {
              const isPending = !c.historyAction && c.current_stage === stageKey;
              const isSuccess = c.historyAction === 'completed';
              const isError = c.historyAction && c.historyAction !== 'completed';
              const displayStatus = getDisplayStatus(c);

              return (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-status-info text-sm">{c.claim_no}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={displayStatus} />
                    {c.historyReason && <p className="text-xs text-destructive mt-1">{c.historyReason}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">
                    {c.historyTime ? new Date(c.historyTime).toLocaleString() : (c.created_at ? new Date(c.created_at).toLocaleString() : '—')}
                  </td>
                  <td className="px-5 py-3.5">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleSuccess(c.claim_no)} disabled={loading} className="action-btn">
                          {actions.success.label}
                        </button>
                        {actions.error && (
                          <button onClick={() => handleError(c.claim_no)} disabled={loading} className="action-btn-error">
                            {actions.error.label}
                          </button>
                        )}
                      </div>
                    ) : isSuccess ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle size={20} className="text-status-success" />
                      </span>
                    ) : isError ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                        <XCircle size={20} className="text-destructive" />
                      </span>
                    ) : null}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reason Modal */}
      {reasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setReasonModal(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-card-foreground mb-4">Reason for {actions.error?.label}</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-ring mb-4 resize-none" />
            <div className="flex gap-3">
              <button onClick={submitReasonAndError} disabled={loading} className="action-btn-error flex-1 py-2.5">Submit</button>
              <button onClick={() => setReasonModal(null)} className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
