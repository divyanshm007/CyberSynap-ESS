import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { PageHeader, DataTable, StatusBadge, ExportButton, exportToCSV, ConfirmDialog } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { useCRUD } from '@/hooks';
import { ROUTES } from '@/constants';
import type { LeaveRequest, LeaveBalance } from '@/types';
import toast from 'react-hot-toast';

export default function Leave() {
  const { user } = useAuth();
  const { destroy } = useCRUD<LeaveRequest>('leaves');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const leaves = useMemo(() =>
    query<LeaveRequest>('leaves', l => l.userId === user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [user]);

  const balance = useMemo(() =>
    query<LeaveBalance>('leaveBalances', b => b.userId === user!.id)[0],
    [user]);

  const columns: ColumnDef<LeaveRequest>[] = [
    { accessorKey: 'type',      header: 'Type',       cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'startDate', header: 'From',       cell: ({ getValue }) => fmtDate(getValue() as string) },
    { accessorKey: 'endDate',   header: 'To',         cell: ({ getValue }) => fmtDate(getValue() as string) },
    { accessorKey: 'days',      header: 'Days',       cell: ({ getValue }) => `${getValue()} day(s)` },
    { accessorKey: 'reason',    header: 'Reason',     cell: ({ getValue }) => <span className="text-xs text-[var(--text-muted)]">{getValue() as string}</span> },
    { accessorKey: 'status',    header: 'Status',     cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => row.original.status === 'pending'
        ? <button onClick={() => setCancelId(row.original.id)} className="text-xs text-red-500 hover:underline">Cancel</button>
        : null,
    },
  ];

  const handleCancel = () => {
    if (cancelId) {
      destroy(cancelId);
      toast.success('Leave request cancelled.');
      setCancelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Track and manage your leave requests."
        actions={
          <div className="flex gap-2">
            <ExportButton onExportCSV={() => exportToCSV(leaves as any[], 'leave-requests')} />
            <Link to={ROUTES.LEAVE_APPLY}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
              <Plus size={15} /> Apply Leave
            </Link>
          </div>
        }
      />

      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Annual Leave',  total: balance.annual,   used: balance.usedAnnual,  accent: 'plasma' as const },
            { label: 'Sick Leave',    total: balance.sick,     used: balance.usedSick,    accent: 'red'    as const },
            { label: 'Casual Leave',  total: balance.casual,   used: balance.usedCasual,  accent: 'aurora' as const },
            { label: 'Comp Off',      total: balance.comp_off, used: balance.usedComp,    accent: 'violet' as const },
          ].map((b, i) => (
            <motion.div key={b.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{b.label}</p>
              <p className="text-2xl font-bold text-[var(--text)] tabular-nums mt-2">{b.total - b.used}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">of {b.total} remaining</p>
              <div className="mt-3 h-1.5 rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[var(--plasma)]" style={{ width: `${((b.total - b.used) / b.total) * 100}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={leaves} columns={columns} searchPlaceholder="Search leaves…" pageSize={10} />
      </motion.div>

      <ConfirmDialog open={!!cancelId} title="Cancel Leave Request"
        description="Are you sure you want to cancel this leave request? This action cannot be undone."
        confirmLabel="Yes, Cancel" onConfirm={handleCancel} onCancel={() => setCancelId(null)} />
    </div>
  );
}
