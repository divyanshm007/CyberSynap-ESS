import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';
import { getAll } from '@/services/storage.service';
import { PageHeader, DataTable, StatusBadge, ExportButton, exportToCSV } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { getInitials } from '@/utils';
import type { User } from '@/types';

export default function AdminUsers() {
  const users = useMemo(() => getAll<User>('users'), []);
  const depts = ['all', ...Array.from(new Set(users.map(u => u.department))).sort()];
  const [dept, setDept] = useState('all');

  const filtered = users.filter(u => dept === 'all' || u.department === dept);

  const columns: ColumnDef<User>[] = [
    { id: 'avatar', header: '', cell: ({ row: { original: u } }) => (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--plasma-soft)] flex items-center justify-center text-xs font-bold text-[var(--plasma)]">
          {u.avatar ? <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" /> : getInitials(`${u.firstName} ${u.lastName}`)}
        </div>), enableSorting: false },
    { id: 'name', header: 'Name', accessorFn: u => `${u.firstName} ${u.lastName}`,
      cell: ({ row: { original: u } }) => (
        <div><p className="text-sm font-medium text-[var(--text)]">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-[var(--text-muted)]">{u.email}</p></div>) },
    { accessorKey: 'employeeId', header: 'ID',         cell: ({ getValue }) => <span className="font-mono text-xs text-[var(--text-muted)]">{getValue() as string}</span> },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'department',  header: 'Department' },
    { accessorKey: 'role',        header: 'Role',       cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'status',      header: 'Status',     cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
    { accessorKey: 'joinDate',    header: 'Joined',     cell: ({ getValue }) => fmtDate(getValue() as string) },
  ];

  return (
    <div className="space-y-5 max-w-screen-xl">
      <PageHeader title="Admin — All Employees" subtitle={`Managing ${users.length} employees.`}
        actions={<ExportButton onExportCSV={() => exportToCSV(users as any[], 'employees')} />}
      />
      <div className="flex flex-wrap gap-1.5">
        {depts.map(d => (
          <button key={d} onClick={() => setDept(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dept === d ? 'bg-[var(--plasma)] text-white' : 'border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--raised)]'}`}>
            {d === 'all' ? 'All Departments' : d}
          </button>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={filtered} columns={columns} searchPlaceholder="Search employees…" pageSize={15} />
      </motion.div>
    </div>
  );
}
