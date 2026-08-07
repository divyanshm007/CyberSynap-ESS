export interface PayslipEarning {
  label: string;
  amount: number;
}

export interface PayslipDeduction {
  label: string;
  amount: number;
}

export interface Payslip {
  id: string;
  userId: string;
  month: string;          // "2025-01"
  grossSalary: number;
  netSalary: number;
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  workingDays: number;
  presentDays: number;
  paidLeaves: number;
  lopDays: number;
  generatedAt: string;
}
