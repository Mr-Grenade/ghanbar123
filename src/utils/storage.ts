import {
  AcademyDatabase,
  Student,
  Teacher,
  AttendanceRecord,
  Note,
  CreditAuditLog,
  FinancialTransaction,
} from "../types";
import { getTodayString, addDays } from "./persianDate";

const DB_STORAGE_KEY = "shahrokh_music_academy_db_v1";
const LEGACY_STORAGE_KEY = "nava_music_academy_db_v1";
const TRANSACTION_LOG_KEY = "shahrokh_music_academy_audit_log_v1";

export const INITIAL_SAMPLE_DATABASE: AcademyDatabase = {
  version: "1.2.0",
  lastUpdated: new Date().toISOString(),
  settings: {
    academyName: "آموزشگاه موسیقی شاهرخ",
    managerName: "مهندس حسینی",
    phone: "۰۲۱-۸۸۹۹۰۰۱۱",
    address: "تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۲۴",
    currency: "تومان",
    theme: "light",
    autoSaveIntervalSeconds: 3,
    defaultSemesterSessions: 10,
    defaultClassDurationMinutes: 30,
    enableConflictDetection: true,
    force169Ratio: false,
    instrumentsList: [
      "پیانو",
      "گیتار",
      "ویولن",
      "تار",
      "سه‌تار",
      "سنتور",
      "دف",
      "تنبک",
      "آواز",
      "کمانچه",
      "فلوت",
    ],
    globalSessionsPerWeek: 1,
    screensaverTimeoutMinutes: 0,
    semesterTitle: "ترم ۳ ماهه",
    semester2Title: "ترم ۲ ماهه",
  },
  teachers: [
    {
      id: "t-1",
      name: "استاد محمدرضا لطفی‌پور",
      phone: "09121112233",
      instruments: ["تار", "سه‌تار"],
      hourlyRate: 350000,

      availableDays: ["شنبه", "دوشنبه", "چهارشنبه"],
      status: "active",
      hireDate: "2023-01-15",
      notes: "استاد ارشد ردیف میرزاعبدالله و نوازندگی تار و سه‌تار",
    },
    {
      id: "t-2",
      name: "استاد سارا کلهری",
      phone: "09122223344",
      instruments: ["کمانچه", "ویولن ایرانی"],
      hourlyRate: 400000,

      availableDays: ["یکشنبه", "سه‌شنبه", "پنجشنبه"],
      status: "active",
      hireDate: "2023-04-10",
      notes: "فارغ‌التحصیل دانشگاه هنر - تدریس کمانچه و ردیف",
    },
    {
      id: "t-3",
      name: "استاد پویا اردوان",
      phone: "09123334455",
      instruments: ["سنتور"],
      hourlyRate: 380000,

      availableDays: ["شنبه", "دوشنبه", "پنجشنبه"],
      status: "active",
      hireDate: "2023-06-01",
      notes: "متد استاد کامکار و پایور، نوازنده ارکستر",
    },
    {
      id: "t-4",
      name: "استاد مهدی فراهانی",
      phone: "09124445566",
      instruments: ["پیانو کلاسیک", "پیانو ایرانی", "کیبورد"],
      hourlyRate: 450000,

      availableDays: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"],
      status: "active",
      hireDate: "2022-09-20",
      notes: "تدریس متد بیر و چرنی، آماده‌سازی آزمون‌های بین‌المللی",
    },
    {
      id: "t-5",
      name: "استاد نیما همایون",
      phone: "09125556677",
      instruments: ["گیتار کلاسیک", "گیتار پاپ", "فلامنکو"],
      hourlyRate: 320000,

      availableDays: ["شنبه", "چهارشنبه", "پنجشنبه"],
      status: "active",
      hireDate: "2023-11-05",
      notes: "سرپرست گروه آنسامبل گیتار آموزشگاه",
    },
    {
      id: "t-6",
      name: "استاد بهنوش رادمهر",
      phone: "09126667788",
      instruments: ["دف", "تمبک", "کاخن"],
      hourlyRate: 300000,

      availableDays: ["یکشنبه", "سه‌شنبه"],
      status: "active",
      hireDate: "2024-01-10",
      notes: "ریتم‌خوانی، ادوار ایقاعی و تکنیک‌های نوین دف‌نوازی",
    },
  ],
  students: [
    {
      id: "s-1",
      name: "آرمان کیانی",
      nationalId: "0019283746",
      phone: "09351112233",
      instrument: "تار",
      teacherId: "t-1",
      registeredDate: "2024-01-10",
      classDay: "شنبه",
      classTime: "15:00",
      classDurationMinutes: 30,
      makeupCredits: 2,
      paymentStatus: "paid",
      tuitionFee: 3500000,
      paidAmount: 3500000,
      targetSessions: 10,
      attendedSessions: 7,
      status: "active",
      notes: "در حال یادگیری پیش‌درآمد اصفهان، پیشرفت عالی",
    },
    {
      id: "s-2",
      name: "نیلوفر صالحی",
      nationalId: "0028374651",
      phone: "09352223344",
      instrument: "سه‌تار",
      teacherId: "t-1",
      registeredDate: "2024-02-01",
      classDay: "شنبه",
      classTime: "15:30",
      classDurationMinutes: 30,
      makeupCredits: 1,
      paymentStatus: "partial",
      tuitionFee: 3500000,
      paidAmount: 2000000,
      targetSessions: 10,
      attendedSessions: 4,
      status: "active",
      notes: "دستگاه شور - گوشه درآمد و کرشمه",
    },
    {
      id: "s-3",
      name: "امیرحسین مرادی",
      nationalId: "0037465182",
      phone: "09353334455",
      instrument: "پیانو کلاسیک",
      teacherId: "t-4",
      registeredDate: "2024-01-15",
      classDay: "یکشنبه",
      classTime: "16:00",
      classDurationMinutes: 45,
      makeupCredits: 0,
      paymentStatus: "paid",
      tuitionFee: 4500000,
      paidAmount: 4500000,
      targetSessions: 10,
      attendedSessions: 8,
      status: "active",
      notes: "سونات دو ماژور موتسارت",
    },
    {
      id: "s-4",
      name: "هستی یزدانی",
      nationalId: "0046518293",
      phone: "09354445566",
      instrument: "کمانچه",
      teacherId: "t-2",
      registeredDate: "2024-02-10",
      classDay: "یکشنبه",
      classTime: "17:00",
      classDurationMinutes: 30,
      makeupCredits: 3,
      paymentStatus: "overdue",
      tuitionFee: 4000000,
      paidAmount: 1000000,
      targetSessions: 10,
      attendedSessions: 5,
      status: "active",
      notes: "نیاز به یادآوری شهریه معوق - اعتبار جبرانی ۳ جلسه دارد",
    },
    {
      id: "s-5",
      name: "بردیا شمس",
      nationalId: "0055443322",
      phone: "09355556677",
      instrument: "سنتور",
      teacherId: "t-3",
      registeredDate: "2024-01-20",
      classDay: "دوشنبه",
      classTime: "16:30",
      classDurationMinutes: 30,
      makeupCredits: 0,
      paymentStatus: "paid",
      tuitionFee: 3800000,
      paidAmount: 3800000,
      targetSessions: 10,
      attendedSessions: 9,
      status: "active",
      notes: "پایان ترم نزدیک است - آماده ورود به ردیف صبا",
    },
    {
      id: "s-6",
      name: "پرنیا خسروی",
      nationalId: "0066778899",
      phone: "09356667788",
      instrument: "گیتار پاپ",
      teacherId: "t-5",
      registeredDate: "2024-03-01",
      classDay: "چهارشنبه",
      classTime: "18:00",
      classDurationMinutes: 30,
      makeupCredits: 1,
      paymentStatus: "paid",
      tuitionFee: 3200000,
      paidAmount: 3200000,
      targetSessions: 10,
      attendedSessions: 3,
      status: "active",
      notes: "آکوردهای باره‌دار و آرپژ ۶/۸",
    },
    {
      id: "s-7",
      name: "کیان رستمی",
      nationalId: "0077889900",
      phone: "09357778899",
      instrument: "دف",
      teacherId: "t-6",
      registeredDate: "2024-02-18",
      classDay: "سه‌شنبه",
      classTime: "17:30",
      classDurationMinutes: 30,
      makeupCredits: 0,
      paymentStatus: "paid",
      tuitionFee: 3000000,
      paidAmount: 3000000,
      targetSessions: 10,
      attendedSessions: 6,
      status: "active",
      notes: "مقام حی‌الله و تکنیک ریز چپ",
    },
    {
      id: "s-8",
      name: "غزل نوروزی",
      nationalId: "0088990011",
      phone: "09358889900",
      instrument: "پیانو ایرانی",
      teacherId: "t-4",
      registeredDate: "2024-01-05",
      classDay: "دوشنبه",
      classTime: "17:00",
      classDurationMinutes: 45,
      makeupCredits: 2,
      paymentStatus: "partial",
      tuitionFee: 4500000,
      paidAmount: 3000000,
      targetSessions: 10,
      attendedSessions: 7,
      status: "active",
      notes: "کوک اصفهان و قطعات استاد محجوبی",
    },
  ],
  attendance: [],
  notes: [
    {
      id: "n-1",
      targetType: "general",
      title: "برگزاری کنسرت آموزشگاهی پایان فصل",
      content:
        "کنسرت پایان فصل هنرجویان در سالن رودکی در تاریخ ۲۰ اسفند ماه برنامه‌ریزی شده است. لطفا اساتید قطعات انتخابی را تا پایان هفته تحویل دهند.",
      category: "رویداد و کنسرت",
      pinned: true,
      date: getTodayString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-2",
      targetType: "teacher",
      targetId: "t-1",
      title: "درخواست جابجایی ساعت کلاس",
      content:
        "استاد لطفی‌پور درخواست شروع کلاس‌های شنبه از ساعت ۱۵:۰۰ به جای ۱۴:۳۰ را دارند.",
      category: "هماهنگی استاد",
      pinned: false,
      date: getTodayString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-3",
      targetType: "student",
      targetId: "s-4",
      title: "نیاز به تمرین بیشتر آرشه‌کشی",
      content:
        "هنرجو در اجرای تعویض پوزیسیون و پرش آرشه نیاز به تکرار اتود شماره ۱۲ شوچیک دارد.",
      category: "آموزشی",
      pinned: false,
      date: getTodayString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-4",
      targetType: "date",
      targetId: getTodayString(),
      title: "تنظیم و رگلاژ پیانوهای سالن ۲ و ۳",
      content:
        "کارشناس رگلاژ پیانو امروز ساعت ۱۱:۰۰ برای کوک دقیق و سرویس اکشن پیانوها حضور یافت.",
      category: "نگهداری تجهیزات",
      pinned: false,
      date: getTodayString(),
      createdAt: new Date().toISOString(),
    },
  ],
  creditLogs: [
    {
      id: "cl-1",
      studentId: "s-4",
      date: addDays(getTodayString(), -3),
      change: 1,
      previousBalance: 2,
      newBalance: 3,
      reason: "غیبت موجه با اطلاع قبلی ۲۴ ساعت قبل",
      recordedBy: "سیستم خودکار حضور و غیاب",
    },
    {
      id: "cl-2",
      studentId: "s-1",
      date: addDays(getTodayString(), -5),
      change: 1,
      previousBalance: 1,
      newBalance: 2,
      reason: "کنسلی کلاس توسط استاد (جلسه فوق‌العاده)",
      recordedBy: "سیستم خودکار حضور و غیاب",
    },
  ],
  transactions: [
    {
      id: "tx-1",
      date: addDays(getTodayString(), -10),
      type: "tuition_income",
      amount: 3500000,
      studentId: "s-1",
      description: "شهریه دوره ۱۰ جلسه‌ای تار - پرداخت کامل",
      paymentMethod: "pos",
      receiptNumber: "POS-984210",
    },
    {
      id: "tx-2",
      date: addDays(getTodayString(), -8),
      type: "tuition_income",
      amount: 4500000,
      studentId: "s-3",
      description: "شهریه دوره پیانو کلاسیک",
      paymentMethod: "card_transfer",
      receiptNumber: "TRF-102938",
    },
    {
      id: "tx-3",
      date: addDays(getTodayString(), -15),
      type: "teacher_payout",
      amount: 5250000,
      teacherId: "t-1",
      description: "تسویه حق‌التدریس ماه گذشته استاد لطفی‌پور (۱۵ جلسه)",
      paymentMethod: "card_transfer",
      receiptNumber: "PAY-440192",
    },
  ],
  todos: [],
};

