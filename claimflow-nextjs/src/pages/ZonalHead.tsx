import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_TO_STAGE, STAGE_TO_ROLE, getRoleDisplayName } from '@/lib/stageMapping';
import { ClaimStatus } from '@/contexts/ClaimContext';
import { Role } from '@/contexts/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import ClaimProgressStepper from '@/components/ClaimProgressStepper';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const WORKFLOW_ROLES: Role[] = [
  'Claim Intimation', 'Requirements Manager', 'Claim Payment Voucher',
  'CPV Checking', 'Claim Incharge', 'PHS Incharge', 'F&A Incharge',
  'Auditor', 'ZHS', 'Cheque Preparation', 'Claim Forwarding Letter', 'Dispatching',
];

const PIE_COLORS = ['#3b82f6', '#dc2626', '#16a34a', '#eab308'];

interface ClaimRow {
  id: string;
  claim_no: string;
  status: string | null;
  current_stage: string | null;
  created_at: string | null;
}

interface HistoryRow {
  claim_no: string;
  department: string | null;
  action: string | null;
  reason: string | null;
  action_time: string | null;
}

export default function ZonalHead() {
  const [allClaims, setAllClaims] = useState<ClaimRow[]>([]);
  const [allHistory, setAllHistory] = useState<HistoryRow[]>([]);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pendingDropdown, setPendingDropdown] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [claimsRes, historyRes] = await Promise.all([
      supabase.from('claims').select('*').order('created_at', { ascending: false }),
      supabase.from('workflow_history').select('*').order('action_time', { ascending: false }),
    ]);
    setAllClaims(claimsRes.data || []);
    setAllHistory(historyRes.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalClaims = allClaims.length;
  const completed = allClaims.filter(c => c.current_stage === 'dispatched' || c.status === 'completed' && c.current_stage === 'dispatched').length;
  const objected = allClaims.filter(c => c.status && ['objected', 'disapproved', 'rejected', 'error', 'missing'].includes(c.status)).length;
  const inProgress = Math.max(0, totalClaims - completed - objected);

  const avgStages = totalClaims > 0
    ? (allHistory.length / totalClaims).toFixed(1)
    : '0';
  const completionRate = totalClaims > 0 ? ((completed / totalClaims) * 100).toFixed(0) : '0';

  const statusPieData = [
    { name: 'In Progress', value: inProgress },
    { name: 'Rejected/Objected', value: objected },
    { name: 'Completed', value: completed },
  ].filter(d => d.value > 0);

  const stageCounts: Record<string, number> = {};
  allClaims.forEach(c => {
    const stage = c.current_stage || 'unknown';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });
  const stagePieData = Object.entries(stageCounts).map(([name, value]) => ({ name: getRoleDisplayName(name), value }));

  const deptPerformance = WORKFLOW_ROLES.map(role => {
    const stageKey = ROLE_TO_STAGE[role];
    const roleHistory = allHistory.filter(h => h.department === stageKey);
    const comp = roleHistory.filter(h => h.action === 'completed').length;
    const obj = roleHistory.filter(h => h.action && h.action !== 'completed').length;
    const pend = allClaims.filter(c => c.current_stage === stageKey).length;
    return { name: role.length > 12 ? role.substring(0, 12) + '...' : role, Completed: comp, Pending: pend, Objected: obj, fullName: role };
  });

  const filteredLog = roleFilter === 'all'
    ? allHistory
    : allHistory.filter(a => a.department === ROLE_TO_STAGE[roleFilter as Role]);

  const dateWiseDept = WORKFLOW_ROLES.map(role => {
    const stageKey = ROLE_TO_STAGE[role];
    const roleHistory = allHistory.filter(h => h.department === stageKey);
    const received = new Set([...roleHistory.map(h => h.claim_no), ...allClaims.filter(c => c.current_stage === stageKey).map(c => c.claim_no)]).size;
    const comp = roleHistory.filter(h => h.action === 'completed').length;
    const pend = allClaims.filter(c => c.current_stage === stageKey).length;
    const pendingClaimNos = allClaims.filter(c => c.current_stage === stageKey).map(c => c.claim_no);
    return { role, received, completed: comp, pending: pend, pendingClaimNos };
  });

  const handleExport = () => {
    const headers = ['Claim No', 'Current Stage', 'Status', 'Created At'];
    const rows = allClaims.map(c => [c.claim_no, getRoleDisplayName(c.current_stage || ''), c.status || '', c.created_at || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'claims_report.csv'; a.click();
  };

  const REPORT_STAGES = [
    { key: 'claim_intimation', label: 'Claim Intimation' },
    { key: 'requirements_manager', label: 'Requirements Manager' },
    { key: 'claim_payment_voucher', label: 'Claim Payment Voucher' },
    { key: 'cpv_checking', label: 'CPV Checking' },
    { key: 'claim_incharge', label: 'Claim Incharge' },
    { key: 'phs_incharge', label: 'PHS Incharge' },
    { key: 'fa_incharge', label: 'F&A Incharge' },
    { key: 'auditor', label: 'Auditor' },
    { key: 'zhs', label: 'ZHS' },
    { key: 'cheque_preparation', label: 'Cheque Preparation' },
    { key: 'claim_forwarding_letter', label: 'Claim Forwarding Letter' },
    { key: 'dispatching', label: 'Dispatching' },
  ];

  const handleDownloadReport = () => {
    const now = new Date().toLocaleString();
    const headers = [
      'Claim Number', 'Current Status',
      ...REPORT_STAGES.map(s => s.label),
      'Final Status',
    ];

    const rows = allClaims.map(c => {
      const claimHistory = allHistory.filter(h => h.claim_no === c.claim_no);
      const stageTimestamps = REPORT_STAGES.map(stage => {
        const entry = claimHistory.find(h => h.department === stage.key && h.action === 'completed');
        return entry && entry.action_time ? new Date(entry.action_time).toLocaleString() : 'Pending';
      });
      const finalStatus = c.current_stage === 'dispatched' ? 'Completed' : (c.status || 'In Progress');
      return [
        c.claim_no,
        getRoleDisplayName(c.current_stage || ''),
        ...stageTimestamps,
        finalStatus,
      ];
    });

    const csvContent = [
      [`Claim Workflow Report – Zonal Head`],
      [`Generated: ${now}`],
      [],
      headers,
      ...rows,
    ].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Claim_Workflow_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group history by claim for timeline
  const claimHistoryMap: Record<string, HistoryRow[]> = {};
  allHistory.forEach(h => {
    if (!claimHistoryMap[h.claim_no]) claimHistoryMap[h.claim_no] = [];
    claimHistoryMap[h.claim_no].push(h);
  });

  return (
    <DashboardLayout title="Zonal Head Admin Dashboard" subtitle="Complete system monitoring and oversight">
      <div className="flex justify-end mb-4">
        <button onClick={handleDownloadReport} className="action-btn flex items-center gap-2 text-sm rounded-xl">
          <Download size={16} /> Download Report
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Claims" value={totalClaims} color="blue" icon={FileText} />
        <StatsCard label="In Progress" value={inProgress} color="orange" icon={Clock} />
        <StatsCard label="Completed" value={completed} color="green" icon={CheckCircle} />
        <StatsCard label="Objected" value={objected} color="red" icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase">Avg Stages Completed</p>
          <p className="text-2xl font-bold font-mono text-card-foreground mt-1">{avgStages}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase">Completion Rate</p>
          <p className="text-2xl font-bold font-mono text-card-foreground mt-1">{completionRate}%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase">Active Departments</p>
          <p className="text-2xl font-bold font-mono text-card-foreground mt-1">{WORKFLOW_ROLES.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Claims by Current Stage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stagePieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ value }) => `${value}`}>
                {stagePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-card-foreground text-sm uppercase tracking-wider">Department Performance</h3>
          <button onClick={handleExport} className="action-btn flex items-center gap-2 text-xs rounded-xl">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deptPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Completed" fill="#16a34a" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Pending" fill="#eab308" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Objected" fill="#dc2626" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Boxes */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Department Performance Boxes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKFLOW_ROLES.map(role => {
            const stageKey = ROLE_TO_STAGE[role];
            const roleHistory = allHistory.filter(h => h.department === stageKey);
            const received = new Set([...roleHistory.map(h => h.claim_no), ...allClaims.filter(c => c.current_stage === stageKey).map(c => c.claim_no)]).size;
            const comp = roleHistory.filter(h => h.action === 'completed').length;
            const pend = allClaims.filter(c => c.current_stage === stageKey).length;
            const pct = received > 0 ? ((comp / received) * 100).toFixed(0) : '0';
            return (
              <div key={role} className="border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-card-foreground truncate mb-3">{role}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="font-bold text-status-info text-lg font-mono">{received}</p><p className="text-muted-foreground">Received</p></div>
                  <div><p className="font-bold text-status-success text-lg font-mono">{comp}</p><p className="text-muted-foreground">Completed</p></div>
                  <div><p className="font-bold text-status-pending text-lg font-mono">{pend}</p><p className="text-muted-foreground">Pending</p></div>
                </div>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-status-success rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground text-right mt-1">{pct}% complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Activity Log */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-card-foreground text-sm uppercase tracking-wider">Role-Wise Activity Log</h3>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Roles</option>
            {WORKFLOW_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredLog.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>
          ) : filteredLog.slice(0, 50).map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border text-sm">
              <span className="font-mono text-status-info text-xs">{a.claim_no}</span>
              <span className="text-muted-foreground text-xs">{getRoleDisplayName(a.department || '')}</span>
              <StatusBadge status={(a.action === 'completed' ? 'Completed' : a.action === 'missing' ? 'Missing' : 'Error') as ClaimStatus} />
              <span className="text-muted-foreground text-xs ml-auto">{a.action_time ? new Date(a.action_time).toLocaleString() : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Timeline */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Claim Timeline</h3>
        {allClaims.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No claims yet</p>
        ) : allClaims.map(c => (
          <div key={c.claim_no} className="border-b border-border">
            <button onClick={() => setExpandedClaim(expandedClaim === c.claim_no ? null : c.claim_no)}
              className="w-full flex items-center justify-between py-3 px-2 hover:bg-muted/30 transition text-left rounded-lg">
              <div className="flex items-center gap-3">
                {expandedClaim === c.claim_no ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="font-mono font-semibold text-status-info text-sm">{c.claim_no}</span>
                <StatusBadge status={(c.status === 'completed' ? 'Completed' : c.status === 'missing' ? 'Missing' : c.status ? 'Error' : 'Pending') as ClaimStatus} />
              </div>
              <span className="text-xs text-muted-foreground">{(claimHistoryMap[c.claim_no] || []).length} stages</span>
            </button>
            <AnimatePresence>
              {expandedClaim === c.claim_no && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <ClaimProgressStepper
                      currentStage={c.current_stage}
                      completedStages={(claimHistoryMap[c.claim_no] || [])
                        .filter(h => h.action === 'completed')
                        .map(h => h.department || '')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Date-Wise Department Claims */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Date-Wise Department Claims</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-muted/70">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Received</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending</th>
            </tr>
          </thead>
          <tbody>
            {dateWiseDept.map(d => (
              <React.Fragment key={d.role}>
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">{d.role}</td>
                  <td className="px-5 py-3.5 text-sm font-mono">{d.received}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-status-success">{d.completed}</td>
                  <td className="px-5 py-3.5">
                    {d.pending > 0 ? (
                      <button onClick={() => setPendingDropdown(pendingDropdown === d.role ? null : d.role)}
                        className="text-sm font-mono text-status-pending hover:underline flex items-center gap-1">
                        {d.pending}
                        <ChevronDown size={12} className={`transition ${pendingDropdown === d.role ? 'rotate-180' : ''}`} />
                      </button>
                    ) : <span className="text-sm font-mono">0</span>}
                  </td>
                </tr>
                <AnimatePresence>
                  {pendingDropdown === d.role && d.pendingClaimNos.length > 0 && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={4} className="px-8 py-2 bg-muted/30">
                        <div className="flex flex-wrap gap-2">
                          {d.pendingClaimNos.map(cn => (
                            <span key={cn} className="font-mono text-xs text-status-info bg-background px-2 py-1 rounded-lg border border-border">{cn}</span>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
