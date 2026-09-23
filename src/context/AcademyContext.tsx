import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  AcademyDatabase,
  Student,
  Teacher,
  AttendanceRecord,
  AttendanceStatus,
  PaymentStatus,
  Note,
  CreditAuditLog,
  FinancialTransaction,
  SemesterArchive,
  ThemeMode,
  NavTabId,
} from "../types";
import {
  loadDatabase,
  saveDatabase,
  exportDatabaseBackup,
  exportTransactionLogFile,
  importDatabaseFromFile,
  INITIAL_SAMPLE_DATABASE,
  generateInitialAttendance,
} from "../utils/storage";
import {
  getTodayString,
  getPersianWeekdayFromDate,
  getCurrentPersianSeason,
} from "../utils/persianDate";

interface TeacherPayrollCalculation {
  teacher: Teacher;
  totalPresentSessions: number;
  totalExcusedSessions: number;
  totalCancelledSessions: number;
  totalNoShowSessions: number;
  hourlyRate: number;
  totalPayable: number;
  totalInstituteRevenue: number;
  studentBreakdown: Array<{
    studentName: string;
    instrument: string;
    presentCount: number;
  }>;
}

interface AcademyContextType {
  db: AcademyDatabase;
  activeArchiveId: string | null;
  setActiveArchiveId: (id: string | null) => void;
  isArchiveView: boolean;
  currentTab: NavTabId;
  setCurrentTab: (tab: NavTabId) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeAttendanceView: "hour" | "teacher";
  setActiveAttendanceView: (view: "hour" | "teacher") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAutoSaving: boolean;
  lastSavedTime: Date | null;
  toastMessage: {
    text: string;
    type: "success" | "info" | "warning" | "error";
  } | null;
  showToast: (
    text: string,
    type?: "success" | "info" | "warning" | "error",
  ) => void;

