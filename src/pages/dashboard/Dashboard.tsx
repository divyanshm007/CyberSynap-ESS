import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Timer, Ticket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { StatCard, StatusBadge } from '@/components/shared';
import { fmtDate, fmtTime, monthLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants';
import type { AttendanceRecord, LeaveRequest, TimesheetEntry, Ticket as TicketType, Payslip } from '@/types';


function WelcomeBanner({ name, designation }: { name: string; designation: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 mb-6"
    >
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[var(--plasma)] opacity-[0.06] blur-2xl pointer-events-none" />
      <div className="absolute -right-8 bottom-0 w-36 h-36 rounded-full bg-[var(--aurora)] opacity-[0.07] blur-2xl pointer-events-none" />
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">{greeting}</p>
      <h1 className="text-xl font-bold text-[var(--text)]">{name} 👋</h1>
      <p className="text-sm text-[var(--text-muted)] mt-0.5">{designation} · {fmtDate(new Date())}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const attendance = useMemo(() =>
    query<AttendanceRecord>('attendance', r => r.userId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [user.id]);

  const leaves = useMemo(() =>
    query<LeaveRequest>('leaves', l => l.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [user.id]);

  const timesheets = useMemo(() =>
    query<TimesheetEntry>('timesheets', t => t.userId === user.id),
    [user.id]);

  const tickets = useMemo(() =>
    query<TicketType>('tickets', t => t.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [user.id]);

  const payslips = useMemo(() =>
    query<Payslip>('payslips', p => p.userId === user.id)
      .sort((a, b) => b.month.localeCompare(a.month)),
    [user.id]);

  const todayRecord = attendance.find(r => r.date === new Date().toISOString().split('T')[0]);
  const thisMonthAttend = attendance.filter(r => r.date.startsWith(new Date().toISOString().slice(0,7)));
  const presentDays = thisMonthAttend.filter(r => ['present','late','remote','half_day'].includes(r.status)).length;
  const openTickets = tickets.filter(t => ['open','in_progress'].includes(t.status)).length;
  const totalHrsThisWeek = timesheets.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1);
    return d >= weekStart;
  }).reduce((s, t) => s + t.hours, 0);

  // Monthly hours trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const hrs = timesheets.filter(t => t.date.startsWith(monthStr)).reduce((s, t) => s + t.hours, 0);
    return { month: d.toLocaleDateString('en-IN', { month: 'short' }), hours: hrs };
  });

  // Leave pie
  const leaveData = [
    { name: 'Used', value: leaves.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0) },
    { name: 'Available', value: 18 },
  ];

  const latestPayslip = payslips[0];

  return (
    <div className="space-y-6">
      <WelcomeBanner name={`${user.firstName}`} designation={user.designation} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Status" accent="plasma" delay={0.05}
          value={todayRecord ? todayRecord.status.replace('_',' ') : 'Not Marked'}
          icon={<Clock size={18} />}
          trend={todayRecord?.checkIn ? { value: 0, label: `In: ${fmtTime(todayRecord.checkIn)}` } : undefined}
        />
        <StatCard
          label="Present This Month" accent="aurora" delay={0.1}
          value={`${presentDays} days`}
          icon={<CheckCircle2 size={18} />}
          trend={{ value: 3, label: 'vs last month' }}
        />
        <StatCard
          label="Hours This Week" accent="violet" delay={0.15}
          value={`${totalHrsThisWeek}h`}
          icon={<Timer size={18} />}
        />
        <StatCard
          label="Open Tickets" accent={openTickets > 0 ? 'amber' : 'green'} delay={0.2}
          value={openTickets}
          icon={<Ticket size={18} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly hours chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}
          className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Work Hours — Last 6 Months</p>
              <p className="text-xs text-[var(--text-muted)]">Monthly logged hours trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--plasma)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--plasma)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Area type="monotone" dataKey="hours" stroke="var(--plasma)" strokeWidth={2} fill="url(#hoursGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leave balance donut */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <p className="text-sm font-semibold text-[var(--text)] mb-1">Leave Balance</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">{new Date().getFullYear()}</p>
          <div className="flex flex-col items-center">
            <PieChart width={120} height={120}>
              <Pie data={leaveData} cx={55} cy={55} innerRadius={35} outerRadius={52} paddingAngle={3} dataKey="value">
                <Cell fill="var(--plasma)" />
                <Cell fill="var(--border)" />
              </Pie>
            </PieChart>
            <div className="mt-3 space-y-1.5 w-full">
              {[{ label: 'Annual', total: 18 }, { label: 'Sick', total: 12 }, { label: 'Casual', total: 6 }].map(b => (
                <div key={b.label} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">{b.label}</span>
                  <span className="font-semibold text-[var(--text)] tabular-nums">{b.total} days</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent leave */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--text)]">Recent Leaves</p>
            <Link to={ROUTES.LEAVE} className="text-xs text-[var(--plasma)] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {leaves.slice(0, 4).map(l => (
              <div key={l.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-medium text-[var(--text)] capitalize">{l.type.replace('_',' ')}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{fmtDate(l.startDate)} · {l.days}d</p>
                </div>
                <StatusBadge variant={l.status} />
              </div>
            ))}
            {!leaves.length && <p className="text-xs text-[var(--text-muted)] py-2">No leave requests.</p>}
          </div>
        </motion.div>

        {/* Recent tickets */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--text)]">Support Tickets</p>
            <Link to={ROUTES.TICKETS} className="text-xs text-[var(--plasma)] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {tickets.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center justify-between py-1">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text)] truncate">{t.subject}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{t.ticketNumber}</p>
                </div>
                <StatusBadge variant={t.status} />
              </div>
            ))}
            {!tickets.length && <p className="text-xs text-[var(--text-muted)] py-2">No tickets raised.</p>}
          </div>
        </motion.div>

        {/* Latest payslip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--text)]">Latest Payslip</p>
            <Link to={ROUTES.PAYSLIPS} className="text-xs text-[var(--plasma)] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {latestPayslip ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--raised)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">{monthLabel(latestPayslip.month)}</p>
                <p className="text-xl font-bold text-[var(--aurora)] tabular-nums">{formatCurrency(latestPayslip.netSalary)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Net Salary · {latestPayslip.presentDays}/{latestPayslip.workingDays} days</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Gross</span>
                  <span className="font-medium text-[var(--text)] tabular-nums">{formatCurrency(latestPayslip.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Deductions</span>
                  <span className="font-medium text-red-500 tabular-nums">
                    -{formatCurrency(latestPayslip.grossSalary - latestPayslip.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No payslips available.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
