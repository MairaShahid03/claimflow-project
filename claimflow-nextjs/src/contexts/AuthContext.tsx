'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

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
  // ✅ SAFE initial state (no localStorage here)
  const [role, setRole] = useState<Role | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Load from localStorage ONLY in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('slic_role');

      if (savedRole) {
        const roleValue = savedRole as Role;
        setRole(roleValue);

        const darkKey = `slic_dark_mode_${roleValue}`;
        const savedDark = localStorage.getItem(darkKey) === 'true';
        setDarkMode(savedDark);
      } else {
        const savedDark = localStorage.getItem('slic_dark_mode') === 'true';
        setDarkMode(savedDark);
      }
    }
  }, []);

  // ✅ Apply dark mode to HTML
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const login = (r: Role, password: string) => {
    if (password.length >= 4) {
      setRole(r);

      if (typeof window !== 'undefined') {
        localStorage.setItem('slic_role', r);

        const userDarkKey = `slic_dark_mode_${r}`;
        const userDark = localStorage.getItem(userDarkKey) === 'true';
        setDarkMode(userDark);
      }

      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('slic_role');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;

      if (typeof window !== 'undefined') {
        const key = role
          ? `slic_dark_mode_${role}`
          : 'slic_dark_mode';

        localStorage.setItem(key, String(next));
      }

      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ role, darkMode, login, logout, toggleDarkMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  // ✅ Prevent crash during SSR / prerender
  if (!ctx) {
    return {
      role: null,
      darkMode: false,
      login: () => false,
      logout: () => {},
      toggleDarkMode: () => {},
    };
  }

  return ctx;
}