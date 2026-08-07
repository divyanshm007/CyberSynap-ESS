import { cn } from '@/utils/cn';

type Variant =
  | 'present' | 'absent' | 'late' | 'remote' | 'half_day' | 'on_leave'
  | 'active' | 'inactive'
  | 'pending' | 'approved' | 'rejected' | 'cancelled'
  | 'open' | 'in_progress' | 'resolved' | 'closed'
  | 'low' | 'medium' | 'high' | 'critical'
  | 'draft' | 'submitted'
  | 'annual' | 'sick' | 'casual' | 'comp_off' | 'maternity' | 'paternity' | 'unpaid'
  | 'it' | 'hr' | 'payroll' | 'facilities' | 'other';

const STYLES: Record<string, string> = {
  // Attendance
  present:    'bg-green-500/12 text-green-600 dark:text-green-400',
  absent:     'bg-red-500/12 text-red-600 dark:text-red-400',
  late:       'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  remote:     'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400',
  half_day:   'bg-orange-500/12 text-orange-600 dark:text-orange-400',
  on_leave:   'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  // Status
  active:     'bg-green-500/12 text-green-600 dark:text-green-400',
  inactive:   'bg-zinc-500/12 text-zinc-500',
  // Leave
  pending:    'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  approved:   'bg-green-500/12 text-green-600 dark:text-green-400',
  rejected:   'bg-red-500/12 text-red-600 dark:text-red-400',
  cancelled:  'bg-zinc-500/12 text-zinc-500',
  // Ticket status
  open:       'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  in_progress:'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  resolved:   'bg-green-500/12 text-green-600 dark:text-green-400',
  closed:     'bg-zinc-500/12 text-zinc-500',
  // Priority
  low:        'bg-green-500/12 text-green-600 dark:text-green-400',
  medium:     'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  high:       'bg-red-500/12 text-red-600 dark:text-red-400',
  critical:   'bg-red-600/20 text-red-700 dark:text-red-400 font-semibold',
  // Timesheet
  draft:      'bg-zinc-500/12 text-zinc-500',
  submitted:  'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  // Leave types
  annual:     'bg-[var(--plasma-soft)] text-[var(--plasma)]',
  sick:       'bg-red-500/12 text-red-600 dark:text-red-400',
  casual:     'bg-teal-500/12 text-teal-600 dark:text-teal-400',
  comp_off:   'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  maternity:  'bg-pink-500/12 text-pink-600 dark:text-pink-400',
  paternity:  'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
  unpaid:     'bg-zinc-500/12 text-zinc-500',
  // Ticket categories
  it:         'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  hr:         'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  payroll:    'bg-green-500/12 text-green-600 dark:text-green-400',
  facilities: 'bg-orange-500/12 text-orange-600 dark:text-orange-400',
  other:      'bg-zinc-500/12 text-zinc-500',
};

const LABELS: Record<string, string> = {
  half_day: 'Half Day', on_leave: 'On Leave', in_progress: 'In Progress',
  comp_off: 'Comp Off', annual: 'Annual', sick: 'Sick',
};

interface Props {
  variant: Variant | string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ variant, size = 'sm', className }: Props) {
  const style = STYLES[variant] ?? 'bg-zinc-500/12 text-zinc-500';
  const label = LABELS[variant] ?? variant.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full capitalize',
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      style, className,
    )}>
      {label}
    </span>
  );
}
