import type { Role } from '@/types';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  icon: string;          // lucide icon name
  roles: Role[];
  badge?: string;
  group?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Main
  { label: 'Dashboard',       path: ROUTES.DASHBOARD,     icon: 'LayoutDashboard', roles: ['super_admin','admin','employee'], group: 'main' },
  { label: 'My Profile',      path: ROUTES.PROFILE,       icon: 'User',            roles: ['super_admin','admin','employee'], group: 'main' },
  // Work
  { label: 'Attendance',      path: ROUTES.ATTENDANCE,    icon: 'Clock',           roles: ['super_admin','admin','employee'], group: 'work' },
  { label: 'Leave',           path: ROUTES.LEAVE,         icon: 'CalendarDays',    roles: ['super_admin','admin','employee'], group: 'work' },
  { label: 'Timesheets',      path: ROUTES.TIMESHEETS,    icon: 'Timer',           roles: ['super_admin','admin','employee'], group: 'work' },
  // Finance
  { label: 'Payslips',        path: ROUTES.PAYSLIPS,      icon: 'FileText',        roles: ['super_admin','admin','employee'], group: 'finance' },
  { label: 'Documents',       path: ROUTES.DOCUMENTS,     icon: 'FolderOpen',      roles: ['super_admin','admin','employee'], group: 'finance' },
  // Support
  { label: 'Support Tickets', path: ROUTES.TICKETS,       icon: 'Ticket',          roles: ['super_admin','admin','employee'], group: 'support' },
  // Company
  { label: 'Directory',       path: ROUTES.DIRECTORY,     icon: 'Users',           roles: ['super_admin','admin','employee'], group: 'company' },
  { label: 'Holidays',        path: ROUTES.HOLIDAYS,      icon: 'CalendarCheck',   roles: ['super_admin','admin','employee'], group: 'company' },
  { label: 'Announcements',   path: ROUTES.ANNOUNCEMENTS, icon: 'Megaphone',       roles: ['super_admin','admin','employee'], group: 'company' },
  // Misc
  { label: 'Settings',        path: ROUTES.SETTINGS,      icon: 'Settings',        roles: ['super_admin','admin','employee'], group: 'misc' },
];

export const NAV_GROUPS = [
  { key: 'main',    label: '' },
  { key: 'work',    label: 'Work' },
  { key: 'finance', label: 'Finance' },
  { key: 'support', label: 'Support' },
  { key: 'company', label: 'Company' },
  { key: 'misc',    label: '' },
];
