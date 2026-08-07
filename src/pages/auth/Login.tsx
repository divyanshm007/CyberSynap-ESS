import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth, useTheme } from '@/hooks';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@cybersynap.com',        password: 'Admin@123', color: 'text-[var(--plasma)]' },
  { role: 'HR Admin',    email: 'hr@cybersynap.com',           password: 'Admin@123', color: 'text-[var(--aurora)]' },
  { role: 'Employee',    email: 'arjun.sharma@cybersynap.com', password: 'Pass@123',  color: 'text-violet-500' },
];

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const { resolvedTheme, toggle } = useTheme();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">

      {/* ── Left branding panel — 60% ── */}
      <div className="hidden lg:flex flex-col justify-between lg:w-[60%] bg-[var(--surface)] border-r border-[var(--border)] p-12 relative overflow-hidden flex-shrink-0">
        {/* Aurora orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--plasma)] opacity-[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[var(--aurora)] opacity-[0.09] blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--plasma)] opacity-[0.02] blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative">
          <div className="mb-16 w-fit rounded-2xl overflow-hidden bg-white p-3">
            <img
              src="/cyber_synap_logo.png"
              alt="CyberSynap"
              className="h-10 w-auto object-contain block"
            />
          </div>

          <h2 className="text-4xl font-bold text-[var(--text)] leading-tight mb-5">
            Your work,<br />your way.
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-md">
            Manage attendance, leaves, timesheets, payslips, and everything else — from one premium workspace.
          </p>

          <div className="mt-12 space-y-5">
            {[
              'Attendance & Time Tracking',
              'Leave & Payslip Management',
              'Support Tickets & Documents',
              'Team Directory & Announcements',
            ].map((f, i) => (
              <div key={f} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: i % 2 === 0 ? 'var(--plasma-soft)' : 'var(--aurora-soft)' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke={i % 2 === 0 ? 'var(--plasma)' : 'var(--aurora)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-[var(--text-muted)]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-[var(--text-muted)]">© 2025 CyberSynap Technologies. All rights reserved.</p>
      </div>

      {/* ── Right login form — 40% ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-5 right-5 p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          {resolvedTheme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden w-fit rounded-2xl overflow-hidden bg-white p-3">
            <img src="/cyber_synap_logo.png" alt="CyberSynap" className="h-8 w-auto object-contain block" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Enter your credentials to access your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@cybersynap.com" required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--plasma)] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--plasma)] focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--plasma)] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-xs text-[var(--text-muted)] text-center mb-3">— Demo accounts —</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email} onClick={() => fillDemo(acc)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--raised)] transition-colors text-left">
                  <div>
                    <p className={cn('text-xs font-semibold', acc.color)}>{acc.role}</p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{acc.email}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--raised)] px-2 py-0.5 rounded-full font-mono">
                    {acc.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
