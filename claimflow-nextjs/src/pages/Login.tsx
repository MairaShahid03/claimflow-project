import React, { useState } from 'react';
import { useAuth, ROLES, Role, ROLE_ROUTES } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>('Requirements Manager');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError('');

    const roleKey = selectedRole.toLowerCase().replace(/\s+/g, '_').trim();
    const cleanPassword = password.trim();

    console.log('Selected Role:', selectedRole);
    console.log('Converted Role:', roleKey);
    console.log('Entered Password:', cleanPassword);

    const { data, error: dbError } = await supabase
      .from('users')
      .select('*');

    setLoading(false);

    if (dbError) {
      console.log('Supabase error:', dbError);
      setError('An error occurred. Please try again.');
      return;
    }

    console.log('DB Users:', data);

    const matchedUser = data?.find(
      (u) =>
        u.role &&
        u.password &&
        u.role.toLowerCase().trim() === roleKey &&
        u.password.trim() === cleanPassword
    );

    if (!matchedUser) {
      setError('Invalid password');
      return;
    }

    login(selectedRole, password);
    router.push(ROLE_ROUTES[selectedRole]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side — image */}
      <div className="relative w-full lg:w-1/2 h-56 lg:h-auto min-h-[200px]">
        <img
          src="/images/insurance-bg.png"
          alt="Insurance"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/50 to-black/60" />
        <div className="relative z-10 flex flex-col justify-end h-full p-8 lg:p-12">
          <h2 className="text-white text-2xl lg:text-4xl font-bold leading-tight drop-shadow-lg">
            Claim Workflow<br />Management System
          </h2>
          <p className="text-white/80 text-sm lg:text-base mt-2 drop-shadow">
            State Life Insurance Corporation of Pakistan
          </p>
        </div>
      </div>

      {/* Right side — login */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 lg:p-10">
            <div className="flex flex-col items-center mb-8">
              <img src="/images/slic-logo.png" alt="SLIC Logo" className="h-20 w-20 rounded-2xl object-contain mb-4 shadow-md" />
              <h1 className="text-2xl font-bold text-card-foreground">State Life Insurance</h1>
              <p className="text-sm text-status-info mt-1">Claim Workflow Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                  <User size={16} className="text-muted-foreground" /> Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground mb-2">
                  <Lock size={16} className="text-muted-foreground" /> Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Min 4 characters"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:translate-y-[1px] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Internal system — authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
