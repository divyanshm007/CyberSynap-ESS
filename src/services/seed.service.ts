import { v4 as uuid } from 'uuid';
import { bulkInsert } from './storage.service';
import type {
  User, Department, Notification,
  AttendanceRecord, AttendanceStatus,
  LeaveRequest, LeaveBalance, LeaveType, LeaveStatus,
  TimesheetEntry, TimesheetStatus,
  Ticket, TicketComment, TicketCategory, TicketPriority, TicketStatus,
  Payslip,
  Document, DocCategory,
} from '@/types';

/* ── helpers ── */
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rnd(0, arr.length - 1)];
const isoDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const monthsAgo = (n: number) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d; };

/* ── departments ── */
const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Engineering',       headId: 'emp-001', employeeCount: 12 },
  { id: 'dept-2', name: 'Product',           headId: 'emp-010', employeeCount: 6  },
  { id: 'dept-3', name: 'Design',            headId: 'emp-015', employeeCount: 5  },
  { id: 'dept-4', name: 'Human Resources',   headId: 'emp-020', employeeCount: 4  },
  { id: 'dept-5', name: 'Finance',           headId: 'emp-024', employeeCount: 4  },
  { id: 'dept-6', name: 'Marketing',         headId: 'emp-028', employeeCount: 5  },
  { id: 'dept-7', name: 'Sales',             headId: 'emp-033', employeeCount: 7  },
  { id: 'dept-8', name: 'Customer Success',  headId: 'emp-040', employeeCount: 5  },
  { id: 'dept-9', name: 'Operations',        headId: 'emp-045', employeeCount: 4  },
];

