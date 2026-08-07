import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { PageHeader, StatCard, DataTable, StatusBadge, ExportButton, exportToCSV } from '@/components/shared';
import { timeAgo } from '@/utils/date';
import { ROUTES } from '@/constants';
import type { Ticket } from '@/types';

export default function Tickets() {
  const { user } = useAuth();

  const tickets = useMemo(() =>
    query<Ticket>('tickets', t => t.userId === user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [user]);

  const open       = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const resolved   = tickets.filter(t => t.status === 'resolved').length;

  const columns: ColumnDef<Ticket>[] = [
    { accessorKey: 'ticketNumber', header: 'Ticket #', meta: { mobileHide: true }, cell: ({ getValue }) =>
        <span className="font-mono text-xs text-[var(--plasma)]">{getValue() as string}</span> },
    { accessorKey: 'subject',  header: 'Subject',  cell: ({ getValue }) =>
        <span className="text-sm font-medium text-[var(--text)] line-clamp-1">{getValue() as string}</span> },
    { accessorKey: 'category', header: 'Category', meta: { mobileHide: true }, cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'status',   header: 'Status',   cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'createdAt',header: 'Raised',   meta: { mobileHide: true }, cell: ({ getValue }) => <span className="text-xs text-[var(--text-muted)]">{timeAgo(getValue() as string)}</span> },
    { id: 'actions', header: '', cell: ({ row }) =>
        <Link to={ROUTES.TICKET_DETAIL.replace(':id', row.original.id)} className="text-xs text-[var(--plasma)] hover:underline">View</Link> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" subtitle="Raise and track your IT, HR, and other requests."
        actions={
          <div className="flex gap-2">
            <ExportButton onExportCSV={() => exportToCSV(tickets as any[], 'tickets')} />
            <Link to={ROUTES.TICKET_CREATE}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
              <Plus size={15}/> New Ticket
            </Link>
          </div>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Open"        value={open}       icon={null} accent="amber"  delay={0}    />
        <StatCard label="In Progress" value={inProgress} icon={null} accent="violet" delay={0.05} />
        <StatCard label="Resolved"    value={resolved}   icon={null} accent="green"  delay={0.1}  />
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={tickets} columns={columns} searchPlaceholder="Search tickets…" pageSize={10} />
      </motion.div>
    </div>
  );
}
