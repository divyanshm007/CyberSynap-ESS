export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'remote'
  | 'on_leave';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;          // ISO date: "2025-01-15"
  checkIn?: string;      // ISO datetime
  checkOut?: string;     // ISO datetime
  status: AttendanceStatus;
  workHours?: number;
  note?: string;
}

export interface AttendanceSummary {
  userId: string;
  month: string;         // "2025-01"
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  remote: number;
  onLeave: number;
  totalWorkHours: number;
  avgCheckIn: string;
}
