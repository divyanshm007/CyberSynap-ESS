import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 mb-6', className)}>
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)] text-balance">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
