import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  color: 'blue' | 'orange' | 'red' | 'green';
  icon: LucideIcon;
}

const colorClass: Record<string, string> = {
  blue: 'stat-card stat-card-blue',
  orange: 'stat-card stat-card-orange',
  red: 'stat-card stat-card-red',
  green: 'stat-card stat-card-green',
};

export default function StatsCard({ label, value, color, icon: Icon }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={colorClass[color]}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2 font-mono">{value}</p>
        </div>
        <div className="p-2 rounded-xl bg-white/15">
          <Icon size={24} className="opacity-90" />
        </div>
      </div>
    </motion.div>
  );
}
