'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface ClaimRow {
  id: string;
  claim_no: string;
  status: string | null;
  current_stage: string | null;
  created_at: string | null;
}

export default function ClaimIntimation() {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [newClaimNo, setNewClaimNo] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setClaims(data || []);
  };

  useEffect(() => { fetchClaims(); }, []);

  const filtered = search
    ? claims.filter(c => c.claim_no.toLowerCase().includes(search.toLowerCase()))
    : claims;

  const chartData = [{ name: 'Intimated', value: claims.length, fill: '#16a34a' }];

  const handleAdd = async () => {
    const trimmed = newClaimNo.trim();
    if (!trimmed) return;
    setLoading(true);

    const { error } = await supabase.from('claims').insert({
      claim_no: trimmed,
      status: 'completed',
      current_stage: 'requirements_manager',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Also insert workflow history for claim intimation
      await supabase.from('workflow_history').insert({
        claim_no: trimmed,
        department: 'claim_intimation',
        action: 'completed',
      });
      // Notify requirements manager
      await supabase.from('notifications').insert({
        claim_no: trimmed,
        department: 'requirements_manager',
        message: `Claim ${trimmed}: New claim intimated. Ready for requirements review.`,
      });
      toast({ title: 'Claim Intimated', description: `Claim ${trimmed} added successfully.` });
      setNewClaimNo('');
      await fetchClaims();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Claim Intimation Dashboard" subtitle="Register new claims and manage intimation process">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Claims" value={claims.length} color="blue" icon={FileText} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <div className="flex gap-3">
          <input type="text" value={newClaimNo} onChange={e => setNewClaimNo(e.target.value)}
            placeholder="Enter Claim Number (e.g. SL-9842)"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            onKeyDown={e => e.key === 'Enter' && handleAdd()} disabled={loading} />
          <button onClick={handleAdd} disabled={loading} className="action-btn flex items-center gap-2 rounded-xl px-5">
            <Plus size={16} /> {loading ? 'Adding...' : 'Intimate Claim'}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-4 text-sm uppercase tracking-wider">Claims Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
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
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">System Ready: Waiting for Intimation. Add a claim above.</td></tr>
            ) : filtered.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-mono font-semibold text-status-info text-sm">{c.claim_no}</td>
                <td className="px-5 py-3.5"><StatusBadge status="Completed" /></td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
