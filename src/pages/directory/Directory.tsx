import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, MapPin } from 'lucide-react';
import { getAll } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { getInitials } from '@/utils';
import type { User } from '@/types';

export default function Directory() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');

  const users = useMemo(() =>
    getAll<User>('users').filter(u => u.status === 'active' && u.role === 'employee'),
    []);

  const departments = ['all', ...Array.from(new Set(users.map(u => u.department))).sort()];

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (dept === 'all' || u.department === dept) &&
      (!q || `${u.firstName} ${u.lastName} ${u.designation} ${u.department}`.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Company Directory" subtitle={`${users.length} team members across ${departments.length - 1} departments.`} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)]" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]">
          {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{filtered.length} results</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((u, i) => (
          <motion.div key={u.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col items-center text-center gap-2 hover:border-[var(--plasma)] transition-colors">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[var(--plasma-soft)] flex items-center justify-center">
              {u.avatar
                ? <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                : <span className="text-lg font-bold text-[var(--plasma)]">{getInitials(`${u.firstName} ${u.lastName}`)}</span>
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{u.firstName} {u.lastName}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{u.designation}</p>
              <p className="text-[11px] text-[var(--plasma)] mt-1">{u.department}</p>
            </div>
            <div className="w-full pt-2 border-t border-[var(--border)] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Mail size={10}/> <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <MapPin size={10}/> {u.location}
              </div>
            </div>
          </motion.div>
        ))}
        {!filtered.length && <div className="col-span-full text-center py-12 text-sm text-[var(--text-muted)]">No employees found.</div>}
      </div>
    </div>
  );
}
