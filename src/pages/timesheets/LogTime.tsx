import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { startOfWeek, format } from 'date-fns';
import { useAuth } from '@/hooks';
import { insert } from '@/services/storage.service';
import { PageHeader } from '@/components/shared';
import { ROUTES } from '@/constants';
import type { TimesheetEntry } from '@/types';
import toast from 'react-hot-toast';

const PROJECTS = ['CyberSynap Platform','Client Portal v2','Mobile App','Internal Tools','Infrastructure Upgrade','Design System','Other'];
const TASKS    = ['Development','Code Review','Testing','Bug Fixes','Documentation','Meeting','Research','Design Review','Planning'];

export default function LogTime() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), project: PROJECTS[0], task: TASKS[0], hours: 8, description: '' });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { toast.error('Add a description.'); return; }
    const weekOf = format(startOfWeek(new Date(form.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const entry: TimesheetEntry = {
      id: uuid(), userId: user!.id, ...form, weekOf, status: 'draft',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    insert('timesheets', entry);
    toast.success('Time logged successfully!');
    navigate(ROUTES.TIMESHEETS);
  };

  const InputClass = "mt-1 w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]";

  return (
    <div className="max-w-lg">
      <PageHeader title="Log Time" subtitle="Record your work hours for a specific date." />
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <div><label className="field-label">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={InputClass} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="field-label">Project</label>
            <select value={form.project} onChange={e => set('project', e.target.value)} className={InputClass}>
              {PROJECTS.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className="field-label">Task</label>
            <select value={form.task} onChange={e => set('task', e.target.value)} className={InputClass}>
              {TASKS.map(t => <option key={t}>{t}</option>)}</select></div>
        </div>
        <div><label className="field-label">Hours</label>
          <input type="number" min={0.5} max={16} step={0.5} value={form.hours} onChange={e => set('hours', +e.target.value)} className={InputClass} /></div>
        <div><label className="field-label">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            placeholder="What did you work on?" className={`${InputClass} resize-none`} /></div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(ROUTES.TIMESHEETS)}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)]">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">Save Entry</button>
        </div>
      </motion.form>
    </div>
  );
}
