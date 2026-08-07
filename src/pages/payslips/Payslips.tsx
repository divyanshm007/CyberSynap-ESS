import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { PageHeader, DataTable, ExportButton, exportToCSV } from '@/components/shared';
import { monthLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants';
import type { Payslip } from '@/types';

export default function Payslips() {
  const { user } = useAuth();
  const payslips = useMemo(() =>
    query<Payslip>('payslips', p => p.userId === user!.id).sort((a,b) => b.month.localeCompare(a.month)),
    [user]);

  const columns: ColumnDef<Payslip>[] = [
    { accessorKey: 'month',       header: 'Month',        cell: ({ getValue }) => monthLabel(getValue() as string) },
    { accessorKey: 'grossSalary', header: 'Gross',        cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: 'netSalary',   header: 'Net Salary',   cell: ({ getValue }) =>
        <span className="tabular-nums font-semibold text-[var(--aurora)]">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: 'presentDays', header: 'Present Days', cell: ({ row }) => `${row.original.presentDays}/${row.original.workingDays}` },
    { id: 'actions', header: '', cell: ({ row }) =>
        <Link to={ROUTES.PAYSLIP_DETAIL.replace(':id', row.original.id)} className="text-xs text-[var(--plasma)] hover:underline">View</Link> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payslips" subtitle="Download and view your monthly salary statements."
        actions={<ExportButton onExportCSV={() => exportToCSV(payslips as any[], 'payslips')} />}
      />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={payslips} columns={columns} searchPlaceholder="Search by month…" pageSize={12} />
      </motion.div>
    </div>
  );
}
