import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import { getById } from '@/services/storage.service';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { monthLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import type { Payslip } from '@/types';
import toast from 'react-hot-toast';

export default function PayslipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const payslip = getById<Payslip>('payslips', id!);

  if (!payslip) return <div className="text-sm text-[var(--text-muted)] p-8">Payslip not found.</div>;

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <div className={`flex justify-between py-2 border-b border-[var(--border)] text-sm ${bold ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
      <span>{label}</span><span className="tabular-nums">{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(ROUTES.PAYSLIPS)} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          <ArrowLeft size={14}/> Back
        </button>
        <button onClick={() => toast.success('Download feature coming soon!')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
          <Download size={14}/> Download PDF
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--plasma)] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold opacity-80">CyberSynap Technologies</p>
              <p className="text-2xl font-bold mt-1">{monthLabel(payslip.month)}</p>
              <p className="text-sm opacity-70 mt-1">Pay Slip</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm opacity-70">Net Salary</p>
              <p className="text-3xl font-bold tabular-nums">{formatCurrency(payslip.netSalary)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Employee info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[['Employee', `${user?.firstName} ${user?.lastName}`], ['Employee ID', user?.employeeId ?? ''],
              ['Designation', user?.designation ?? ''], ['Department', user?.department ?? ''],
              ['Working Days', String(payslip.workingDays)], ['Present Days', String(payslip.presentDays)],
              ['Paid Leaves', String(payslip.paidLeaves)], ['LOP Days', String(payslip.lopDays)]].map(([l,v]) => (
              <div key={l} className="bg-[var(--raised)] rounded-lg p-2.5">
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{l}</p>
                <p className="text-sm font-medium text-[var(--text)] mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Earnings */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Earnings</p>
            {payslip.earnings.map(e => <Row key={e.label} label={e.label} value={formatCurrency(e.amount)} />)}
            <Row label="Gross Salary" value={formatCurrency(payslip.grossSalary)} bold />
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Deductions</p>
            {payslip.deductions.map(d => <Row key={d.label} label={d.label} value={`-${formatCurrency(d.amount)}`} />)}
          </div>

          {/* Net */}
          <div className="rounded-xl bg-[var(--aurora-soft)] border border-[var(--aurora)]/20 p-4 flex justify-between items-center">
            <p className="text-sm font-semibold text-[var(--text)]">Net Salary (Take Home)</p>
            <p className="text-xl font-bold text-[var(--aurora)] tabular-nums">{formatCurrency(payslip.netSalary)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
