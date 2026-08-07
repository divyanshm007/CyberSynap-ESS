import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  accent?: 'plasma' | 'aurora' | 'green' | 'amber' | 'red' | 'violet';
  className?: string;
  delay?: number;
}

const ACCENT_STYLES = {
  plasma:  { bg: 'bg-[var(--plasma-soft)]', text: 'text-[var(--plasma)]', value: 'text-[var(--plasma)]' },
  aurora:  { bg: 'bg-[var(--aurora-soft)]', text: 'text-[var(--aurora)]', value: 'text-[var(--aurora)]' },
  green:   { bg: 'bg-green-500/10',  text: 'text-green-500',  value: 'text-green-500'  },
  amber:   { bg: 'bg-amber-500/10',  text: 'text-amber-500',  value: 'text-amber-500'  },
  red:     { bg: 'bg-red-500/10',    text: 'text-red-500',    value: 'text-red-500'    },
  violet:  { bg: 'bg-violet-500/10', text: 'text-violet-500', value: 'text-violet-500' },
};

export default function StatCard({ label, value, icon, trend, accent = 'plasma', className, delay = 0 }: Props) {
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', styles.bg)}>
          <span className={styles.text}>{icon}</span>
        </div>
      </div>
      <div>
        <p className={cn('text-2xl font-bold tabular-nums', styles.value)}>{value}</p>
        {trend && (
          <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-500' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </motion.div>
  );
}