  // Student Actions
  addStudent: (student: Omit<Student, "id" | "attendedSessions">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  overrideStudentCredits: (
    studentId: string,
    delta: number,
    reason: string,
  ) => void;
  addExtraClass: (params: {
    studentId: string;
    date: string;
    time: string;
    teacherId: string;
    notes?: string;
    sessionPrice?: number;
    durationMinutes?: number;
  }) => void;
  deleteExtraClass: (recordId: string) => void;
  updateExtraClass: (
    recordId: string,
    updates: Partial<AttendanceRecord>,
  ) => void;

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Attendance Actions
  updateAttendanceStatus: (
    recordId: string,
    newStatus: AttendanceStatus | null,
    notes?: string,
  ) => void;
  createOrUpdateAttendance: (
    date: string,
    studentId: string,
    status: AttendanceStatus | null,
    time?: string,
    notes?: string,
  ) => void;
  getAttendanceForDate: (date: string) => AttendanceRecord[];

  // Notes Actions
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesForDate: (date: string) => Note[];
  getNotesForStudent: (studentId: string) => Note[];
  getNotesForTeacher: (teacherId: string) => Note[];

  // Finance Actions
  addTransaction: (tx: Omit<FinancialTransaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  recordStudentPayment: (
    studentId: string,
    amount: number,
    paymentMethod: FinancialTransaction["paymentMethod"],
    receiptNumber?: string,
  ) => void;
  calculateTeacherPayroll: (
    startDate: string,
    endDate: string,
    teacherId?: string,
  ) => TeacherPayrollCalculation[];

  // Database Management
  exportBackup: () => void;
  exportAuditLogs: () => void;
  importBackup: (file: File) => Promise<void>;
  resetDatabase: () => void;
  updateSettings: (settings: Partial<AcademyDatabase["settings"]>) => void;
  archiveAndResetSemester: (
    formatTrack: 1 | 2,
    returningStudentIds: string[],
    options: {
      archiveTitle: string;
      carryOverFinancials: boolean;
      carryOverCredits: boolean;
    },
  ) => void;

  // Todos
  addTodo: (title: string, date: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<AcademyDatabase>(() => loadDatabase());
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const isArchiveView = activeArchiveId !== null;
  const [currentTab, setCurrentTab] = useState<NavTabId>("dashboard");
  const [theme, setThemeState] = useState<ThemeMode>(
    () => db.settings.theme || "light",
  );
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayString(),
  );
  const [activeAttendanceView, setActiveAttendanceView] = useState<
    "hour" | "teacher"
  >("hour");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
  } | null>(null);

  const isInitialMount = useRef(true);

  // Apply theme to document attribute
  const applyThemeToDOM = (themeMode: ThemeMode) => {
    document.documentElement.setAttribute("data-theme", themeMode);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: newTheme },
    }));
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Toast Helper
  const showToast = (
    text: string,
    type: "success" | "info" | "warning" | "error" = "success",
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  // Auto-Save Effect (Debounced 500ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      const success = saveDatabase(db);
      setIsAutoSaving(false);
      if (success) {
        setLastSavedTime(new Date());
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [db]);

  // ================= STUDENT ACTIONS =================
  const addStudent = (
    studentData: Omit<Student, "id" | "attendedSessions">,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const newId = `s-${Date.now().toString(36)}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      attendedSessions: 0,
    };

    setDb((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));
    showToast(`هنرجو «${newStudent.name}» با موفقیت ثبت شد.`);
  };

  const appendFinancialNote = (existing: string | undefined, msg: string) => {
    const d = new Date();
    const ts = `[${d.toLocaleDateString("fa-IR")} - ${d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}]`;
    const log = `${ts} ${msg}`;
    return existing ? `${log}\n${existing}` : log;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const student = prev.students.find((s) => s.id === id);
      if (!student) return prev;

      const finalUpdates = { ...updates };
      const financialChanges: string[] = [];

      if (
        updates.tuitionFee !== undefined &&
        updates.tuitionFee !== student.tuitionFee
      ) {
        financialChanges.push(
          `تغییر کل شهریه از ${student.tuitionFee.toLocaleString("fa-IR")} به ${updates.tuitionFee.toLocaleString("fa-IR")}`,
        );
      }
      if (
        updates.paidAmount !== undefined &&
        updates.paidAmount !== student.paidAmount
      ) {
        financialChanges.push(
          `تغییر پرداختی از ${student.paidAmount.toLocaleString("fa-IR")} به ${updates.paidAmount.toLocaleString("fa-IR")}`,
        );
      }

      if (financialChanges.length > 0) {
        const logMsg = financialChanges.join(" | ") + " (ویرایش دستی)";
        const currentNote =
          updates.financialNote !== undefined
            ? updates.financialNote
            : student.financialNote;
        finalUpdates.financialNote = appendFinancialNote(currentNote, logMsg);
      }

      return {
        ...prev,
        students: prev.students.map((st) =>
          st.id === id ? { ...st, ...finalUpdates } : st,
        ),
      };
    });
    showToast("اطلاعات هنرجو با موفقیت به‌روزرسانی شد.");
  };

  const deleteStudent = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const target = db.students.find((s) => s.id === id);
    setDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      attendance: prev.attendance.filter((a) => a.studentId !== id),
      creditLogs: prev.creditLogs.filter((c) => c.studentId !== id),
    }));
    showToast(
      `هنرجو «${target?.name || ""}» و سوابق مربوطه حذف شد.`,
      "warning",
    );
  };

  const overrideStudentCredits = (
    studentId: string,
    delta: number,
    reason: string,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const student = prev.students.find((s) => s.id === studentId);
      if (!student) return prev;

      const previousBalance = student.makeupCredits;
      const newBalance = Math.max(0, previousBalance + delta);
      const actualDelta = newBalance - previousBalance;

      const newAuditLog: CreditAuditLog = {
        id: `cl-${Date.now()}`,
        studentId,
        date: getTodayString(),
        change: actualDelta,
        previousBalance,
        newBalance,
        reason:
          reason ||
          (delta > 0 ? "افزایش دستی توسط مدیریت" : "کاهش دستی توسط مدیریت"),
        recordedBy: "مدیریت آموزشگاه",
      };

      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId ? { ...s, makeupCredits: newBalance } : s,
        ),
        creditLogs: [newAuditLog, ...prev.creditLogs],
      };
    });
    showToast(
      `اعتبار جبرانی هنرجو با موفقیت تغییر کرد (${delta > 0 ? `+${delta}` : delta} جلسه).`,
    );
  };

  const addExtraClass = ({
    studentId,
    date,
    time,
    teacherId,
    notes,
    sessionPrice: customSessionPrice,
    durationMinutes = 30,
  }: {
    studentId: string;
    date: string;
    time: string;
    teacherId: string;
    notes?: string;
    sessionPrice?: number;
    durationMinutes?: number;
  }) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const student = prev.students.find((s) => s.id === studentId);
      if (!student) return prev;

      let updatedStudents = [...prev.students];
      const updatedCreditLogs = [...prev.creditLogs];
      let creditUsed = false;

      // Determine the session price
      const targetTeacher = prev.teachers.find((t) => t.id === teacherId);
      const defaultStudentRate =
        student.sessionFeeOverride ??
        (student.targetSessions > 0
          ? Math.round(student.tuitionFee / student.targetSessions)
          : teacherMap.get(student.teacherId)?.hourlyRate ??
            prev.settings.defaultPricePerSession ??
            350000);
      const defaultTeacherRate =
        targetTeacher?.hourlyRate ??
        prev.settings.defaultPricePerSession ??
        350000;

      const defaultRate =
        teacherId === student.teacherId ? defaultStudentRate : defaultTeacherRate;

      const sessionPrice =
        typeof customSessionPrice === "number" && !isNaN(customSessionPrice)
          ? customSessionPrice
          : defaultRate;

      if (student.makeupCredits > 0) {
        creditUsed = true;
        const newCredits = student.makeupCredits - 1;
        updatedStudents = updatedStudents.map((s) =>
          s.id === studentId
            ? {
                ...s,
                makeupCredits: newCredits,
                attendedSessions: s.attendedSessions + 1,
              }
            : s,
        );
        updatedCreditLogs.unshift({
          id: `cl-${Date.now()}`,
          studentId,
          date,
          change: -1,
          previousBalance: student.makeupCredits,
          newBalance: newCredits,
          reason: `استفاده از ۱ جلسه اعتبار جبرانی برای تشکیل کلاس فوق‌العاده در تاریخ ${date}`,
          recordedBy: "مدیریت آموزشگاه",
        });
      } else {
        const newTargetSessions = (student.targetSessions || 10) + 1;
        const newTuitionFee = student.tuitionFee + sessionPrice;
        const newAttended = student.attendedSessions + 1;
        const unpaidDebt = newTuitionFee - student.paidAmount;

        let newPaymentStatus: PaymentStatus = student.paymentStatus;
        if (unpaidDebt > 0) {
          newPaymentStatus = student.paidAmount > 0 ? "partial" : "overdue";
        }

        updatedStudents = updatedStudents.map((s) =>
          s.id === studentId
            ? {
                ...s,
                targetSessions: newTargetSessions,
                tuitionFee: newTuitionFee,
                attendedSessions: newAttended,
                paymentStatus: newPaymentStatus,
                financialNote: appendFinancialNote(
                  s.financialNote,
                  `ثبت کلاس فوق‌العاده بدون اعتبار: افزایش بدهی شهریه به مبلغ ${sessionPrice.toLocaleString("fa-IR")} تومان`,
                ),
              }
            : s,
        );
      }

      const newRecord: AttendanceRecord = {
        id: `att-extra-${Date.now()}-${studentId}`,
        date,
        time: time || "16:00",
        studentId,
        teacherId: teacherId || student.teacherId,
        instrument: student.instrument,
        status: "present",
        notes: notes
          ? `کلاس فوق‌العاده (${notes})`
          : creditUsed
            ? "کلاس فوق‌العاده (استفاده از اعتبار جبرانی)"
            : `کلاس فوق‌العاده (افزودن به بدهی - ${sessionPrice.toLocaleString("fa-IR")} تومان)`,
        isExtraClass: true,
        extraClassCreditUsed: creditUsed,
        durationMinutes: durationMinutes || student.classDurationMinutes || 30,
        sessionPrice: sessionPrice,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        students: updatedStudents,
        attendance: [newRecord, ...prev.attendance],
        creditLogs: updatedCreditLogs,
      };
    });

    showToast("کلاس فوق‌العاده با موفقیت ثبت شد.");
  };

  const deleteExtraClass = (recordId: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const record = prev.attendance.find((a) => a.id === recordId);
      const isExtra =
        record?.isExtraClass || record?.id.startsWith("att-extra-");
      if (!record || !isExtra) return prev;

      const student = prev.students.find((s) => s.id === record.studentId);
      if (!student) return prev;

      let updatedStudents = [...prev.students];
      const updatedCreditLogs = [...prev.creditLogs];

      const creditWasUsed =
        record.extraClassCreditUsed ||
        record.notes?.includes("استفاده از اعتبار جبرانی");

      if (creditWasUsed) {
        // Revert credit
        const newCredits = student.makeupCredits + 1;
        updatedStudents = updatedStudents.map((s) =>
          s.id === student.id
            ? {
                ...s,
                makeupCredits: newCredits,
                attendedSessions: Math.max(0, s.attendedSessions - 1),
              }
            : s,
        );
        updatedCreditLogs.unshift({
          id: `cl-${Date.now()}`,
          studentId: student.id,
          date: new Date().toISOString().split("T")[0],
          change: 1,
          previousBalance: student.makeupCredits,
          newBalance: newCredits,
          reason: `بازگشت اعتبار بابت حذف کلاس فوق‌العاده تاریخ ${record.date}`,
          recordedBy: "سیستم",
        });
      } else {
        // Revert price and target sessions
        const sessionPrice =
          record.sessionPrice !== undefined
            ? record.sessionPrice
            : student.targetSessions > 0
              ? Math.round(student.tuitionFee / student.targetSessions)
              : prev.settings.defaultPricePerSession || 350000;

        const newTargetSessions = Math.max(
          0,
          (student.targetSessions || 1) - 1,
        );
        const newTuitionFee = Math.max(0, student.tuitionFee - sessionPrice);
        const newAttended = Math.max(0, student.attendedSessions - 1);
        const unpaidDebt = newTuitionFee - student.paidAmount;

        let newPaymentStatus: PaymentStatus = student.paymentStatus;
        if (newTuitionFee === 0 || unpaidDebt <= 0) {
          newPaymentStatus = "paid";
        } else if (unpaidDebt > 0) {
          newPaymentStatus = student.paidAmount > 0 ? "partial" : "overdue";
        }

        updatedStudents = updatedStudents.map((s) =>
          s.id === student.id
            ? {
                ...s,
                targetSessions: newTargetSessions,
                tuitionFee: newTuitionFee,
                attendedSessions: newAttended,
                paymentStatus: newPaymentStatus,
                financialNote: appendFinancialNote(
                  s.financialNote,
                  `حذف کلاس فوق‌العاده: کاهش بدهی شهریه به مبلغ ${sessionPrice.toLocaleString("fa-IR")} تومان`,
                ),
              }
            : s,
        );
      }

      return {
        ...prev,
        students: updatedStudents,
        attendance: prev.attendance.filter((a) => a.id !== recordId),
        creditLogs: updatedCreditLogs,
      };
    });
    showToast("کلاس فوق‌العاده حذف شد و حساب هنرجو بروزرسانی گردید.", "info");
  };

  const updateExtraClass = (
    recordId: string,
    updates: Partial<AttendanceRecord>,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const recordIndex = prev.attendance.findIndex((a) => a.id === recordId);
      if (recordIndex === -1) return prev;

      const newAttendance = [...prev.attendance];
      newAttendance[recordIndex] = {
        ...newAttendance[recordIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        attendance: newAttendance,
      };
    });
    showToast("اطلاعات کلاس فوق‌العاده بروزرسانی شد.");
  };

  // ================= TEACHER ACTIONS =================
  const addTeacher = (teacherData: Omit<Teacher, "id">) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const newId = `t-${Date.now().toString(36)}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: newId,
    };
    setDb((prev) => ({
      ...prev,
      teachers: [newTeacher, ...prev.teachers],
    }));
    showToast(`استاد «${newTeacher.name}» با موفقیت اضافه شد.`);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      teachers: prev.teachers.map((tc) =>
        tc.id === id ? { ...tc, ...updates } : tc,
      ),
    }));
    showToast("اطلاعات استاد با موفقیت به‌روز شد.");
  };

  const deleteTeacher = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const target = db.teachers.find((t) => t.id === id);
    setDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));
    showToast(`استاد «${target?.name || ""}» حذف شد.`, "warning");
  };

  // ================= ATTENDANCE ACTIONS =================
  const updateAttendanceStatus = (
    recordId: string,
    newStatus: AttendanceStatus | null,
    notes?: string,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      let record = prev.attendance.find((a) => a.id === recordId);
      let isNewAutoEntry = false;

      if (!record && recordId.startsWith("att-sched-")) {
        const parts = recordId.replace("att-sched-", "").split("-");
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const studentId = parts.slice(3).join("-");
        const targetStudent = prev.students.find((s) => s.id === studentId);
        if (targetStudent) {
          record = {
            id: recordId,
            date,
            time: targetStudent.classTime || "16:00",
            studentId,
            teacherId: targetStudent.teacherId,
            instrument: targetStudent.instrument,
            status: null,
            notes: "",
            updatedAt: new Date().toISOString(),
          };
          isNewAutoEntry = true;
        }
      }

      if (!record) return prev;

      const oldStatus = record.status;
      if (!isNewAutoEntry && oldStatus === newStatus && notes === record.notes)
        return prev;

      const student = prev.students.find((s) => s.id === record!.studentId);
      let updatedStudents = [...prev.students];
      const updatedCreditLogs = [...prev.creditLogs];

      if (student) {
        let creditChange = 0;
        let creditReason = "";

        const givesCredit = (st: AttendanceStatus | null) =>
          st === "excused" || st === "teacher_cancelled";

        let attendedDelta = 0;

        if (isNewAutoEntry) {
          if (newStatus === "present") {
            attendedDelta = 1;
          }
          if (givesCredit(newStatus)) {
            creditChange = 1;
            creditReason =
              newStatus === "excused"
                ? "افزایش خودکار ۱ جلسه اعتبار جبرانی (غیبت موجه هنرجو)"
                : "افزایش خودکار ۱ جلسه اعتبار جبرانی (کنسلی توسط استاد)";
          }
        } else {
          if (!givesCredit(oldStatus) && givesCredit(newStatus)) {
            // Gained credit (+1)
            creditChange = 1;
            creditReason =
              newStatus === "excused"
                ? "افزایش خودکار ۱ جلسه اعتبار جبرانی (غیبت موجه هنرجو)"
                : "افزایش خودکار ۱ جلسه اعتبار جبرانی (کنسلی توسط استاد)";
          } else if (givesCredit(oldStatus) && !givesCredit(newStatus)) {
            // Lost credit (-1)
            creditChange = -1;
            creditReason =
              newStatus === null
                ? `لغو وضعیت ${oldStatus === "excused" ? "غیبت موجه" : "کنسلی استاد"} و بازگشت به حالت ثبت‌نشده`
                : `تغییر وضعیت جلسه از ${oldStatus === "excused" ? "موجه" : "کنسلی"} به ${newStatus === "present" ? "حاضر" : "غیبت غیرموجه"}`;
          }

          // Recalculate attended sessions
          if (oldStatus !== "present" && newStatus === "present") {
            attendedDelta = 1;
          } else if (oldStatus === "present" && newStatus !== "present") {
            attendedDelta = -1;
          }
        }

        const newCredits = Math.max(0, student.makeupCredits + creditChange);
        const newAttended = Math.max(
          0,
          student.attendedSessions + attendedDelta,
        );

        updatedStudents = updatedStudents.map((s) =>
          s.id === student.id
            ? {
                ...s,
                makeupCredits: newCredits,
                attendedSessions: newAttended,
              }
            : s,
        );

        if (creditChange !== 0) {
          updatedCreditLogs.unshift({
            id: `cl-${Date.now()}`,
            studentId: student.id,
            date: record.date,
            change: creditChange,
            previousBalance: student.makeupCredits,
            newBalance: newCredits,
            reason: creditReason,
            recordedBy: "سیستم هوشمند حضور و غیاب",
          });
        }
      }

      const updatedRecord: AttendanceRecord = {
        ...record,
        status: newStatus,
        notes: notes !== undefined ? notes : record.notes || "",
        creditAdded:
          newStatus === "excused" || newStatus === "teacher_cancelled",
        creditAddedReason:
          newStatus === "excused"
            ? "غیبت موجه هنرجو (+۱ جبرانی)"
            : newStatus === "teacher_cancelled"
              ? "کنسلی توسط استاد (+۱ جبرانی)"
              : undefined,
        updatedAt: new Date().toISOString(),
      };

      const updatedAttendance = isNewAutoEntry
        ? [updatedRecord, ...prev.attendance]
        : prev.attendance.map((a) => (a.id === recordId ? updatedRecord : a));

      return {
        ...prev,
        attendance: updatedAttendance,
        students: updatedStudents,
        creditLogs: updatedCreditLogs,
      };
    });

    const statusTitle =
      newStatus === "present"
        ? "حاضر (تشکیل شده)"
        : newStatus === "excused"
          ? "غیبت موجه (+۱ جلسه جبرانی افزوده شد)"
          : newStatus === "teacher_cancelled"
            ? "کنسلی استاد (+۱ جلسه جبرانی افزوده شد)"
            : newStatus === "no_show"
              ? "غیبت غیرموجه"
              : "لغو وضعیت (ثبت‌نشده)";

    if (newStatus === null) {
      showToast("وضعیت جلسه لغو شد و به حالت ثبت‌نشده بازگشت.", "info");
    } else {
      showToast(`وضعیت به «${statusTitle}» تغییر یافت.`);
    }
  };

  const createOrUpdateAttendance = (
    date: string,
    studentId: string,
    status: AttendanceStatus | null,
    time?: string,
    notes?: string,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const existing = db.attendance.find(
      (a) => a.date === date && a.studentId === studentId,
    );
    if (existing) {
      updateAttendanceStatus(existing.id, status, notes);
      return;
    }

    if (status === null) return;

    const student = db.students.find((s) => s.id === studentId);
    if (!student) return;

    const newRecordId = `att-${date}-${studentId}`;
    const givesCredit = status === "excused" || status === "teacher_cancelled";

    setDb((prev) => {
      let updatedStudents = prev.students;
      let updatedCreditLogs = prev.creditLogs;

      if (givesCredit) {
        const newCredits = student.makeupCredits + 1;
        updatedStudents = prev.students.map((s) =>
          s.id === studentId ? { ...s, makeupCredits: newCredits } : s,
        );
        updatedCreditLogs = [
          {
            id: `cl-${Date.now()}`,
            studentId,
            date,
            change: 1,
            previousBalance: student.makeupCredits,
            newBalance: newCredits,
            reason: status === "excused" ? "غیبت موجه هنرجو" : "کنسلی استاد",
            recordedBy: "سیستم هوشمند حضور و غیاب",
          },
          ...prev.creditLogs,
        ];
      }

      if (status === "present") {
        updatedStudents = updatedStudents.map((s) =>
          s.id === studentId
            ? { ...s, attendedSessions: s.attendedSessions + 1 }
            : s,
        );
      }

      const newRecord: AttendanceRecord = {
        id: newRecordId,
        date,
        time: time || student.classTime || "16:00",
        studentId,
        teacherId: student.teacherId,
        instrument: student.instrument,
        status,
        notes: notes || "",
        creditAdded: givesCredit,
        creditAddedReason: givesCredit
          ? "ثبت غیبت موجه یا کنسلی استاد"
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        attendance: [newRecord, ...prev.attendance],
        students: updatedStudents,
        creditLogs: updatedCreditLogs,
      };
    });

    showToast("حضور و غیاب برای این هنرجو با موفقیت ثبت شد.");
  };

  const getAttendanceForDate = (date: string): AttendanceRecord[] => {
    // 1. Existing saved attendance records for this date
    const existingRecords = db.attendance.filter((a) => a.date === date);
    const existingStudentIds = new Set(existingRecords.map((r) => r.studentId));

    // 2. Identify the Persian weekday for the requested date
    const dayOfWeek = getPersianWeekdayFromDate(date);

    // 3. For any active student scheduled for this weekday who does not yet have a record:
    // (Ensure students enrolled before or on this date appear for roll-call)
    const autoEntries: AttendanceRecord[] = [];
    db.students.forEach((student) => {
      if (student.status !== "active") return;
      if (existingStudentIds.has(student.id)) return;

      // Check if registered date is after this date, or if student has schedule for this day
      if (student.registeredDate && student.registeredDate > date) return;

      // Check primary slot and any additional weekly slots
      let hasClassToday = student.classDay === dayOfWeek;
      let classTime = student.classTime || "16:00";

      if (
        !hasClassToday &&
        student.weeklySlots &&
        student.weeklySlots.length > 0
      ) {
        const matchingSlot = student.weeklySlots.find(
          (slot) => slot.day === dayOfWeek,
        );
        if (matchingSlot) {
          hasClassToday = true;
          classTime = matchingSlot.time || classTime;
        }
      }

      if (hasClassToday) {
        autoEntries.push({
          id: `att-sched-${date}-${student.id}`,
          date,
          time: classTime,
          studentId: student.id,
          teacherId: student.teacherId,
          instrument: student.instrument,
          status: null, // Default is null so user can see who is really marked
          notes: "",
          updatedAt: new Date().toISOString(),
        });
      }
    });

    const allRecords = [...existingRecords, ...autoEntries];
    return allRecords.sort((a, b) => a.time.localeCompare(b.time));
  };

  // ================= NOTES ACTIONS =================
  const addNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const newNote: Note = {
      ...noteData,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    showToast("یادداشت جدید با موفقیت ذخیره شد.");
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
    showToast("یادداشت با موفقیت ویرایش شد.");
  };

  const deleteNote = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    showToast("یادداشت حذف شد.", "info");
  };

  const getNotesForDate = (date: string): Note[] => {
    return db.notes.filter(
      (n) =>
        n.date === date || (n.targetType === "date" && n.targetId === date),
    );
  };

  const getNotesForStudent = (studentId: string): Note[] => {
    return db.notes.filter(
      (n) => n.targetType === "student" && n.targetId === studentId,
    );
  };

  const getNotesForTeacher = (teacherId: string): Note[] => {
    return db.notes.filter(
      (n) => n.targetType === "teacher" && n.targetId === teacherId,
    );
  };

  // ================= FINANCE ACTIONS =================
  const deleteTransaction = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
    showToast("تراکنش با موفقیت حذف شد.", "info");
  };

  const addTransaction = (txData: Omit<FinancialTransaction, "id">) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setDb((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    showToast("تراکنش مالی با موفقیت ثبت شد.");
  };

  const recordStudentPayment = (
    studentId: string,
    amount: number,
    paymentMethod: FinancialTransaction["paymentMethod"],
    receiptNumber?: string,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const student = prev.students.find((s) => s.id === studentId);
      if (!student) return prev;

      const newPaid = (student.paidAmount || 0) + amount;
      let newStatus = student.paymentStatus;
      if (newPaid >= student.tuitionFee) {
        newStatus = "paid";
      } else if (newPaid > 0) {
        newStatus = "partial";
      } else {
        newStatus = "overdue";
      }

      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        date: getTodayString(),
        type: "tuition_income",
        amount,
        studentId,
        description: `واریز شهریه هنرجو ${student.name} - ${receiptNumber || "رسید نقدی/کارتخوان"}`,
        paymentMethod,
        receiptNumber,
      };

      const logMsg = `واریز شهریه: مبلغ ${amount.toLocaleString("fa-IR")} تومان`;
      const newFinancialNote = appendFinancialNote(
        student.financialNote,
        logMsg,
      );

      return {
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                paidAmount: newPaid,
                paymentStatus: newStatus,
                financialNote: newFinancialNote,
              }
            : s,
        ),
        transactions: [newTx, ...prev.transactions],
      };
    });
    showToast("واریز شهریه ثبت شد و وضعیت پرداخت هنرجو به‌روزرسانی گردید.");
  };

  const calculateTeacherPayroll = (
    startDate: string,
    endDate: string,
    teacherId?: string,
  ): TeacherPayrollCalculation[] => {
    const teachersToProcess = teacherId
      ? db.teachers.filter((t) => t.id === teacherId)
      : db.teachers;

    return teachersToProcess.map((teacher) => {
      const teacherRecords = db.attendance.filter(
        (a) =>
          a.teacherId === teacher.id &&
          a.date >= startDate &&
          a.date <= endDate,
      );

      const presentCount = teacherRecords.filter(
        (a) => a.status === "present",
      ).length;
      const excusedCount = teacherRecords.filter(
        (a) => a.status === "excused",
      ).length;
      const cancelledCount = teacherRecords.filter(
        (a) => a.status === "teacher_cancelled",
      ).length;
      const noShowCount = teacherRecords.filter(
        (a) => a.status === "no_show",
      ).length;

      // Calculate student breakdown
      const studentMap = new Map<
        string,
        { name: string; instrument: string; count: number }
      >();
      let totalPayable = 0;
      let totalInstituteRevenue = 0;
      teacherRecords.forEach((rec) => {
        if (rec.status === "present") {
          const st = db.students.find((s) => s.id === rec.studentId);
          const name = st?.name || rec.studentId;
          const current = studentMap.get(rec.studentId) || {
            name,
            instrument: rec.instrument,
            count: 0,
          };
          current.count += 1;
          studentMap.set(rec.studentId, current);

          const sessionPrice = teacher.hourlyRate || 0;
          const teacherWage = Math.round(
            (sessionPrice * (teacher.percentageRate || 100)) / 100,
          );
          const instRevenue = sessionPrice - teacherWage;

          totalPayable += teacherWage;
          totalInstituteRevenue += instRevenue;
        }
      });

      const studentBreakdown = Array.from(studentMap.values()).map((v) => ({
        studentName: v.name,
        instrument: v.instrument,
        presentCount: v.count,
      }));

      return {
        teacher,
        totalPresentSessions: presentCount,
        totalExcusedSessions: excusedCount,
        totalCancelledSessions: cancelledCount,
        totalNoShowSessions: noShowCount,
        hourlyRate: teacher.hourlyRate || 0,
        totalPayable,
        totalInstituteRevenue,
        studentBreakdown,
      };
    });
  };

  // ================= DATABASE / BACKUP =================
  const exportBackup = () => {
    exportDatabaseBackup(db);
    showToast("فایل پشتیبان کامل پایگاه داده استخراج شد.");
  };

  const exportAuditLogs = () => {
    exportTransactionLogFile();
    showToast("فایل لاگ تغییرات سیستم با موفقیت دانلود شد.");
  };

  const importBackup = async (file: File) => {
    try {
      const importedDb = await importDatabaseFromFile(file);
      setDb(importedDb);
      if (importedDb.settings.theme) {
        setTheme(importedDb.settings.theme);
      }
      showToast(
        "پایگاه‌داده با موفقیت از فایل بارگذاری و جایگزین شد.",
        "success",
      );
    } catch (err: any) {
      showToast(
        `خطا در بارگذاری فایل پشتیبان: ${err?.message || "فایل نامعتبر"}`,
        "error",
      );
    }
  };

  const resetDatabase = () => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    const fresh = { ...INITIAL_SAMPLE_DATABASE };
    fresh.attendance = generateInitialAttendance(
      fresh.teachers,
      fresh.students,
    );
    setDb(fresh);
    saveDatabase(fresh);
    showToast("اطلاعات پیش‌فرض آموزشگاه با موفقیت بارگذاری شد.", "info");
  };

  const updateSettings = (
    settingsUpdates: Partial<AcademyDatabase["settings"]>,
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settingsUpdates },
    }));
    showToast("تنظیمات آموزشگاه با موفقیت ذخیره شد.");
  };

  const archiveAndResetSemester = (
    formatTrack: 1 | 2,
    returningStudentIds: string[],
    options: {
      archiveTitle: string;
      carryOverFinancials: boolean;
      carryOverCredits: boolean;
    },
  ) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => {
      const newArchive: SemesterArchive = {
        id: Date.now().toString(),
        title: options.archiveTitle,
        format: formatTrack,
        startDate:
          formatTrack === 1
            ? prev.settings.semesterStartDate || ""
            : prev.settings.semester2StartDate || "",
        endDate:
          formatTrack === 1
            ? prev.settings.semesterEndDate || ""
            : prev.settings.semester2EndDate || "",
        archivedAt: new Date().toISOString(),
        students: JSON.parse(JSON.stringify(prev.students)),
        attendance: JSON.parse(JSON.stringify(prev.attendance)),
        transactions: JSON.parse(JSON.stringify(prev.transactions)),
        creditLogs: JSON.parse(JSON.stringify(prev.creditLogs)),
      };

      const trackTeacherIds = prev.teachers
        .filter(
          (t) =>
            t.semesterFormat === formatTrack ||
            (!t.semesterFormat && formatTrack === 1),
        )
        .map((t) => t.id);

      const updatedStudents = prev.students.map((student) => {
        if (!trackTeacherIds.includes(student.teacherId)) return student;

        if (returningStudentIds.includes(student.id)) {
          const debt = student.tuitionFee - student.paidAmount;
          const newPaidAmount = options.carryOverFinancials ? -debt : 0;
          const newMakeup = options.carryOverCredits
            ? student.makeupCredits
            : 0;

          let paymentStatus = "overdue";
          if (newPaidAmount >= student.tuitionFee) {
            paymentStatus = "paid";
          } else if (newPaidAmount > 0) {
            paymentStatus = "partial";
          }

          return {
            ...student,
            status: "active" as const,
            attendedSessions: 0,
            paidAmount: newPaidAmount,
            makeupCredits: newMakeup,
            paymentStatus: paymentStatus as any,
          };
        } else {
          return {
            ...student,
            status: "suspended" as const,
          };
        }
      });

      const updatedAttendance = prev.attendance.filter(
        (a) => !trackTeacherIds.includes(a.teacherId),
      );

      const updatedTransactions = prev.transactions.filter((tx) => {
        if (
          tx.type === "teacher_payout" &&
          tx.teacherId &&
          trackTeacherIds.includes(tx.teacherId)
        )
          return false;
        if (tx.type === "tuition_income" && tx.studentId) {
          const student = prev.students.find((s) => s.id === tx.studentId);
          if (student && trackTeacherIds.includes(student.teacherId))
            return false;
        }
        return true;
      });

      const updatedCreditLogs = prev.creditLogs.filter((log) => {
        const student = prev.students.find((s) => s.id === log.studentId);
        if (student && trackTeacherIds.includes(student.teacherId))
          return false;
        return true;
      });

      return {
        ...prev,
        archives: [...(prev.archives || []), newArchive],
        students: updatedStudents,
        attendance: updatedAttendance,
        transactions: updatedTransactions,
        creditLogs: updatedCreditLogs,
      };
    });
    showToast("پایان ترم با موفقیت انجام شد و آرشیو ذخیره گردید.", "success");
  };

  const addTodo = (title: string, date: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      todos: [
        ...(prev.todos || []),
        {
          id: `todo-${Date.now()}`,
          title,
          date,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const toggleTodo = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      todos: (prev.todos || []).map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    }));
  };

  const deleteTodo = (id: string) => {
    if (activeArchiveId) {
      showToast("در حال مشاهده آرشیو هستید. امکان تغییر وجود ندارد.", "error");
      return;
    }
    setDb((prev) => ({
      ...prev,
      todos: (prev.todos || []).filter((todo) => todo.id !== id),
    }));
  };

  const effectiveDb = React.useMemo(() => {
    if (activeArchiveId && db.archives) {
      const archive = db.archives.find((a) => a.id === activeArchiveId);
      if (archive) {
        return {
          ...db,
          students: archive.students,
          attendance: archive.attendance,
          transactions: archive.transactions,
          creditLogs: archive.creditLogs,
        };
      }
    }
    return db;
  }, [db, activeArchiveId]);

  return (
    <AcademyContext.Provider
      value={{
        db: effectiveDb,
        activeArchiveId,
        setActiveArchiveId,
        isArchiveView,
        currentTab,
        setCurrentTab,
        theme,
        setTheme,
        selectedDate,
        setSelectedDate,
        activeAttendanceView,
        setActiveAttendanceView,
        searchQuery,
        setSearchQuery,
        isAutoSaving,
        lastSavedTime,
        toastMessage,
        showToast,
        addStudent,
        updateStudent,
        deleteStudent,
        overrideStudentCredits,
        addExtraClass,
        deleteExtraClass,
        updateExtraClass,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        updateAttendanceStatus,
        createOrUpdateAttendance,
        getAttendanceForDate,
        addNote,
        updateNote,
        deleteNote,
        getNotesForDate,
        getNotesForStudent,
        getNotesForTeacher,
        addTransaction,
        deleteTransaction,
        recordStudentPayment,
        calculateTeacherPayroll,
        exportBackup,
        exportAuditLogs,
        importBackup,
        resetDatabase,
        updateSettings,
        archiveAndResetSemester,
        addTodo,
        toggleTodo,
        deleteTodo,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error("useAcademy must be used within an AcademyProvider");
  }
  return context;
};
