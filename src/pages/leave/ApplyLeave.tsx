import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { useAuth } from '@/hooks';
import { insert } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { ROUTES } from '@/constants';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import type { LeaveRequest, LeaveType } from '@/types';
import toast from 'react-hot-toast';

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'annual',    label: 'Annual Leave' },
  { value: 'sick',      label: 'Sick Leave' },
  { value: 'casual',    label: 'Casual Leave' },
  { value: 'comp_off',  label: 'Comp Off' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid',    label: 'Unpaid Leave' },
];

export default function ApplyLeave() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: 'annual' as LeaveType, startDate: '', endDate: '', reason: '', isHalfDay: false });
  const [loading, setLoading] = useState(false);

  const days = form.startDate && form.endDate
    ? Math.max(1, differenceInBusinessDays(parseISO(form.endDate), parseISO(form.startDate)) + 1)
    : 0;

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason.trim()) { toast.error('Fill all fields.'); return; }
    setLoading(true);
    const record: LeaveRequest = {
      id: uuid(), userId: user!.id, ...form, days,
      status: 'pending', isHalfDay: form.isHalfDay,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    insert('leaves', record);
    toast.success('Leave request submitted!');
    navigate(ROUTES.LEAVE);
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Apply for Leave" subtitle="Submit a new leave request for approval." />
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <div>
          <label className="field-label">Leave Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]">
            {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">From</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]" />
          </div>
          <div>
            <label className="field-label">To</label>
            <input type="date" value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]" />
          </div>
        </div>
        {days > 0 && (
          <p className="text-xs text-[var(--plasma)] font-medium">{days} business day(s) selected</p>
        )}
        <div>
          <label className="field-label">Reason</label>
          <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={3} placeholder="Brief reason for your leave…"
            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)] resize-none" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isHalfDay} onChange={e => set('isHalfDay', e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--plasma)]" />
          <span className="text-sm text-[var(--text)]">Half Day Leave</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(ROUTES.LEAVE)}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)]">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
