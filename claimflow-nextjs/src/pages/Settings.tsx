import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Lock, Phone, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'password' | 'done'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) setStep('otp');
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) setStep('password');
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length >= 4) setStep('done');
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-md mx-auto mt-8 bg-card rounded-lg border border-border p-6 shadow-sm">
        <h3 className="font-bold text-lg text-card-foreground mb-4 flex items-center gap-2">
          <Lock size={20} /> Change Password
        </h3>

        {step === 'phone' && (
          <form onSubmit={handlePhone} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 flex items-center gap-2">
                <Phone size={14} /> WhatsApp Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button type="submit" className="action-btn w-full py-2.5">Send OTP</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="4-digit OTP"
                maxLength={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono text-center tracking-[0.5em]"
              />
            </div>
            <button type="submit" className="action-btn w-full py-2.5">Verify OTP</button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 4 characters"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button type="submit" className="action-btn w-full py-2.5">Set Password</button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-status-success mb-3" />
            <p className="text-card-foreground font-bold">Password Changed Successfully</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
