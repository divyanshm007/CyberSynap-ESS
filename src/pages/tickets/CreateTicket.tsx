import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { useAuth } from '@/hooks';
import { insert, getAll } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { ROUTES } from '@/constants';
import type { Ticket, TicketCategory, TicketPriority } from '@/types';
import toast from 'react-hot-toast';

export default function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: 'it' as TicketCategory, priority: 'medium' as TicketPriority,
    subject: '', description: '',
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const cls = "mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) { toast.error('Fill all fields.'); return; }
    const existing = getAll<Ticket>('tickets');
    const num = String(existing.length + 1).padStart(3, '0');
    const ticket: Ticket = {
      id: uuid(), userId: user!.id, ticketNumber: `CYB-${num}`,
      ...form, status: 'open', comments: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    insert('tickets', ticket);
    toast.success(`Ticket ${ticket.ticketNumber} created!`);
    navigate(ROUTES.TICKETS);
  };

  return (
    <div className="max-w-lg">
      <PageHeader title="New Support Ticket" subtitle="Describe your issue and we'll get back to you." />
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="field-label">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={cls}>
              {['it','hr','payroll','facilities','other'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select></div>
          <div><label className="field-label">Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className={cls}>
              {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select></div>
        </div>
        <div><label className="field-label">Subject</label>
          <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief summary of the issue…" className={cls} /></div>
        <div><label className="field-label">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
            placeholder="Describe the issue in detail…" className={`${cls} resize-none`} /></div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(ROUTES.TICKETS)}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)]">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">Submit Ticket</button>
        </div>
      </motion.form>
    </div>
  );
}
