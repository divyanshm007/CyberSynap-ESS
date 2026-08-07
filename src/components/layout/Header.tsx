import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks';
import { NAV_ITEMS } from '@/constants';
import { query } from '@/services/storage.service';
import type { Notification } from '@/types';
import { timeAgo } from '@/utils/date';
import { getInitials } from '@/utils';
import { cn } from '@/utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  success: 'bg-green-500/15 text-green-500',
  warning: 'bg-amber-500/15 text-amber-500',
  error:   'bg-red-500/15 text-red-500',
  info:    'bg-[var(--plasma-soft)] text-[var(--plasma)]',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = user
    ? query<Notification>('notifications', n => n.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
    : [];
  const unread = notifications.filter(n => !n.isRead).length;

  const currentNav = NAV_ITEMS.find(item =>
    location.pathname === item.path ||
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path)),
  );

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-20">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--raised)] transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-[var(--text-muted)]">CyberSynap</span>
          <ChevronRight size={14} className="text-[var(--border)]" />
          <span className="font-medium text-[var(--text)]">{currentNav?.label ?? 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Search hint */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--raised)] border border-[var(--border)] text-[var(--text-muted)] text-sm cursor-pointer hover:border-[var(--plasma)] transition-colors">
          <Search size={14} />
          <span className="text-xs">Search…</span>
          <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] font-mono">⌘K</kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--raised)] hover:text-[var(--text)] transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--plasma)] text-white text-[9px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 z-20 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
                    {unread > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--plasma-soft)] text-[var(--plasma)] font-medium">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)] text-center py-8">No notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={cn('px-4 py-3 hover:bg-[var(--raised)] transition-colors', !n.isRead && 'bg-[var(--plasma-soft)]/30')}>
                        <div className="flex items-start gap-3">
                          <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', TYPE_COLORS[n.type].split(' ')[0].replace('bg-', 'bg-').replace('/15', ''))} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--text)]">{n.title}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <Link to="/profile" className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--plasma-soft)] flex items-center justify-center flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-[var(--plasma)]">
                  {getInitials(`${user?.firstName} ${user?.lastName}`)}
                </span>
            }
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-[var(--text)] leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{user?.employeeId}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
