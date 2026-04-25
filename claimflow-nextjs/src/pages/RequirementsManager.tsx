import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_TO_STAGE, getNextStage, getRoleDisplayName } from '@/lib/stageMapping';
import { ClaimStatus } from '@/contexts/ClaimContext';
import { FileText, Clock, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';
import MissingDocsInline from '@/components/MissingDocsInline';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface ClaimRow {
  id: string;
  claim_no: string;
  status: string | null;
  current_stage: string | null;
  created_at: string | null;
  historyAction?: string;
  historyReason?: string;
  historyTime?: string;
}

const STAGE_KEY = ROLE_TO_STAGE['Requirements Manager'];

export default function RequirementsManager() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [search, setSearch] = useState('');
  const [missingInlineClaim, setMissingInlineClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchClaims = useCallback(async () => {
    const [pendingRes, historyRes] = await Promise.all([
      supabase.from('claims').select('*').eq('current_stage', STAGE_KEY),
      supabase.from('workflow_history').select('*').eq('department', STAGE_KEY),
    ]);

    const pendingClaims = pendingRes.data || [];
    const history = historyRes.data || [];
    const pendingNos = new Set(pendingClaims.map(c => c.claim_no));
    const historicalNos = [...new Set(history.map(h => h.claim_no))].filter(no => !pendingNos.has(no));

    let historicalClaims: any[] = [];
    if (historicalNos.length > 0) {
      const { data } = await supabase.from('claims').select('*').in('claim_no', historicalNos);
      historicalClaims = data || [];
    }

    const historyMap: Record<string, any> = {};
    history.forEach(h => { historyMap[h.claim_no] = h; });

    const all = [...pendingClaims, ...historicalClaims].map(c => ({
      ...c,
      historyAction: historyMap[c.claim_no]?.action || undefined,
      historyReason: historyMap[c.claim_no]?.reason || undefined,
      historyTime: historyMap[c.claim_no]?.action_time || undefined,
    }));

    all.sort((a, b) => {
      const aActed = !!a.historyAction;
      const bActed = !!b.historyAction;
      if (!aActed && bActed) return -1;
      if (aActed && !bActed) return 1;
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    setClaims(all);
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const filtered = search ? claims.filter(c => c.claim_no.toLowerCase().includes(search.toLowerCase())) : claims;

  const completed = claims.filter(c => c.historyAction === 'completed').length;
  const missing = claims.filter(c => c.historyAction === 'missing').length;
  const pending = claims.filter(c => !c.historyAction && c.current_stage === STAGE_KEY).length;

  const chartData = [
    { name: 'Completed', value: completed },
    { name: 'Missing', value: missing },
    { name: 'Pending', value: pending },
  ];

  const handleComplete = async (claimNo: string) => {
    setLoading(true);
    const nextStage = getNextStage(STAGE_KEY);
    await supabase.from('workflow_history').insert({ claim_no: claimNo, department: STAGE_KEY, action: 'completed' });
    if (nextStage) {
      await supabase.from('claims').update({ current_stage: nextStage, status: 'completed' }).eq('claim_no', claimNo);
      await supabase.from('notifications').insert({ claim_no: claimNo, department: nextStage, message: `Claim ${claimNo}: Ready for ${getRoleDisplayName(nextStage)} review.` });
    }
    toast({ title: 'Completed', description: `Claim ${claimNo} marked as completed.` });
    setLoading(false);
    await fetchClaims();
  };

  const handleMissing = (claimNo: string) => {
    setMissingInlineClaim(claimNo);
  };

  const handleInlineGenerate = async (docs: string[], department: string) => {
    if (!missingInlineClaim) return;
    setLoading(true);
    await supabase.from('workflow_history').insert({ claim_no: missingInlineClaim, department: STAGE_KEY, action: 'missing' });
    await supabase.from('claims').update({ status: 'missing' }).eq('claim_no', missingInlineClaim);
    for (const doc of docs) {
      await supabase.from('missing_documents').insert({ claim_no: missingInlineClaim, document_name: doc });
    }
    setLoading(false);
    await fetchClaims();
  };

  const handleInlineCancel = () => {
    setMissingInlineClaim(null);
  };

  const getDisplayStatus = (c: ClaimRow): ClaimStatus => {
    if (!c.historyAction) return 'Pending';
    if (c.historyAction === 'completed') return 'Completed';
    if (c.historyAction === 'missing') return 'Missing';
    return 'Error';
  };

  return (
    <DashboardLayout title="Requirements Manager Dashboard" subtitle="Manage incoming claims and missing document requirements">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Claims" value={claims.length} color="blue" icon={FileText} />
        <StatsCard label="Pending" value={pending} color="orange" icon={Clock} />
        <StatsCard label="Docs Missing" value={missing} color="red" icon={AlertCircle} />
        <StatsCard label="Completed" value={completed} color="green" icon={CheckCircle} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Claims Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => {
                const colors = ['#16a34a', '#dc2626', '#eab308'];
                return <Cell key={i} fill={colors[i]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by claim number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
        </div>
      </div>

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
              const displayStatus = getDisplayStatus(c);
              const isPending = !c.historyAction && c.current_stage === STAGE_KEY;
              return (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-status-info text-sm">{c.claim_no}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={displayStatus} /></td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">
                    {c.historyTime ? new Date(c.historyTime).toLocaleString() : (c.created_at ? new Date(c.created_at).toLocaleString() : '—')}
                  </td>
                  <td className="px-5 py-3.5">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleComplete(c.claim_no)} disabled={loading} className="action-btn">Completed</button>
                        <button onClick={() => handleMissing(c.claim_no)} disabled={loading} className="action-btn-error">Missing</button>
                      </div>
                    ) : displayStatus === 'Completed' ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle size={20} className="text-status-success" />
                      </span>
                    ) : displayStatus === 'Missing' ? (
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

      {/* Inline Missing Docs */}
      {missingInlineClaim && (
        <MissingDocsInline
          claimNo={missingInlineClaim}
          onGenerate={handleInlineGenerate}
          onCancel={handleInlineCancel}
          loading={loading}
        />
      )}
    </DashboardLayout>
  );
}