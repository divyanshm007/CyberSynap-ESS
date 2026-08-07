import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Lock, Bell, Palette } from 'lucide-react';
import { useAuth, useTheme } from '@/hooks';
import { updatePassword } from '@/services/auth.service';
import { PageHeader } from '@/components/shared';
import { cn } from '@/utils/cn';
import type { Theme } from '@/types';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    try {
      updatePassword(user!.id, pw.current, pw.next);
      toast.success('Password changed successfully.');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) { toast.error((err as Error).message); }
  };

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light',  label: 'Light',  icon: <Sun size={16}/>     },
    { value: 'dark',   label: 'Dark',   icon: <Moon size={16}/>    },
    { value: 'system', label: 'System', icon: <Monitor size={16}/> },
  ];

  const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[var(--plasma)]">{icon}</span>
        <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      </div>
      {children}
    </motion.div>
  );

  const InputCls = "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]";

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account preferences." />

      <SectionCard icon={<Palette size={16}/>} title="Appearance">
        <div className="flex gap-3">
          {themes.map(t => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={cn('flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                theme === t.value ? 'border-[var(--plasma)] bg-[var(--plasma-soft)] text-[var(--plasma)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--raised)]')}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={<Lock size={16}/>} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-3">
          {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([l,k]) => (
            <div key={k}>
              <label className="field-label">{l}</label>
              <input type="password" value={pw[k as keyof typeof pw]} onChange={e => setPw(p => ({...p, [k]: e.target.value}))} className={`mt-1 ${InputCls}`} />
            </div>
          ))}
          <button type="submit" className="w-full py-2.5 mt-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
            Update Password
          </button>
        </form>
      </SectionCard>

      <SectionCard icon={<Bell size={16}/>} title="Notifications">
        {[['Email Notifications', 'Receive updates via email'], ['Leave Approvals', 'Notified when your leave status changes'],
          ['Payslip Generated', 'Alert when monthly payslip is ready'], ['Ticket Updates', 'Comments and status changes on your tickets']].map(([l,d]) => (
          <div key={l} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{l}</p>
              <p className="text-xs text-[var(--text-muted)]">{d}</p>
            </div>
            <button className="w-10 h-6 rounded-full bg-[var(--plasma)] relative" onClick={() => toast('Notification settings saved.')}>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
