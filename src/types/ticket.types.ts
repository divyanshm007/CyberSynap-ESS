export type TicketCategory = 'it' | 'hr' | 'payroll' | 'facilities' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketComment {
  id: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;  // CYB-001
  userId: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  assignedTo?: string;
  comments: TicketComment[];
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
