import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAll } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { cn } from '@/utils/cn';

interface Holiday { id: string; name: string; date: string; type: string; description: string; }

const TYPE_STYLES: Record<string, string> = {
  national:   'bg-[var(--plasma-soft)] text-[var(--plasma)]',
  regional:   'bg-[var(--aurora-soft)] text-[var(--aurora)]',
  restricted: 'bg-amber-500/12 text-amber-500',
};

export default function Holidays() {
  const holidays = useMemo(() =>
    getAll<Holiday>('holidays').sort((a,b) => a.date.localeCompare(b.date)),
    []);

  const upcoming = holidays.filter(h => new Date(h.date) >= new Date());
  const past = holidays.filter(h => new Date(h.date) < new Date());
  const today = new Date().toISOString().split('T')[0];

  const renderList = (list: Holiday[]) => list.map((h, i) => {
    const isToday = h.date === today;
    return (
      <motion.div key={h.id}
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
        className={cn('flex items-center gap-4 p-4 rounded-xl border transition-colors',
          isToday ? 'border-[var(--plasma)] bg-[var(--plasma-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--raised)]')}>
        <div className="w-12 h-12 rounded-xl bg-[var(--raised)] flex flex-col items-center justify-center flex-shrink-0 border border-[var(--border)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">{new Date(h.date).toLocaleDateString('en-IN',{month:'short'})}</p>
          <p className="text-lg font-bold text-[var(--text)] leading-none">{new Date(h.date).getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">{h.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{fmtDate(h.date)} · {h.description}</p>
        </div>
        <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-medium capitalize', TYPE_STYLES[h.type] ?? 'bg-zinc-500/12 text-zinc-500')}>
          {h.type}
        </span>
        {isToday && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--plasma)] text-white font-medium">Today</span>}
      </motion.div>
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Holidays" subtitle={`${upcoming.length} upcoming holidays in ${new Date().getFullYear()}.`} />
      <div className="flex gap-3 flex-wrap">
        {[['National', 'plasma'], ['Regional', 'aurora'], ['Restricted', 'amber']].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <div className={`w-2.5 h-2.5 rounded-full ${c === 'plasma' ? 'bg-[var(--plasma)]' : c === 'aurora' ? 'bg-[var(--aurora)]' : 'bg-amber-500'}`} />
            {l}
          </div>
        ))}
      </div>
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Upcoming</p>
          <div className="space-y-2">{renderList(upcoming)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3 opacity-60">Past</p>
          <div className="space-y-2 opacity-50">{renderList(past)}</div>
        </div>
      )}
    </div>
  );
}
