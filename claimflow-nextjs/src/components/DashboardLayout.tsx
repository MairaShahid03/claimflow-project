import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ROLE_TO_STAGE, getRoleDisplayName } from '@/lib/stageMapping';
import { useRouter } from 'next/navigation';
import { Bell, Moon, Sun, ChevronDown, Settings, LogOut } from 'lucide-react';

interface Notification {
  id: string;
  claim_no: string;
  message: string | null;
  read_status: boolean | null;
  created_at: string | null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { role, darkMode, toggleDarkMode, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const stageKey = role ? ROLE_TO_STAGE[role] : '';

  useEffect(() => {
    if (!role) { router.push('/'); return; }
    fetchNotifications();
  }, [role, router]);

  const fetchNotifications = async () => {
    if (!stageKey) return;
    const { data } = await supabase.from('notifications')
      .select('*')
      .eq('department', stageKey)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read_status: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };
  const roleInitial = role ? role.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Nav Bar */}
      <nav className="h-16 bg-white dark:bg-card flex items-center px-5 justify-between shadow-md sticky top-0 z-50 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/images/slic-logo.png" alt="SLIC Logo" className="h-10 w-10 rounded-xl bg-muted object-contain p-0.5" />
          <div>
            <h1 className="text-foreground font-bold text-sm leading-tight">State Life Insurance</h1>
            <p className="text-muted-foreground text-xs">{role} Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-bold text-card-foreground">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition ${!n.read_status ? 'bg-primary/5' : ''}`}>
                      <p className="text-sm text-card-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-muted transition">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {roleInitial}
              </span>
              <span className="text-foreground text-sm font-medium hidden sm:block">{role}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-destructive hover:bg-muted/50 transition">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/90 to-primary p-6 lg:p-8 mx-4 mt-4 rounded-xl shadow-lg">
        <h2 className="text-xl lg:text-2xl font-bold text-primary-foreground">{title}</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}