// Generate realistic attendance data for past days & today
export function generateInitialAttendance(
  teachers: Teacher[],
  students: Student[],
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = getTodayString();

  // Create attendance for the last 14 days and today
  for (let i = -14; i <= 0; i++) {
    const dStr = addDays(today, i);
    students.forEach((student, idx) => {
      // Simulate weekly class schedules
      const shouldHaveClass =
        (i % 2 === 0 && idx % 2 === 0) ||
        (i % 2 !== 0 && idx % 2 !== 0) ||
        i === 0;
      if (shouldHaveClass) {
        let status: AttendanceRecord["status"] = "present";
        if (i === -2 && idx === 1) status = "excused";
        else if (i === -4 && idx === 3) status = "teacher_cancelled";
        else if (i === -7 && idx === 2) status = "no_show";
        else if (i === 0 && idx === 3) status = "excused";
        else if (i === 0 && idx === 4) status = "present";

        records.push({
          id: `att-${dStr}-${student.id}`,
          date: dStr,
          time: student.classTime || "16:00",
          studentId: student.id,
          teacherId: student.teacherId,
          instrument: student.instrument,
          status: status,
          notes:
            status === "excused"
              ? "غیبت موجه با هماهنگی تلفنی"
              : status === "teacher_cancelled"
                ? "کنسلی توسط استاد به دلیل اجرای کنسرت"
                : "",
          creditAdded: status === "excused" || status === "teacher_cancelled",
          creditAddedReason:
            status === "excused"
              ? "افزایش خودکار ۱ جلسه اعتبار جبرانی (غیبت موجه)"
              : status === "teacher_cancelled"
                ? "افزایش خودکار ۱ جلسه اعتبار جبرانی (کنسلی استاد)"
                : undefined,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }

  return records;
}

/**
 * Load database from local storage or initialize with sample database
 */
export function loadDatabase(): AcademyDatabase {
  try {
    let raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw) as AcademyDatabase;
      if (
        parsed &&
        Array.isArray(parsed.students) &&
        Array.isArray(parsed.teachers)
      ) {
        if (!parsed.settings) {
          parsed.settings = { ...INITIAL_SAMPLE_DATABASE.settings };
        }
        if (
          !parsed.settings.academyName ||
          parsed.settings.academyName.includes("نوا")
        ) {
          parsed.settings.academyName = "آموزشگاه موسیقی شاهرخ";
        }
        if (!parsed.attendance || parsed.attendance.length === 0) {
          parsed.attendance = generateInitialAttendance(
            parsed.teachers,
            parsed.students,
          );
        }
        saveDatabase(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading database from local storage:", err);
  }

  const initial = { ...INITIAL_SAMPLE_DATABASE };
  initial.attendance = generateInitialAttendance(
    initial.teachers,
    initial.students,
  );
  saveDatabase(initial);
  return initial;
}

/**
 * Save database to local storage and log the event
 */
export function saveDatabase(db: AcademyDatabase): boolean {
  try {
    db.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(db);
    localStorage.setItem(DB_STORAGE_KEY, serialized);

    // Append to audit log
    appendTransactionLog({
      timestamp: new Date().toISOString(),
      action: "AUTO_SAVE",
      studentCount: db.students.length,
      teacherCount: db.teachers.length,
      attendanceCount: db.attendance.length,
    });
    return true;
  } catch (err) {
    console.error("Failed to save database:", err);
    return false;
  }
}

/**
 * Transaction log tracker for standalone desktop portability
 */
function appendTransactionLog(entry: Record<string, unknown>) {
  try {
    const rawLogs = localStorage.getItem(TRANSACTION_LOG_KEY);
    const logs: Array<Record<string, unknown>> = rawLogs
      ? JSON.parse(rawLogs)
      : [];
    logs.push(entry);
    if (logs.length > 200) {
      logs.splice(0, logs.length - 200); // keep recent 200 entries
    }
    localStorage.setItem(TRANSACTION_LOG_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

/**
 * Export entire database as a standalone .json / .sqlite-compatible file
 */
export function exportDatabaseBackup(db: AcademyDatabase): void {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = getTodayString().replace(/-/g, "_");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `shahrokh_academy_db_backup_${dateStr}.json`,
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Export raw transaction log file
 */
export function exportTransactionLogFile(): void {
  const rawLogs = localStorage.getItem(TRANSACTION_LOG_KEY) || "[]";
  const dataStr =
    "data:text/plain;charset=utf-8," + encodeURIComponent(rawLogs);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `shahrokh_academy_audit_log_${Date.now()}.log`,
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import database backup from a file
 */
export function importDatabaseFromFile(file: File): Promise<AcademyDatabase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AcademyDatabase;
        if (
          parsed &&
          Array.isArray(parsed.students) &&
          Array.isArray(parsed.teachers)
        ) {
          saveDatabase(parsed);
          resolve(parsed);
        } else {
          reject(new Error("ساختار فایل پشتیبان نامعتبر است."));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("خطا در خواندن فایل"));
    reader.readAsText(file);
  });
}
