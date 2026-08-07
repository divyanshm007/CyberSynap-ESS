import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ROUTES } from '@/constants';
import { useTheme } from '@/hooks';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Pages
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/dashboard/Dashboard';
import Profile from '@/pages/profile/Profile';
import Attendance from '@/pages/attendance/Attendance';
import Leave from '@/pages/leave/Leave';
import ApplyLeave from '@/pages/leave/ApplyLeave';
import Timesheets from '@/pages/timesheets/Timesheets';
import LogTime from '@/pages/timesheets/LogTime';
import Tickets from '@/pages/tickets/Tickets';
import CreateTicket from '@/pages/tickets/CreateTicket';
import TicketDetail from '@/pages/tickets/TicketDetail';
import Payslips from '@/pages/payslips/Payslips';
import PayslipDetail from '@/pages/payslips/PayslipDetail';
import Documents from '@/pages/documents/Documents';
import Directory from '@/pages/directory/Directory';
import Holidays from '@/pages/holidays/Holidays';
import Announcements from '@/pages/announcements/Announcements';
import Settings from '@/pages/settings/Settings';
import AdminUsers from '@/pages/admin/AdminUsers';

function ThemeInit() {
  const { theme, setTheme } = useTheme();
  useEffect(() => { setTheme(theme); }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD}     element={<Dashboard />} />
            <Route path={ROUTES.PROFILE}       element={<Profile />} />
            <Route path={ROUTES.ATTENDANCE}    element={<Attendance />} />
            <Route path={ROUTES.LEAVE}         element={<Leave />} />
            <Route path={ROUTES.LEAVE_APPLY}   element={<ApplyLeave />} />
            <Route path={ROUTES.TIMESHEETS}    element={<Timesheets />} />
            <Route path={ROUTES.TIMESHEETS_LOG} element={<LogTime />} />
            <Route path={ROUTES.TICKETS}       element={<Tickets />} />
            <Route path={ROUTES.TICKET_CREATE} element={<CreateTicket />} />
            <Route path={ROUTES.TICKET_DETAIL} element={<TicketDetail />} />
            <Route path={ROUTES.PAYSLIPS}      element={<Payslips />} />
            <Route path={ROUTES.PAYSLIP_DETAIL} element={<PayslipDetail />} />
            <Route path={ROUTES.DOCUMENTS}     element={<Documents />} />
            <Route path={ROUTES.DIRECTORY}     element={<Directory />} />
            <Route path={ROUTES.HOLIDAYS}      element={<Holidays />} />
            <Route path={ROUTES.ANNOUNCEMENTS} element={<Announcements />} />
            <Route path={ROUTES.SETTINGS}      element={<Settings />} />
            <Route path={ROUTES.ADMIN_USERS}   element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
