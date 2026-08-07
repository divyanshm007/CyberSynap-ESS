import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Timer } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { PageHeader, StatCard, DataTable, StatusBadge, ExportButton, exportToCSV } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { formatHours } from '@/utils/format';
import { ROUTES } from '@/constants';
import type { TimesheetEntry } from '@/types';

const columns: ColumnDef<TimesheetEntry>[] = [
  { accessorKey: 'date',        header: 'Date',    cell: ({ getValue }) => fmtDate(getValue() as string) },
  { accessorKey: 'project',     header: 'Project'  },
  { accessorKey: 'task',        header: 'Task'     },
  { accessorKey: 'hours',       header: 'Hours',   cell: ({ getValue }) => formatHours(getValue() as number) },
  { accessorKey: 'description', header: 'Notes',   cell: ({ getValue }) => <span className="text-xs text-[var(--text-muted)] line-clamp-1">{getValue() as string}</span> },
  { accessorKey: 'status',      header: 'Status',  cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
];

export default function Timesheets() {
  const { user } = useAuth();
  const entries = useMemo(() =>
    query<TimesheetEntry>('timesheets', t => t.userId === user!.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [user]);

  const totalHrs = entries.reduce((s, e) => s + e.hours, 0);
  const approvedHrs = entries.filter(e => e.status === 'approved').reduce((s, e) => s + e.hours, 0);
  const pendingHrs  = entries.filter(e => e.status === 'submitted').reduce((s, e) => s + e.hours, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Timesheets" subtitle="Log and track your work hours by project."
        actions={
          <div className="flex gap-2">
            <ExportButton onExportCSV={() => exportToCSV(entries as any[], 'timesheets')} />
            <Link to={ROUTES.TIMESHEETS_LOG}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
              <Plus size={15}/> Log Time
            </Link>
          </div>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total Logged"   value={formatHours(totalHrs)}    icon={<Timer size={16}/>} accent="plasma" delay={0}    />
        <StatCard label="Approved"       value={formatHours(approvedHrs)} icon={<Timer size={16}/>} accent="green"  delay={0.05} />
        <StatCard label="Pending Review" value={formatHours(pendingHrs)}  icon={<Timer size={16}/>} accent="amber"  delay={0.1}  />
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={entries} columns={columns} searchPlaceholder="Search by project or task…" pageSize={12} />
      </motion.div>
    </div>
  );
}
