export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'maternity'
  | 'paternity'
  | 'unpaid'
  | 'comp_off';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  userId: string;
  year: number;
  annual: number;
  sick: number;
  casual: number;
  comp_off: number;
  usedAnnual: number;
  usedSick: number;
  usedCasual: number;
  usedComp: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  isHalfDay: boolean;
  session?: 'morning' | 'afternoon';
  createdAt: string;
  updatedAt: string;
}
