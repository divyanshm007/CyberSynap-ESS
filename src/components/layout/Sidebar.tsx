import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Clock, CalendarDays, Timer,
  FileText, FolderOpen, Ticket, Users, CalendarCheck,
  Megaphone, Settings, ChevronRight,
  Sun, Moon, LogOut, X,
} from 'lucide-react';
import { useAuth, useTheme } from '@/hooks';
import { NAV_ITEMS, NAV_GROUPS } from '@/constants';
import { getInitials } from '@/utils';
import { cn } from '@/utils/cn';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, User, Clock, CalendarDays, Timer,
  FileText, FolderOpen, Ticket, Users, CalendarCheck,
  Megaphone, Settings,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const { resolvedTheme, toggle } = useTheme();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles.some(r => hasRole(r))
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen flex flex-col transition-transform duration-300 ease-out',
          'w-[240px] border-r border-[var(--border)] bg-[var(--surface)]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="rounded-xl overflow-hidden bg-white p-1.5 flex-shrink-0">
            <img src="/cyber_synap_logo.png" alt="CyberSynap" className="h-7 w-auto object-contain block" />
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_GROUPS.map(group => {
            const groupItems = visibleItems.filter(i => i.group === group.key);
            if (!groupItems.length) return null;
            return (
              <div key={group.key} className="mb-1">
                {group.label && (
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    {group.label}
                  </p>
                )}
                {groupItems.map(item => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const isActive = location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-[var(--plasma-soft)] text-[var(--plasma)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]',
                      )}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight size={12} className="opacity-60" />}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom: user + theme */}
        <div className="border-t border-[var(--border)] p-3 space-y-1">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--raised)] hover:text-[var(--text)] transition-colors"
          >
            {resolvedTheme === 'dark'
              ? <Sun size={16} />
              : <Moon size={16} />}
            <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          {/* User card */}
          <div className="mt-2 flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--plasma-soft)] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-[var(--plasma)]">
                    {getInitials(`${user?.firstName} ${user?.lastName}`)}
                  </span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
