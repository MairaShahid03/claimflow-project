'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const ROLES = [
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
  'Zonal Head',
] as const;

export type Role = typeof ROLES[number];

export const ROLE_ROUTES: Record<Role, string> = {
  'Claim Intimation': '/claim-intimation',
  'Requirements Manager': '/requirements-manager',
  'Claim Payment Voucher': '/claim-payment-voucher',
  'CPV Checking': '/cpv-checking',
  'Claim Incharge': '/claim-incharge',
  'PHS Incharge': '/phs-incharge',
  'F&A Incharge': '/fa-incharge',
  'Auditor': '/auditor',
  'ZHS': '/zhs',
  'Cheque Preparation': '/cheque-preparation',
  'Claim Forwarding Letter': '/claim-forwarding-letter',
  'Dispatching': '/dispatching',
  'Zonal Head': '/zonal-head',
};

interface AuthContextType {
  role: Role | null;
  darkMode: boolean;
  login: (role: Role, password: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    const saved = localStorage.getItem('slic_role');
    return saved ? (saved as Role) : null;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('slic_role');
    const key = saved ? `slic_dark_mode_${saved}` : 'slic_dark_mode';
    return localStorage.getItem(key) === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const login = (r: Role, _password: string) => {
    if (_password.length >= 4) {
      setRole(r);
      localStorage.setItem('slic_role', r);
      // Load user-specific dark mode preference
      const userDarkKey = `slic_dark_mode_${r}`;
      const userDark = localStorage.getItem(userDarkKey) === 'true';
      setDarkMode(userDark);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('slic_role');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      const key = role ? `slic_dark_mode_${role}` : 'slic_dark_mode';
      localStorage.setItem(key, String(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ role, darkMode, login, logout, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