/* ── raw employee data ── */
const EMPLOYEE_RAW = [
  // Engineering
  { fn:'Arjun',    ln:'Sharma',    dept:'Engineering',      desig:'Senior Software Engineer',    salary:120000, loc:'Bengaluru' },
  { fn:'Priya',    ln:'Nair',      dept:'Engineering',      desig:'Software Engineer',            salary:85000,  loc:'Bengaluru' },
  { fn:'Rahul',    ln:'Verma',     dept:'Engineering',      desig:'Software Engineer',            salary:82000,  loc:'Hyderabad' },
  { fn:'Sneha',    ln:'Pillai',    dept:'Engineering',      desig:'Junior Developer',             salary:55000,  loc:'Pune'      },
  { fn:'Vikram',   ln:'Singh',     dept:'Engineering',      desig:'Lead Engineer',                salary:145000, loc:'Bengaluru' },
  { fn:'Ananya',   ln:'Gupta',     dept:'Engineering',      desig:'DevOps Engineer',              salary:110000, loc:'Bengaluru' },
  { fn:'Karthik',  ln:'Reddy',     dept:'Engineering',      desig:'Backend Developer',            salary:90000,  loc:'Hyderabad' },
  { fn:'Divya',    ln:'Menon',     dept:'Engineering',      desig:'QA Engineer',                  salary:72000,  loc:'Chennai'   },
  { fn:'Suresh',   ln:'Kumar',     dept:'Engineering',      desig:'Full Stack Developer',         salary:95000,  loc:'Bengaluru' },
  { fn:'Meera',    ln:'Iyer',      dept:'Engineering',      desig:'Frontend Developer',           salary:88000,  loc:'Mumbai'    },
  { fn:'Aditya',   ln:'Joshi',     dept:'Engineering',      desig:'Mobile Developer',             salary:92000,  loc:'Pune'      },
  { fn:'Lakshmi',  ln:'Devi',      dept:'Engineering',      desig:'Software Engineer',            salary:83000,  loc:'Chennai'   },
  // Product
  { fn:'Rohan',    ln:'Mehta',     dept:'Product',          desig:'Senior Product Manager',       salary:135000, loc:'Mumbai'    },
  { fn:'Ishita',   ln:'Shah',      dept:'Product',          desig:'Product Manager',              salary:115000, loc:'Bengaluru' },
  { fn:'Nikhil',   ln:'Patel',     dept:'Product',          desig:'Associate Product Manager',    salary:78000,  loc:'Ahmedabad' },
  { fn:'Pooja',    ln:'Agarwal',   dept:'Product',          desig:'Product Analyst',              salary:68000,  loc:'Delhi'     },
  { fn:'Siddharth',ln:'Rao',       dept:'Product',          desig:'Product Designer',             salary:90000,  loc:'Bengaluru' },
  { fn:'Kavya',    ln:'Krishnan',  dept:'Product',          desig:'Business Analyst',             salary:75000,  loc:'Chennai'   },
  // Design
  { fn:'Aarav',    ln:'Choudhary', dept:'Design',           desig:'Senior UI/UX Designer',        salary:105000, loc:'Bengaluru' },
  { fn:'Riya',     ln:'Malhotra',  dept:'Design',           desig:'UI Designer',                  salary:72000,  loc:'Delhi'     },
  { fn:'Harsh',    ln:'Trivedi',   dept:'Design',           desig:'Motion Designer',              salary:68000,  loc:'Mumbai'    },
  { fn:'Nisha',    ln:'Bose',      dept:'Design',           desig:'Brand Designer',               salary:70000,  loc:'Kolkata'   },
  { fn:'Aryan',    ln:'Kaur',      dept:'Design',           desig:'UX Researcher',                salary:82000,  loc:'Bengaluru' },
  // HR
  { fn:'Sunita',   ln:'Pandey',    dept:'Human Resources',  desig:'HR Manager',                   salary:110000, loc:'Delhi'     },
  { fn:'Manish',   ln:'Bhatt',     dept:'Human Resources',  desig:'HR Business Partner',          salary:85000,  loc:'Bengaluru' },
  { fn:'Deepa',    ln:'Sinha',     dept:'Human Resources',  desig:'Talent Acquisition Specialist',salary:70000,  loc:'Mumbai'    },
  { fn:'Rajesh',   ln:'Nag',       dept:'Human Resources',  desig:'HR Executive',                 salary:52000,  loc:'Pune'      },
  // Finance
  { fn:'Preeti',   ln:'Saxena',    dept:'Finance',          desig:'Finance Manager',              salary:120000, loc:'Delhi'     },
  { fn:'Vinay',    ln:'Dubey',     dept:'Finance',          desig:'Senior Accountant',            salary:88000,  loc:'Delhi'     },
  { fn:'Alka',     ln:'Mishra',    dept:'Finance',          desig:'Accountant',                   salary:62000,  loc:'Lucknow'   },
  { fn:'Tarun',    ln:'Khanna',    dept:'Finance',          desig:'Financial Analyst',            salary:80000,  loc:'Mumbai'    },
  // Marketing
  { fn:'Neha',     ln:'Chopra',    dept:'Marketing',        desig:'Marketing Manager',            salary:115000, loc:'Mumbai'    },
  { fn:'Akash',    ln:'Srivastava',dept:'Marketing',        desig:'Content Strategist',           salary:72000,  loc:'Delhi'     },
  { fn:'Pallavi',  ln:'Tiwari',    dept:'Marketing',        desig:'Digital Marketing Specialist', salary:68000,  loc:'Bengaluru' },
  { fn:'Gaurav',   ln:'Jain',      dept:'Marketing',        desig:'SEO Analyst',                  salary:58000,  loc:'Jaipur'    },
  { fn:'Shruti',   ln:'Dixit',     dept:'Marketing',        desig:'Social Media Manager',         salary:65000,  loc:'Mumbai'    },
  // Sales
  { fn:'Amit',     ln:'Kapoor',    dept:'Sales',            desig:'Sales Manager',                salary:130000, loc:'Delhi'     },
  { fn:'Ritika',   ln:'Bansal',    dept:'Sales',            desig:'Senior Sales Executive',       salary:95000,  loc:'Mumbai'    },
  { fn:'Sanjay',   ln:'Rawat',     dept:'Sales',            desig:'Sales Executive',              salary:75000,  loc:'Bengaluru' },
  { fn:'Anjali',   ln:'Shukla',    dept:'Sales',            desig:'Sales Executive',              salary:72000,  loc:'Hyderabad' },
  { fn:'Vivek',    ln:'Chauhan',   dept:'Sales',            desig:'Business Development Executive',salary:70000, loc:'Pune'      },
  { fn:'Poornima', ln:'Venkat',    dept:'Sales',            desig:'Sales Executive',              salary:74000,  loc:'Chennai'   },
  { fn:'Mohit',    ln:'Garg',      dept:'Sales',            desig:'Junior Sales Executive',       salary:50000,  loc:'Delhi'     },
  // Customer Success
  { fn:'Shweta',   ln:'Kulkarni',  dept:'Customer Success', desig:'CS Manager',                   salary:110000, loc:'Pune'      },
  { fn:'Naveen',   ln:'Balachandran',dept:'Customer Success',desig:'Senior CS Executive',         salary:82000,  loc:'Chennai'   },
  { fn:'Tanya',    ln:'Aggarwal',  dept:'Customer Success', desig:'CS Executive',                 salary:62000,  loc:'Delhi'     },
  { fn:'Pavan',    ln:'Naidu',     dept:'Customer Success', desig:'CS Executive',                 salary:60000,  loc:'Hyderabad' },
  { fn:'Harini',   ln:'Subramanian',dept:'Customer Success',desig:'CS Analyst',                  salary:58000,  loc:'Chennai'   },
  // Operations
  { fn:'Prasad',   ln:'Hegde',     dept:'Operations',       desig:'Operations Manager',           salary:115000, loc:'Bengaluru' },
  { fn:'Leela',    ln:'Murthy',    dept:'Operations',       desig:'Operations Executive',         salary:70000,  loc:'Hyderabad' },
  { fn:'Naresh',   ln:'Yadav',     dept:'Operations',       desig:'Office Administrator',         salary:45000,  loc:'Delhi'     },
  { fn:'Savita',   ln:'Nambiar',   dept:'Operations',       desig:'Facilities Manager',           salary:65000,  loc:'Bengaluru' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const SKILLS_POOL: Record<string, string[]> = {
  Engineering: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'GraphQL', 'Kubernetes'],
  Product: ['Roadmapping', 'Agile', 'Jira', 'User Research', 'A/B Testing', 'Figma', 'SQL', 'Analytics'],
  Design: ['Figma', 'Adobe XD', 'Illustrator', 'Prototyping', 'Usability Testing', 'Motion Design', 'Sketch'],
  'Human Resources': ['Recruitment', 'HRMS', 'Labour Law', 'Training & Development', 'Payroll', 'Employee Relations'],
  Finance: ['Excel', 'Tally', 'GST', 'Financial Modelling', 'Power BI', 'Budgeting', 'Auditing'],
  Marketing: ['Google Ads', 'HubSpot', 'SEO', 'Content Marketing', 'Analytics', 'Copywriting', 'Canva'],
  Sales: ['CRM', 'Negotiation', 'B2B Sales', 'Lead Generation', 'Salesforce', 'Cold Calling', 'Objection Handling'],
  'Customer Success': ['Zendesk', 'Customer Retention', 'Onboarding', 'NPS', 'Churn Analysis', 'Communication'],
  Operations: ['Process Improvement', 'Vendor Management', 'ERP', 'Supply Chain', 'Logistics', 'MS Office'],
};

function buildUsers(): User[] {
  const superAdmin: User = {
    id: 'user-super-admin',
    email: 'admin@cybersynap.com',
    password: 'Admin@123',
    role: 'super_admin',
    employeeId: 'CYB-000',
    firstName: 'Cypher',
    lastName: 'Admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=cypher`,
    department: 'Engineering',
    designation: 'Super Administrator',
    phone: '+91-9000000000',
    location: 'Bengaluru',
    joinDate: '2020-01-01',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    bloodGroup: 'O+',
    emergencyContact: { name: 'System Owner', relation: 'Self', phone: '+91-9000000001' },
    status: 'active',
    skills: ['System Administration', 'Security', 'Leadership'],
    bio: 'Platform super administrator with full system access.',
    salary: 250000,
    bankAccount: 'XXXX-XXXX-0001',
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  };

  const hrAdmin: User = {
    id: 'user-hr-admin',
    email: 'hr@cybersynap.com',
    password: 'Admin@123',
    role: 'admin',
    employeeId: 'CYB-020',
    firstName: 'Sunita',
    lastName: 'Pandey',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sunita`,
    department: 'Human Resources',
    designation: 'HR Manager',
    phone: '+91-9800200200',
    location: 'Delhi',
    joinDate: '2021-03-15',
    dateOfBirth: '1988-11-20',
    gender: 'female',
    bloodGroup: 'B+',
    emergencyContact: { name: 'Ramesh Pandey', relation: 'Husband', phone: '+91-9800200201' },
    status: 'active',
    skills: ['Recruitment', 'HRMS', 'Labour Law', 'Training & Development', 'Payroll'],
    bio: 'Experienced HR professional managing talent acquisition and employee relations.',
    salary: 110000,
    bankAccount: 'XXXX-XXXX-0020',
    createdAt: '2021-03-15T09:00:00.000Z',
    updatedAt: new Date().toISOString(),
  };

  const employees: User[] = EMPLOYEE_RAW.map((e, i) => {
    const idx = i + 1;
    const empId = `CYB-${String(idx).padStart(3, '0')}`;
    const userId = `user-emp-${String(idx).padStart(3, '0')}`;
    const skills = pick(SKILLS_POOL[e.dept] || []) ?
      (SKILLS_POOL[e.dept] || []).sort(() => 0.5 - Math.random()).slice(0, rnd(3, 6)) : [];
    const joinYear = rnd(2019, 2024);
    const joinMonth = rnd(1, 12);
    return {
      id: userId,
      email: `${e.fn.toLowerCase()}.${e.ln.toLowerCase()}@cybersynap.com`,
      password: 'Pass@123',
      role: 'employee' as const,
      employeeId: empId,
      firstName: e.fn,
      lastName: e.ln,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.fn}${e.ln}`,
      department: e.dept,
      designation: e.desig,
      managerId: idx <= 12 ? 'user-super-admin' : 'user-hr-admin',
      phone: `+91-9${String(8000000000 + idx * 1111).slice(0,9)}`,
      location: e.loc,
      joinDate: `${joinYear}-${String(joinMonth).padStart(2,'0')}-${String(rnd(1,28)).padStart(2,'0')}`,
      dateOfBirth: `${rnd(1985,2000)}-${String(rnd(1,12)).padStart(2,'0')}-${String(rnd(1,28)).padStart(2,'0')}`,
      gender: (idx % 2 === 0 ? 'female' : 'male') as 'male'|'female',
      bloodGroup: pick(BLOOD_GROUPS),
      emergencyContact: { name: `${e.ln} Family`, relation: 'Parent', phone: `+91-9${String(9000000000 + idx * 1111).slice(0,9)}` },
      status: 'active' as const,
      skills,
      bio: `${e.desig} at CyberSynap with expertise in ${skills.slice(0,2).join(' and ')}.`,
      salary: e.salary,
      bankAccount: `XXXX-XXXX-${String(1000 + idx).padStart(4,'0')}`,
      createdAt: new Date(joinYear, joinMonth - 1, 1).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return [superAdmin, hrAdmin, ...employees];
}

/* ── attendance for last 90 days for logged-in employee ── */
function buildAttendance(users: User[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const STATUSES: AttendanceStatus[] = ['present','present','present','present','late','remote','half_day','absent'];

  users.slice(0, 20).forEach(user => {
    for (let d = 90; d >= 0; d--) {
      const date = daysAgo(d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const dateStr = isoDate(date);
      const status = pick(STATUSES);
      const checkInHour = status === 'late' ? rnd(10, 11) : rnd(8, 9);
      const checkInMin = rnd(0, 59);
      const workHours = status === 'half_day' ? rnd(4,5) : status === 'absent' ? 0 : rnd(7,9);
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMin, 0);
      const checkOut = new Date(checkIn);
      checkOut.setHours(checkIn.getHours() + workHours, rnd(0,59), 0);

      records.push({
        id: uuid(),
        userId: user.id,
        date: dateStr,
        checkIn: status !== 'absent' ? checkIn.toISOString() : undefined,
        checkOut: status !== 'absent' && status !== 'half_day' ? checkOut.toISOString() : undefined,
        status,
        workHours: status !== 'absent' ? workHours : 0,
        note: status === 'remote' ? 'Working from home' : undefined,
      });
    }
  });
  return records;
}

/* ── leave requests ── */
function buildLeaves(users: User[]): { requests: LeaveRequest[]; balances: LeaveBalance[] } {
  const requests: LeaveRequest[] = [];
  const balances: LeaveBalance[] = [];
  const TYPES: LeaveType[] = ['annual','sick','casual','comp_off'];
  const STATUSES: LeaveStatus[] = ['approved','approved','approved','pending','rejected'];

  users.forEach(user => {
    // balance
    balances.push({
      userId: user.id,
      year: new Date().getFullYear(),
      annual: 18, sick: 12, casual: 6, comp_off: 4,
      usedAnnual: rnd(0, 8), usedSick: rnd(0, 4),
      usedCasual: rnd(0, 3), usedComp: rnd(0, 2),
    });

    // 3-6 leave requests per user
    const count = rnd(3, 6);
    for (let i = 0; i < count; i++) {
      const startDate = daysAgo(rnd(10, 180));
      const days = rnd(1, 5);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days - 1);
      const status = pick(STATUSES);
      requests.push({
        id: uuid(),
        userId: user.id,
        type: pick(TYPES),
        startDate: isoDate(startDate),
        endDate: isoDate(endDate),
        days,
        reason: pick([
          'Medical appointment', 'Family function', 'Personal work',
          'Feeling unwell', 'Travel', 'Child care', 'Home maintenance',
          'Annual vacation', 'Religious observance',
        ]),
        status,
        approvedBy: status === 'approved' ? 'user-hr-admin' : undefined,
        approvedAt: status === 'approved' ? daysAgo(rnd(1,10)).toISOString() : undefined,
        rejectionReason: status === 'rejected' ? 'Insufficient leave balance or team bandwidth.' : undefined,
        isHalfDay: false,
        createdAt: startDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return { requests, balances };
}

/* ── timesheets ── */
function buildTimesheets(users: User[]): TimesheetEntry[] {
  const entries: TimesheetEntry[] = [];
  const PROJECTS = ['CyberSynap Platform', 'Client Portal v2', 'Mobile App', 'Internal Tools', 'Infrastructure Upgrade', 'Design System'];
  const TASKS = ['Development', 'Code Review', 'Testing', 'Bug Fixes', 'Documentation', 'Meeting', 'Research', 'Design Review'];
  const STATUSES: TimesheetStatus[] = ['approved','approved','submitted','draft'];

  users.slice(0, 25).forEach(user => {
    for (let w = 0; w < 8; w++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w * 7) - weekStart.getDay() + 1);
      const weekOf = isoDate(weekStart);
      const weekStatus = pick(STATUSES);

      for (let d = 0; d < 5; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);
        if (date > new Date()) continue;

        entries.push({
          id: uuid(),
          userId: user.id,
          date: isoDate(date),
          project: pick(PROJECTS),
          task: pick(TASKS),
          hours: rnd(6, 9),
          description: `Worked on ${pick(TASKS).toLowerCase()} tasks for the sprint.`,
          weekOf,
          status: weekStatus,
          createdAt: date.toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  });
  return entries;
}

/* ── tickets ── */
function buildTickets(users: User[]): Ticket[] {
  const tickets: Ticket[] = [];
  const CATEGORIES: TicketCategory[] = ['it','hr','payroll','facilities','other'];
  const PRIORITIES: TicketPriority[] = ['low','medium','high','critical'];
  const STATUSES: TicketStatus[] = ['open','in_progress','resolved','closed'];
  const SUBJECTS = [
    'Laptop running slow and overheating',
    'Unable to access VPN from home',
    'Payslip showing incorrect deductions',
    'Request for work from home equipment',
    'Leave balance not reflecting correctly',
    'Email account setup needed for new joiner',
    'Printer on 3rd floor not working',
    'Request for salary certificate',
    'Office AC temperature issue',
    'Software license renewal required',
    'ID card replacement request',
    'Reimbursement claim pending for 2 months',
  ];

  let ticketNum = 1;
  users.slice(0, 30).forEach(user => {
    const count = rnd(2, 5);
    for (let i = 0; i < count; i++) {
      const createdAt = daysAgo(rnd(1, 120));
      const status = pick(STATUSES);
      const comments: TicketComment[] = [];

      if (status !== 'open') {
        comments.push({
          id: uuid(),
          userId: 'user-hr-admin',
          message: 'We have received your request and are looking into it. Will update you shortly.',
          isInternal: false,
          createdAt: new Date(createdAt.getTime() + 3600000).toISOString(),
        });
      }
      if (status === 'resolved' || status === 'closed') {
        comments.push({
          id: uuid(),
          userId: 'user-hr-admin',
          message: 'This issue has been resolved. Please reopen if the problem persists.',
          isInternal: false,
          createdAt: daysAgo(rnd(1, 10)).toISOString(),
        });
      }

      tickets.push({
        id: uuid(),
        ticketNumber: `CYB-${String(ticketNum++).padStart(3, '0')}`,
        userId: user.id,
        category: pick(CATEGORIES),
        priority: pick(PRIORITIES),
        status,
        subject: pick(SUBJECTS),
        description: `I am facing an issue that requires immediate attention. ${pick(SUBJECTS)}. Please look into this at the earliest convenience.`,
        assignedTo: status !== 'open' ? 'user-hr-admin' : undefined,
        comments,
        resolvedAt: status === 'resolved' || status === 'closed' ? daysAgo(rnd(1,5)).toISOString() : undefined,
        closedAt: status === 'closed' ? daysAgo(rnd(0,2)).toISOString() : undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });
  return tickets;
}

/* ── payslips ── */
function buildPayslips(users: User[]): Payslip[] {
  const payslips: Payslip[] = [];

  users.forEach(user => {
    for (let m = 0; m < 12; m++) {
      const date = monthsAgo(m);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}`;
      const basic = Math.round(user.salary * 0.5);
      const hra = Math.round(user.salary * 0.2);
      const special = Math.round(user.salary * 0.2);
      const transport = Math.round(user.salary * 0.05);
      const medical = Math.round(user.salary * 0.05);
      const grossSalary = basic + hra + special + transport + medical;
      const pf = Math.round(basic * 0.12);
      const tax = Math.round(grossSalary * 0.1);
      const professionalTax = 200;
      const netSalary = grossSalary - pf - tax - professionalTax;
      const workingDays = 22;
      const presentDays = rnd(18, 22);

      payslips.push({
        id: uuid(),
        userId: user.id,
        month,
        grossSalary,
        netSalary,
        earnings: [
          { label: 'Basic Salary', amount: basic },
          { label: 'House Rent Allowance', amount: hra },
          { label: 'Special Allowance', amount: special },
          { label: 'Transport Allowance', amount: transport },
          { label: 'Medical Allowance', amount: medical },
        ],
        deductions: [
          { label: 'Provident Fund (12%)', amount: pf },
          { label: 'Income Tax (TDS)', amount: tax },
          { label: 'Professional Tax', amount: professionalTax },
        ],
        workingDays,
        presentDays,
        paidLeaves: rnd(0, 2),
        lopDays: workingDays - presentDays > 2 ? workingDays - presentDays - 2 : 0,
        generatedAt: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString(),
      });
    }
  });
  return payslips;
}

/* ── documents ── */
function buildDocuments(users: User[]): Document[] {
  const docs: Document[] = [];
  const DOC_TEMPLATES: Array<{ name: string; category: DocCategory; mime: string; size: number }> = [
    { name: 'Employment Contract',         category: 'contract',     mime: 'application/pdf', size: 245760  },
    { name: 'Offer Letter',                category: 'offer_letter', mime: 'application/pdf', size: 102400  },
    { name: 'NDA Agreement',               category: 'contract',     mime: 'application/pdf', size: 184320  },
    { name: 'PAN Card Copy',               category: 'id_proof',    mime: 'image/jpeg',       size: 512000  },
    { name: 'Aadhaar Card Copy',           category: 'id_proof',    mime: 'image/jpeg',       size: 486400  },
    { name: 'Education Certificate',       category: 'certificate',  mime: 'application/pdf', size: 307200  },
    { name: 'Experience Certificate',      category: 'certificate',  mime: 'application/pdf', size: 204800  },
    { name: 'Leave Policy FY 2025',        category: 'policy',       mime: 'application/pdf', size: 153600  },
    { name: 'Code of Conduct Policy',      category: 'policy',       mime: 'application/pdf', size: 204800  },
    { name: 'Annual Appraisal Letter 2024',category: 'appraisal',    mime: 'application/pdf', size: 122880  },
  ];

  users.slice(0, 40).forEach(user => {
    const selected = DOC_TEMPLATES.sort(() => 0.5 - Math.random()).slice(0, rnd(4, 8));
    selected.forEach(tmpl => {
      docs.push({
        id: uuid(),
        userId: user.id,
        name: tmpl.name,
        category: tmpl.category,
        size: tmpl.size + rnd(-10000, 10000),
        mimeType: tmpl.mime,
        uploadedAt: daysAgo(rnd(10, 365)).toISOString(),
        expiresAt: tmpl.category === 'id_proof' ? new Date(Date.now() + 365*5*24*3600*1000).toISOString() : undefined,
        isShared: tmpl.category === 'policy',
        tags: [tmpl.category, user.department.toLowerCase()],
      });
    });
  });
  return docs;
}

/* ── holidays ── */
function buildHolidays() {
  const year = new Date().getFullYear();
  return [
    { id: uuid(), name: "New Year's Day",          date: `${year}-01-01`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Makar Sankranti',          date: `${year}-01-14`, type: 'regional', description: 'Regional holiday' },
    { id: uuid(), name: 'Republic Day',             date: `${year}-01-26`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Holi',                     date: `${year}-03-14`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Good Friday',              date: `${year}-04-18`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Ram Navami',               date: `${year}-04-06`, type: 'restricted', description: 'Optional holiday' },
    { id: uuid(), name: 'Ambedkar Jayanti',         date: `${year}-04-14`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Maharashtra Day',          date: `${year}-05-01`, type: 'regional', description: 'Regional holiday (Maharashtra)' },
    { id: uuid(), name: 'Independence Day',         date: `${year}-08-15`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Janmashtami',              date: `${year}-08-16`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Gandhi Jayanti',           date: `${year}-10-02`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Dussehra',                 date: `${year}-10-02`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Diwali',                   date: `${year}-10-20`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Diwali (Laxmi Puja)',      date: `${year}-10-21`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Guru Nanak Jayanti',       date: `${year}-11-05`, type: 'national', description: 'National holiday' },
    { id: uuid(), name: 'Christmas Day',            date: `${year}-12-25`, type: 'national', description: 'National holiday' },
  ];
}

/* ── announcements ── */
function buildAnnouncements(_users: User[]) {
  const adminId = 'user-hr-admin';
  return [
    { id: uuid(), title: 'Q3 All Hands Meeting', content: 'Please join us for the Q3 All Hands on Friday, 3 PM IST via Google Meet. Agenda includes product roadmap, financial highlights, and team shoutouts. Link will be shared by EOD Thursday.', authorId: adminId, isPinned: true,  tags: ['meeting','all-hands'], createdAt: daysAgo(2).toISOString(),  updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'New Leave Policy Effective August 1st', content: 'We are updating our leave policy to include 2 additional casual leaves per year and a new Work From Anywhere (WFA) benefit of up to 15 days annually. Full details in the Documents section.', authorId: adminId, isPinned: true,  tags: ['hr','policy','leave'], createdAt: daysAgo(7).toISOString(),  updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'Office Closure — Diwali 2025', content: 'The office will be closed from October 20–22 for Diwali. Wishing everyone a bright and joyful Diwali! Remote employees should update their OOO in the system.', authorId: adminId, isPinned: false, tags: ['holiday'], createdAt: daysAgo(14).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'Mandatory Security Training', content: 'All employees must complete the annual cybersecurity awareness training by October 31st. Access the training module via the Learning portal. Non-completion will be flagged to managers.', authorId: adminId, isPinned: false, tags: ['security','training','mandatory'], createdAt: daysAgo(20).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'New Joiners — August 2025 Batch Welcome', content: 'Please join us in welcoming 8 new team members who joined us this month across Engineering, Sales, and Design. Check the Directory for their profiles and reach out to say hello!', authorId: adminId, isPinned: false, tags: ['people','culture'], createdAt: daysAgo(30).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'Payroll Processing Date Change', content: 'Starting September 2025, salary credits will be processed on the 28th of each month instead of the 1st. This change ensures compliance with updated banking regulations.', authorId: adminId, isPinned: false, tags: ['payroll','finance'], createdAt: daysAgo(45).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'Referral Bonus Program Relaunch', content: 'We are relaunching our employee referral program with enhanced bonuses — ₹25,000 for tech roles and ₹15,000 for non-tech roles, credited on 90-day retention. Submit referrals via the HR portal.', authorId: adminId, isPinned: false, tags: ['hr','referral'], createdAt: daysAgo(60).toISOString(), updatedAt: new Date().toISOString() },
    { id: uuid(), title: 'CyberSynap ESS Portal Launch', content: 'We are thrilled to announce the launch of the new Employee Self-Service portal! You can now manage your attendance, leaves, timesheets, payslips, and more from one place. Explore and share your feedback via the Support Tickets.', authorId: 'user-super-admin', isPinned: true, tags: ['product','launch'], createdAt: daysAgo(90).toISOString(), updatedAt: new Date().toISOString() },
  ].map(a => ({ ...a, id: a.id }));
}

/* ── notifications ── */
function buildNotifications(users: User[]): Notification[] {
  const notifs: Notification[] = [];
  const TEMPLATES = [
    { title: 'Leave Approved',          message: 'Your annual leave request for Oct 10–12 has been approved.',     type: 'success' as const },
    { title: 'Timesheet Reminder',      message: 'Your timesheet for this week is pending submission.',             type: 'warning' as const },
    { title: 'Ticket Update',           message: 'Your ticket CYB-012 status changed to In Progress.',             type: 'info'    as const },
    { title: 'Payslip Available',       message: 'Your payslip for September 2025 is now available.',              type: 'info'    as const },
    { title: 'Leave Rejected',          message: 'Your sick leave request could not be approved due to bandwidth.', type: 'error'  as const },
    { title: 'New Announcement',        message: 'HR posted: "New Leave Policy Effective August 1st".',            type: 'info'    as const },
    { title: 'Document Shared',         message: 'Leave Policy FY 2025 has been shared with all employees.',       type: 'info'    as const },
    { title: 'Happy Work Anniversary!', message: 'Congratulations on completing another year at CyberSynap! 🎉',   type: 'success' as const },
  ];

  users.forEach(user => {
    const count = rnd(3, 6);
    for (let i = 0; i < count; i++) {
      const tmpl = pick(TEMPLATES);
      notifs.push({
        id: uuid(),
        userId: user.id,
        title: tmpl.title,
        message: tmpl.message,
        type: tmpl.type,
        isRead: Math.random() > 0.4,
        createdAt: daysAgo(rnd(0, 30)).toISOString(),
      });
    }
  });
  return notifs;
}

/* ── main seed function ── */
export function seedDatabase(): void {
  const users = buildUsers();
  bulkInsert('users', users);
  bulkInsert('departments', DEPARTMENTS);
  bulkInsert('attendance', buildAttendance(users));

  const { requests, balances } = buildLeaves(users);
  bulkInsert('leaves', requests);
  bulkInsert('leaveBalances', balances as unknown as { id: string }[]);

  bulkInsert('timesheets', buildTimesheets(users));
  bulkInsert('tickets', buildTickets(users));
  bulkInsert('payslips', buildPayslips(users));
  bulkInsert('documents', buildDocuments(users));
  bulkInsert('holidays', buildHolidays());
  bulkInsert('announcements', buildAnnouncements(users));
  bulkInsert('notifications', buildNotifications(users));
}
