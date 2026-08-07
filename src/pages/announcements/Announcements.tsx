import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Search } from 'lucide-react';
import { getAll } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { timeAgo } from '@/utils/date';
import { cn } from '@/utils/cn';

interface Announcement { id: string; title: string; content: string; authorId: string; isPinned: boolean; tags: string[]; createdAt: string; }

export default function Announcements() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');

  const all = useMemo(() =>
    getAll<Announcement>('announcements').sort((a,b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }), []);

  const allTags = ['all', ...Array.from(new Set(all.flatMap(a => a.tags))).sort()];
  const filtered = all.filter(a =>
    (tag === 'all' || a.tags.includes(tag)) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-5">
      <PageHeader title="Announcements" subtitle="Company-wide updates, policy changes, and events." />
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                tag === t ? 'bg-[var(--plasma)] text-white' : 'border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--raised)]')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a, i) => (
          <motion.div key={a.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={cn('rounded-xl border p-5 bg-[var(--surface)]',
              a.isPinned ? 'border-[var(--plasma)] ring-1 ring-[var(--plasma)]/20' : 'border-[var(--border)]')}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {a.isPinned && <Pin size={13} className="text-[var(--plasma)] fill-current" />}
                <h3 className="text-sm font-semibold text-[var(--text)]">{a.title}</h3>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{timeAgo(a.createdAt)}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">{a.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {a.tags.map(t => (
                <button key={t} onClick={() => setTag(t)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--raised)] text-[var(--text-muted)] hover:bg-[var(--plasma-soft)] hover:text-[var(--plasma)] transition-colors capitalize">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
        {!filtered.length && <p className="text-sm text-center text-[var(--text-muted)] py-10">No announcements found.</p>}
      </div>
    </div>
  );
}
