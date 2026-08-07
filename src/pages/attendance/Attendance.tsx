import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, Wifi, LogIn, LogOut, Timer, Plus, X, PenLine } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks';
import { query, insert, update } from '@/services/storage.service';
import { PageHeader, StatCard, DataTable, StatusBadge, ExportButton, exportToCSV } from '@/components/shared';
import { fmtDate, fmtTime } from '@/utils/date';
import { formatHours } from '@/utils/format';
import type { AttendanceRecord, PortalSession } from '@/types';

/* ── helpers ── */
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const nowISO = () => new Date().toISOString();

function calcHours(checkIn: string, checkOut: string) {
  return Math.round(((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000) * 100) / 100;
}
function combineDT(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}
function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function fmtDur(mins?: number) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function isoToLocalDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

const STATUS_OPTIONS: AttendanceRecord['status'][] = ['present', 'late', 'remote', 'half_day', 'absent', 'on_leave'];

const columns: ColumnDef<AttendanceRecord>[] = [
  { accessorKey: 'date',      header: 'Date',       cell: ({ getValue }) => fmtDate(getValue() as string) },
  { accessorKey: 'status',    header: 'Status',     cell: ({ getValue }) => <StatusBadge variant={getValue() as string} size="sm" /> },
  { accessorKey: 'checkIn',   header: 'Check In',   cell: ({ getValue }) => getValue() ? fmtTime(getValue() as string) : '—', enableSorting: false },
  { accessorKey: 'checkOut',  header: 'Check Out',  cell: ({ getValue }) => getValue() ? fmtTime(getValue() as string) : '—', enableSorting: false, meta: { mobileHide: true } },
  { accessorKey: 'workHours', header: 'Hours',      cell: ({ getValue }) => getValue() ? formatHours(getValue() as number) : '—', meta: { mobileHide: true } },
  { accessorKey: 'note',      header: 'Note',       cell: ({ getValue }) => getValue() || '—', enableSorting: false, meta: { mobileHide: true } },
];

/* ── Modal wrapper ── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--raised)]"><X size={16} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Field ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)] transition-colors";

/* ══════════════════════════════════════ */
export default function Attendance() {
  const { user } = useAuth();
  const [month, setMonth]   = useState(new Date().toISOString().slice(0, 7));
  const [tick, setTick]     = useState(0); // force refresh after mutations
  const refresh = useCallback(() => setTick(t => t + 1), []);

  /* attendance records */
  const records = useMemo(() =>
    query<AttendanceRecord>('attendance', r => r.userId === user!.id && r.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, month, tick]);

  /* portal sessions */
  const portalSessions = useMemo(() =>
    query<PortalSession>('portal_sessions', s => s.userId === user!.id)
      .sort((a, b) => b.loginAt.localeCompare(a.loginAt))
      .slice(0, 15),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, tick]);

  /* today's records */
  const today      = todayStr();
  const todayRec   = records.find(r => r.date === today);
  const todaySess  = portalSessions.filter(s => isoToLocalDate(s.loginAt) === today);
  const activeSess = todaySess.find(s => !s.logoutAt);

  /* stats */
  const present  = records.filter(r => ['present','late','remote','half_day'].includes(r.status)).length;
  const absent   = records.filter(r => r.status === 'absent').length;
  const late     = records.filter(r => r.status === 'late').length;
  const remote   = records.filter(r => r.status === 'remote').length;
  const totalHrs = records.reduce((s, r) => s + (r.workHours ?? 0), 0);

  /* ── Check In ── */
  const handleCheckIn = () => {
    const ci = nowISO();
    if (todayRec) {
      update<AttendanceRecord>('attendance', todayRec.id, { checkIn: ci, status: 'present' });
    } else {
      insert<AttendanceRecord>('attendance', {
        id: `att_${user!.id}_${today}`,
        userId: user!.id,
        date: today,
        checkIn: ci,
        status: 'present',
      });
    }
    refresh();
  };

  /* ── Check Out ── */
  const handleCheckOut = () => {
    if (!todayRec) return;
    const co = nowISO();
    const wh = todayRec.checkIn ? calcHours(todayRec.checkIn, co) : undefined;
    update<AttendanceRecord>('attendance', todayRec.id, { checkOut: co, ...(wh !== undefined ? { workHours: wh } : {}) });
    refresh();
  };

  /* ── Manual Attendance Entry ── */
  const [showAttModal, setShowAttModal] = useState(false);
  const [attForm, setAttForm] = useState({
    date: today, checkIn: '09:00', checkOut: '18:00',
    status: 'present' as AttendanceRecord['status'], note: '',
  });

  const saveAttEntry = () => {
    const ci = attForm.checkIn ? combineDT(attForm.date, attForm.checkIn) : undefined;
    const co = attForm.checkOut && ci ? combineDT(attForm.date, attForm.checkOut) : undefined;
    const wh = ci && co ? calcHours(ci, co) : undefined;
    const existing = query<AttendanceRecord>('attendance', r => r.userId === user!.id && r.date === attForm.date)[0];
    if (existing) {
      update<AttendanceRecord>('attendance', existing.id, {
        checkIn: ci, checkOut: co, status: attForm.status, note: attForm.note, workHours: wh,
      });
    } else {
      insert<AttendanceRecord>('attendance', {
        id: `att_${user!.id}_${attForm.date}`,
        userId: user!.id,
        date: attForm.date,
        checkIn: ci,
        checkOut: co,
        status: attForm.status,
        note: attForm.note,
        workHours: wh,
      });
    }
    setShowAttModal(false);
    refresh();
  };

  /* ── Manual Portal Session Entry ── */
  const [showSessModal, setShowSessModal] = useState(false);
  const [sessForm, setSessForm] = useState({
    date: today, loginTime: '09:00', logoutTime: '18:00',
  });

  const saveSessEntry = () => {
    const loginAt  = combineDT(sessForm.date, sessForm.loginTime);
    const logoutAt = sessForm.logoutTime ? combineDT(sessForm.date, sessForm.logoutTime) : undefined;
    const durationMins = logoutAt
      ? Math.round((new Date(logoutAt).getTime() - new Date(loginAt).getTime()) / 60000)
      : undefined;
    insert<PortalSession>('portal_sessions', {
      id: `ps_manual_${Date.now()}`,
      userId: user!.id,
      loginAt,
      ...(logoutAt ? { logoutAt, durationMins } : {}),
    });
    setShowSessModal(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Track your daily attendance, check-in/out times and portal sessions."
        actions={
          <div className="flex items-center gap-2">
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]" />
            <ExportButton onExportCSV={() => exportToCSV(records as any[], `attendance-${month}`)} />
          </div>
        }
      />

      {/* ── Today's Punch Card ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--aurora-soft)] flex items-center justify-center">
              <Clock size={14} className="text-[var(--aurora)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Today's Punch</p>
              <p className="text-xs text-[var(--text-muted)]">{new Date().toLocaleDateString([], { weekday:'long', day:'numeric', month:'long' })}</p>
            </div>
          </div>
          <button onClick={() => { setAttForm(f => ({ ...f, date: today })); setShowAttModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--raised)] transition-colors">
            <PenLine size={12} /> Manual Entry
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Status</p>
            {todayRec
              ? <StatusBadge variant={todayRec.status} size="sm" />
              : <span className="text-xs text-[var(--text-muted)]">Not Marked</span>}
          </div>
          <div className="p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Check In</p>
            <p className="text-sm font-bold text-[var(--text)] font-mono">
              {todayRec?.checkIn ? fmtTime(todayRec.checkIn) : '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Check Out</p>
            <p className="text-sm font-bold text-[var(--text)] font-mono">
              {todayRec?.checkOut ? fmtTime(todayRec.checkOut) : '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Work Hours</p>
            <p className="text-sm font-bold text-[var(--text)]">
              {todayRec?.workHours ? formatHours(todayRec.workHours) : '—'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCheckIn}
            disabled={!!todayRec?.checkIn}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn size={16} /> Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!todayRec?.checkIn || !!todayRec?.checkOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOut size={16} /> Check Out
          </button>
        </div>
      </motion.div>

      {/* ── Portal Session Log ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--plasma-soft)] flex items-center justify-center">
              <Clock size={14} className="text-[var(--plasma)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Portal Session Log</p>
              <p className="text-xs text-[var(--text-muted)]">Login &amp; logout times from this ESS portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSess && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
              </span>
            )}
            <button onClick={() => { setSessForm(f => ({ ...f, date: today })); setShowSessModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--raised)] transition-colors">
              <Plus size={12} /> Add Manual
            </button>
          </div>
        </div>

        {/* Today's summary */}
        {todaySess.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <LogIn size={15} className="text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Today Login</p>
                <p className="text-base font-bold text-[var(--text)] font-mono">
                  {fmt(todaySess[todaySess.length - 1].loginAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <LogOut size={15} className="text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Today Logout</p>
                <p className="text-base font-bold font-mono">
                  {todaySess[0].logoutAt
                    ? <span className="text-[var(--text)]">{fmt(todaySess[0].logoutAt)}</span>
                    : <span className="text-green-500 text-sm">Still Active</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--raised)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--plasma-soft)] flex items-center justify-center flex-shrink-0">
                <Timer size={15} className="text-[var(--plasma)]" />
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Total Sessions</p>
                <p className="text-base font-bold text-[var(--text)]">{todaySess.length} session{todaySess.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-14 mb-4 rounded-lg bg-[var(--raised)] border border-dashed border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">No portal sessions recorded today</p>
          </div>
        )}

        {/* Recent sessions table */}
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Recent Sessions</p>
        <div className="rounded-lg border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--raised)]">
                {[
                  { label: 'Date', hide: false },
                  { label: 'Login Time', hide: false },
                  { label: 'Logout Time', hide: false },
                  { label: 'Duration', hide: true },
                  { label: 'Status', hide: false },
                ].map(({ label, hide }) => (
                  <th key={label} className={`text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide${hide ? ' hidden sm:table-cell' : ''}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {portalSessions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No sessions recorded yet</td></tr>
              ) : portalSessions.map(s => (
                <tr key={s.id} className="hover:bg-[var(--raised)] transition-colors">
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{dayLabel(s.loginAt)}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text)]">{fmt(s.loginAt)}</td>
                  <td className="px-4 py-2.5 font-mono text-[var(--text)]">{s.logoutAt ? fmt(s.logoutAt) : '—'}</td>
                  <td className="px-4 py-2.5 text-[var(--text)] hidden sm:table-cell">{fmtDur(s.durationMins)}</td>
                  <td className="px-4 py-2.5">
                    {s.logoutAt
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--raised)] text-[var(--text-muted)] border border-[var(--border)]">Completed</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Present"   value={present}               icon={<CheckCircle2 size={16}/>} accent="green"  delay={0} />
        <StatCard label="Absent"    value={absent}                icon={<XCircle size={16}/>}      accent="red"    delay={0.05} />
        <StatCard label="Late"      value={late}                  icon={<AlertCircle size={16}/>}  accent="amber"  delay={0.1} />
        <StatCard label="Remote"    value={remote}                icon={<Wifi size={16}/>}         accent="aurora" delay={0.15} />
        <StatCard label="Total Hrs" value={formatHours(totalHrs)} icon={<Clock size={16}/>}        accent="plasma" delay={0.2} />
      </div>

      {/* ── Attendance Table ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <DataTable data={records} columns={columns} searchPlaceholder="Search by date or status…" pageSize={15} />
      </motion.div>

      {/* ══ Manual Attendance Entry Modal ══ */}
      <Modal open={showAttModal} onClose={() => setShowAttModal(false)} title="Manual Attendance Entry">
        <div className="space-y-4">
          <Field label="Date">
            <input type="date" value={attForm.date} max={today}
              onChange={e => setAttForm(f => ({ ...f, date: e.target.value }))}
              className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={attForm.status} onChange={e => setAttForm(f => ({ ...f, status: e.target.value as any }))}
              className={inputCls}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Check In Time">
              <input type="time" value={attForm.checkIn}
                onChange={e => setAttForm(f => ({ ...f, checkIn: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="Check Out Time">
              <input type="time" value={attForm.checkOut}
                onChange={e => setAttForm(f => ({ ...f, checkOut: e.target.value }))}
                className={inputCls} />
            </Field>
          </div>
          <Field label="Note (optional)">
            <textarea rows={2} value={attForm.note} placeholder="WFH, offsite visit, etc."
              onChange={e => setAttForm(f => ({ ...f, note: e.target.value }))}
              className={inputCls + ' resize-none'} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAttModal(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)] transition-colors">
              Cancel
            </button>
            <button onClick={saveAttEntry}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Save Entry
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ Manual Portal Session Modal ══ */}
      <Modal open={showSessModal} onClose={() => setShowSessModal(false)} title="Add Manual Portal Session">
        <div className="space-y-4">
          <Field label="Date">
            <input type="date" value={sessForm.date} max={today}
              onChange={e => setSessForm(f => ({ ...f, date: e.target.value }))}
              className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Login Time">
              <input type="time" value={sessForm.loginTime}
                onChange={e => setSessForm(f => ({ ...f, loginTime: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="Logout Time">
              <input type="time" value={sessForm.logoutTime}
                onChange={e => setSessForm(f => ({ ...f, logoutTime: e.target.value }))}
                className={inputCls} />
            </Field>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Leave logout time empty to mark as an active session.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowSessModal(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)] transition-colors">
              Cancel
            </button>
            <button onClick={saveSessEntry}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Save Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
