export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  description: string;
  weekOf: string;        // Monday of that week ISO
  status: TimesheetStatus;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeekSummary {
  weekOf: string;
  totalHours: number;
  entries: TimesheetEntry[];
  status: TimesheetStatus;
}
