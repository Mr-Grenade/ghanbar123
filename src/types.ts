export type AttendanceStatus =
  "present" | "no_show" | "excused" | "teacher_cancelled";

export type PaymentStatus = "paid" | "partial" | "overdue";

export type StudentStatus = "active" | "suspended" | "graduated";

export type NoteTargetType = "date" | "student" | "teacher" | "general";

export type ThemeMode =
  | "light"
  | "dark"
  | "fall-1"
  | "fall-2"
  | "spring-1"
  | "spring-2"
  | "winter-1"
  | "winter-2"
  | "summer-1"
  | "summer-2";

export type NavTabId =
  | "dashboard"
  | "attendance"
  | "students"
  | "teachers"
  | "payroll"
  | "notes"
  | "recall"
  | "reports";

export interface ClassSlot {
  day: string; // e.g. "شنبه"
  time: string; // e.g. "16:00"
  durationMinutes?: number;
}

export interface Student {
  id: string;
  name: string;
  englishName?: string;
  nationalId?: string;
  phone: string;
  phones?: { title: string; number: string }[];
  instrument: string;
  teacherId: string;
  sessionFeeOverride?: number;
  registeredDate: string; // YYYY-MM-DD
  classDay: string; // Primary class day e.g. "شنبه"
  classTime: string; // Primary class time e.g. "16:00"
  classDurationMinutes: number; // e.g. 30, 45, 60
  sessionsPerWeek?: number; // 1, 2, 3, etc.
  weeklySlots?: ClassSlot[]; // List of all weekly sessions for multi-session students
  makeupCredits: number;
  paymentStatus: PaymentStatus;
  tuitionFee: number; // Toman (for the term / remaining sessions)
  paidAmount: number; // Toman
  targetSessions: number; // e.g. total term sessions or calculated remaining sessions
  attendedSessions: number; // completed sessions
  status: StudentStatus;
  notes?: string;
  financialNote?: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  phones?: { title: string; number: string }[];
  instruments: string[];
  hourlyRate: number; // Toman per standard session
  percentageRate?: number;
  availableDays: string[];
  status: "active" | "inactive";
  hireDate: string;
  notes?: string;
  semesterFormat?: 1 | 2; // 1 = Format 1 (e.g. 3 months), 2 = Format 2 (e.g. 2 months)
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // "16:00"
  studentId: string;
  teacherId: string;
  instrument: string;
  status: AttendanceStatus | null;
  notes?: string;
  creditAdded?: boolean;
  creditAddedReason?: string;
  isExtraClass?: boolean;
  extraClassCreditUsed?: boolean;
  durationMinutes?: number;
  sessionPrice?: number;
  updatedAt: string;
}

export interface CreditAuditLog {
  id: string;
  studentId: string;
  date: string;
  change: number; // +1, -1, etc.
  previousBalance: number;
  newBalance: number;
  reason: string;
  recordedBy?: string;
}

export interface Note {
  id: string;
  targetType: NoteTargetType;
  targetId?: string; // studentId, teacherId, or YYYY-MM-DD
  title?: string;
  content: string;
  category?: string;
  pinned?: boolean;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: "tuition_income" | "teacher_payout" | "expense" | "other_income";
  amount: number; // Toman
  studentId?: string;
  teacherId?: string;
  description: string;
  paymentMethod: "cash" | "pos" | "card_transfer" | "cheque";
  receiptNumber?: string;
}

export interface AcademySettings {
  academyName: string;
  managerName: string;
  phone: string;
  address: string;
  logoUrl?: string;
  signatureUrl?: string;
  currency: string; // e.g. "تومان"
  theme: ThemeMode;
  autoSaveIntervalSeconds: number;
  defaultSemesterSessions: number;
  defaultClassDurationMinutes: number;
  enableConflictDetection?: boolean;
  semesterTitle?: string; // e.g. "ترم پاییز ۱۴۰۳" or "ترم جاری"
  semesterStartDate?: string; // YYYY-MM-DD
  semesterEndDate?: string; // YYYY-MM-DD
  semester2Title?: string;
  semester2StartDate?: string; // YYYY-MM-DD
  semester2EndDate?: string; // YYYY-MM-DD
  defaultPricePerSession?: number; // Toman per session for tuition calculation
  force169Ratio?: boolean;
  instrumentsList?: string[]; // Array of custom instruments
  globalSessionsPerWeek?: number; // Global limit for sessions per week
  screensaverTimeoutMinutes?: 0 | 5 | 10 | 15 | 30; // 0 = never, or 5, 10, 15, 30 minutes
}

export interface Todo {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

export interface SemesterArchive {
  id: string;
  title: string;
  format: 1 | 2;
  startDate: string;
  endDate: string;
  archivedAt: string;
  students: Student[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  creditLogs: CreditAuditLog[];
}

export interface AcademyDatabase {
  version: string;
  lastUpdated: string;
  settings: AcademySettings;
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  notes: Note[];
  creditLogs: CreditAuditLog[];
  transactions: FinancialTransaction[];
  todos?: Todo[];
  archives?: SemesterArchive[];
}
