import * as XLSX from "xlsx-js-style";
import { AcademyDatabase } from "../types";
import {
  toJalaliDateString,
  formatFullJalali,
  getTodayString,
  formatToman,
} from "./persianDate";

const STATUS_MAP_FA: Record<string, string> = {
  present: "حاضر (تشکیل شده)",
  no_show: "غیبت غیرموجه",
  excused: "غیبت موجه (+۱ جبرانی)",
  teacher_cancelled: "کنسلی توسط استاد (+۱ جبرانی)",
  unrecorded: "ثبت‌نشده",
};

const PAYMENT_STATUS_FA: Record<string, string> = {
  paid: "تسویه کامل",
  partial: "پرداخت ناقص",
  overdue: "معوق / بدهکار",
};

const STUDENT_STATUS_FA: Record<string, string> = {
  active: "فعال",
  suspended: "معلق",
  graduated: "فارغ‌التحصیل / پایان ترم",
};

const TRANSACTION_TYPE_FA: Record<string, string> = {
  tuition_income: "دریافت شهریه هنرجو",
  teacher_payout: "پرداخت حق‌التدریس استاد",
  expense: "هزینه‌های جاری آموزشگاه",
  other_income: "سایر درآمدهای متفرقه",
};

const PAYMENT_METHOD_FA: Record<string, string> = {
  cash: "نقدی",
  pos: "کارتخوان (POS)",
  card_transfer: "کارت‌به‌کارت",
  cheque: "چک",
};

/**
 * Generate and download neatly formatted multi-sheet Excel report with strict date window filtering
 */
const applyTableStyles = (ws: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  ws["!rows"] = [];
  for (let r = range.s.r; r <= range.e.r; ++r) {
    ws["!rows"][r] = { hpt: 20 };
    for (let c = range.s.c; c <= range.e.c; ++c) {
      const cellAddress = { c, r };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        alignment: { vertical: "center", horizontal: "center" },
        font: { bold: r === 0 },
      };

      if (r === 0) {
        ws[cellRef].s.fill = { fgColor: { rgb: "FF4F81BD" } };
        ws[cellRef].s.font.color = { rgb: "FFFFFFFF" };
      } else if (r % 2 === 0) {
        ws[cellRef].s.fill = { fgColor: { rgb: "FFF2F2F2" } };
      }
    }
  }
};

export function exportMultiSheetExcel(
  db: AcademyDatabase,
  customTitle = "گزارش_جامع_آموزشگاه_موسیقی",
  dateRange?: { startDate?: string; endDate?: string },
): void {
  const wb = XLSX.utils.book_new();

  const todayStr = getTodayString();
  const validEndDate =
    dateRange?.endDate && dateRange.endDate <= todayStr
      ? dateRange.endDate
      : todayStr;
  const validStartDate = dateRange?.startDate || "1400-01-01";

  // Filter Attendance records strictly by date range
  const filteredAttendance = db.attendance.filter((att) => {
    if (att.date < validStartDate) return false;
    if (att.date > validEndDate) return false;
    return true;
  });

  // Filter Notes strictly by date range
  const filteredNotes = db.notes.filter((n) => {
    if (n.date < validStartDate) return false;
    if (n.date > validEndDate) return false;
    return true;
  });

  // Filter Transactions strictly by date range
  const filteredTransactions = (db.transactions || []).filter((t) => {
    if (t.date < validStartDate) return false;
    if (t.date > validEndDate) return false;
    return true;
  });

  // Filter Credit Audit Logs strictly by date range
  const filteredCreditLogs = (db.creditLogs || []).filter((cl) => {
    if (cl.date < validStartDate) return false;
    if (cl.date > validEndDate) return false;
    return true;
  });

  // Filter Students active or registered in or before this window, or having classes in this window
  const studentIdsWithAttendance = new Set(
    filteredAttendance.map((a) => a.studentId),
  );
  const filteredStudents = db.students.filter((st) => {
    if (st.registeredDate > validEndDate) return false;
    if (dateRange?.startDate) {
      // Keep if registered in/before window and has active state or attendance in window
      return (
        st.status === "active" ||
        studentIdsWithAttendance.has(st.id) ||
        st.registeredDate >= validStartDate
      );
    }
    return true;
  });

  // Filter Teachers active or having classes in this window
  const teacherIdsWithAttendance = new Set(
    filteredAttendance.map((a) => a.teacherId),
  );
  const filteredTeachers = db.teachers.filter((tc) => {
    if (tc.hireDate > validEndDate) return false;
    if (dateRange?.startDate) {
      return (
        tc.status === "active" ||
        teacherIdsWithAttendance.has(tc.id) ||
        tc.hireDate >= validStartDate
      );
    }
    return true;
  });

  const teacherMap = new Map(db.teachers.map((t) => [t.id, t.name]));
  const teacherObjMap = new Map(db.teachers.map((t) => [t.id, t]));
  const studentMap = new Map(db.students.map((s) => [s.id, s.name]));
  const studentObjMap = new Map(db.students.map((s) => [s.id, s]));

  // Calculate Metrics strictly for this window
  const presentCount = filteredAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const excusedCount = filteredAttendance.filter(
    (a) => a.status === "excused",
  ).length;
  const teacherCancelledCount = filteredAttendance.filter(
    (a) => a.status === "teacher_cancelled",
  ).length;
  const noShowCount = filteredAttendance.filter(
    (a) => a.status === "no_show",
  ).length;

  let totalSessionTuitionValueInRange = 0;
  let totalTeacherPayrollInRange = 0;

  filteredAttendance.forEach((att) => {
    if (att.status === "present") {
      const student = studentObjMap.get(att.studentId);
      const teacher = teacherObjMap.get(att.teacherId);
      const tuitionPerSession =
        student && student.targetSessions > 0
          ? Math.round(student.tuitionFee / student.targetSessions)
          : db.settings.defaultPricePerSession || 350000;
      const teacherWage =
        teacher?.hourlyRate || db.settings.defaultPricePerSession || 350000;

      totalSessionTuitionValueInRange += tuitionPerSession;
      totalTeacherPayrollInRange += teacherWage;
    }
  });

  const totalTransactionIncomeInRange = filteredTransactions
    .filter((t) => t.type === "tuition_income" || t.type === "other_income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalTransactionExpenseInRange = filteredTransactions
    .filter((t) => t.type === "teacher_payout" || t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // 1. Executive Summary Sheet
  const summaryData = [
    { شاخص: "نام آموزشگاه", مقدار: db.settings.academyName },
    {
      شاخص: "بازه زمانی اعمال‌شده روی تمام برگه‌ها",
      مقدار: `از ${toJalaliDateString(validStartDate)} تا ${toJalaliDateString(validEndDate)}`,
    },
    {
      شاخص: "تاریخ استخراج گزارش",
      مقدار: `${formatFullJalali(todayStr)} (${toJalaliDateString(todayStr)})`,
    },
    { شاخص: "مدیر آموزشگاه", مقدار: db.settings.managerName },
    { شاخص: "تلفن تماس", مقدار: db.settings.phone },
    { شاخص: "آدرس آموزشگاه", مقدار: db.settings.address || "-" },
    { شاخص: "---", مقدار: "---" },
    {
      شاخص: "تعداد رویدادهای حضور و غیاب در این بازه",
      مقدار: filteredAttendance.length,
    },
    { شاخص: "تعداد جلسات تشکیل‌شده (حاضر) در این بازه", مقدار: presentCount },
    { شاخص: "غیبت‌های موجه در این بازه", مقدار: excusedCount },
    { شاخص: "کنسلی‌های استاد در این بازه", مقدار: teacherCancelledCount },
    { شاخص: "غیبت‌های غیرموجه در این بازه", مقدار: noShowCount },
    { شاخص: "---", مقدار: "---" },
    {
      شاخص: "مجموع ارزش شهریه جلسات تشکیل‌شده در این بازه (تومان)",
      مقدار: totalSessionTuitionValueInRange,
    },
    {
      شاخص: "مجموع حق‌التدریس و کارکرد اساتید در این بازه (تومان)",
      مقدار: totalTeacherPayrollInRange,
    },
    {
      شاخص: "سود ناخالص جلسات در این بازه (تومان)",
      مقدار: totalSessionTuitionValueInRange - totalTeacherPayrollInRange,
    },
    { شاخص: "---", مقدار: "---" },
    {
      شاخص: "مجموع تراکنش‌های دریافتی ثبت‌شده در این بازه (تومان)",
      مقدار: totalTransactionIncomeInRange,
    },
    {
      شاخص: "مجموع پرداختی‌ها و مخارج ثبت‌شده در این بازه (تومان)",
      مقدار: totalTransactionExpenseInRange,
    },
    {
      شاخص: "تعداد یادداشت‌ها و رویدادهای ثبت‌شده در این بازه",
      مقدار: filteredNotes.length,
    },
    {
      شاخص: "خالص درآمد آموزشگاه از کلاس‌های برگزار شده (شهریه منهای حقوق اساتید)",
      مقدار: (() => {
        let instituteNet = 0;
        filteredAttendance.forEach((att) => {
          if (att.status === "present") {
            const st = studentObjMap.get(att.studentId);
            const tc = teacherObjMap.get(att.teacherId);
            const stTuition =
              st?.sessionFeeOverride ||
              (st && st.targetSessions > 0
                ? Math.round(st.tuitionFee / st.targetSessions)
                : db.settings.defaultPricePerSession || 350000);
            const tcWage = Math.round(
              ((tc?.hourlyRate || 0) * (tc?.percentageRate || 100)) / 100,
            );
            instituteNet += stTuition - tcWage;
          }
        });
        return instituteNet;
      })(),
    },
    {
      شاخص: "خالص درآمد اساتید از کلاس‌های برگزار شده",
      مقدار: (() => {
        let teachersNet = 0;
        filteredAttendance.forEach((att) => {
          if (att.status === "present") {
            const st = studentObjMap.get(att.studentId);
            const tc = teacherObjMap.get(att.teacherId);
            const stTuition =
              st?.sessionFeeOverride ||
              (st && st.targetSessions > 0
                ? Math.round(st.tuitionFee / st.targetSessions)
                : db.settings.defaultPricePerSession || 350000);
            const tcWage = Math.round(
              ((tc?.hourlyRate || 0) * (tc?.percentageRate || 100)) / 100,
            );
            teachersNet += tcWage;
          }
        });
        return teachersNet;
      })(),
    },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "خلاصه وضعیت بازه انتخابی");

  // 2. Attendance Sheet (Filtered by Date Range)
  const attendanceRows = filteredAttendance.map((att, idx) => {
    const student = studentObjMap.get(att.studentId);
    const teacher = teacherObjMap.get(att.teacherId);
    const sessionTuition =
      student?.sessionFeeOverride ||
      (student && student.targetSessions > 0
        ? Math.round(student.tuitionFee / student.targetSessions)
        : db.settings.defaultPricePerSession || 350000);
    const sessionWage = Math.round(
      ((teacher?.hourlyRate || 0) * (teacher?.percentageRate || 100)) / 100,
    );

    return {
      ردیف: idx + 1,
      "شناسه جلسه": att.id,
      "تاریخ شمسی": toJalaliDateString(att.date),
      "روز و تاریخ": formatFullJalali(att.date),
      "ساعت کلاس": att.time,
      "نام هنرجو": studentMap.get(att.studentId) || att.studentId,
      "نام استاد": teacherMap.get(att.teacherId) || att.teacherId,
      "ساز / رشته": att.instrument,
      "وضعیت حضور": att.status ? (STATUS_MAP_FA[att.status] || att.status) : STATUS_MAP_FA.unrecorded,
      "ارزش جلسه (تومان)": att.status === "present" ? sessionTuition : 0,
      "حق‌التدریس استاد (تومان)": att.status === "present" ? sessionWage : 0,
      "اعتبار جبرانی اضافه شده": att.creditAdded ? "بله (+۱)" : "خیر",
    };
  });
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceRows);
  XLSX.utils.book_append_sheet(wb, wsAttendance, "سوابق حضور و غیاب");

  // 3. Students Sheet (Filtered by Date Range and Metrics calculated within range)
  const studentRows = filteredStudents.map((st, idx) => {
    const stAttendance = filteredAttendance.filter(
      (a) => a.studentId === st.id,
    );
    const presentInRange = stAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const excusedInRange = stAttendance.filter(
      (a) => a.status === "excused",
    ).length;
    const noShowInRange = stAttendance.filter(
      (a) => a.status === "no_show",
    ).length;
    const teacherCancelledInRange = stAttendance.filter(
      (a) => a.status === "teacher_cancelled",
    ).length;

    return {
      ردیف: idx + 1,
      "کد هنرجو": st.id,
      "نام و نام خانوادگی": st.name,
      "کد ملی": st.nationalId || "-",
      "شماره تماس": st.phone,
      ساز: st.instrument,
      "استاد مدرس": teacherMap.get(st.teacherId) || "-",
      "روز کلاس": st.classDay,
      "ساعت کلاس": st.classTime,
      "مدت جلسه (دقیقه)": st.classDurationMinutes,
      "جلسات حاضر در این بازه": presentInRange,
      "غیبت موجه در این بازه": excusedInRange,
      "غیبت غیرموجه در این بازه": noShowInRange,
      "کنسلی استاد در این بازه": teacherCancelledInRange,
      "کل جلسات ثبت شده در این بازه": stAttendance.length,
      "اعتبار جبرانی فعلی": st.makeupCredits,
      "شهریه کل دوره (تومان)": st.tuitionFee,
      "مبلغ پرداختی (تومان)": st.paidAmount,
      "مانده بدهی (تومان)": st.tuitionFee - st.paidAmount,
      "وضعیت تسویه": PAYMENT_STATUS_FA[st.paymentStatus] || st.paymentStatus,
      "وضعیت هنرجو": STUDENT_STATUS_FA[st.status] || st.status,
      "تاریخ ثبت نام": toJalaliDateString(st.registeredDate),
      "یادداشت هنرجو": st.notes || "",
    };
  });
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, "هنرجویان در این بازه");

  // 4. Teachers & Payroll Sheet (Filtered by Date Range)
  const teacherRows = filteredTeachers.map((tc, idx) => {
    const tcAttendance = filteredAttendance.filter(
      (a) => a.teacherId === tc.id,
    );
    const presentInRange = tcAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const cancelledInRange = tcAttendance.filter(
      (a) => a.status === "teacher_cancelled",
    ).length;

    let totalEarnedInRange = 0;
    tcAttendance.forEach((a) => {
      if (a.status === "present") {
        const st = studentObjMap.get(a.studentId);
        const sessionTuition =
          st?.sessionFeeOverride ||
          (st && st.targetSessions > 0
            ? Math.round(st.tuitionFee / st.targetSessions)
            : db.settings.defaultPricePerSession || 350000);
        const wage = Math.round(
          ((tc.hourlyRate || 0) * (tc.percentageRate || 100)) / 100,
        );
        totalEarnedInRange += wage;
      }
    });
    const studentsInTeacherCount = db.students.filter(
      (s) => s.teacherId === tc.id && s.status === "active",
    ).length;

    return {
      ردیف: idx + 1,
      "کد استاد": tc.id,
      "نام و نام خانوادگی": tc.name,
      "شماره تماس": tc.phone,
      "سازهای تدریس": tc.instruments.join("، "),
      "ارزش پایه هر جلسه (تومان)": tc.hourlyRate || 0,
      "درصد سهم استاد": (tc.percentageRate || 100) + "٪",
      "مبلغ سهم استاد هر جلسه (تومان)": Math.round(
        ((tc.hourlyRate || 0) * (tc.percentageRate || 100)) / 100,
      ),
      "جلسات تشکیل‌شده در این بازه": presentInRange,
      "کنسلی‌های استاد در این بازه": cancelledInRange,
      "مجموع درآمد خالص این استاد در بازه (تومان)": totalEarnedInRange,
      "درآمد آموزشگاه از کلاس‌های این استاد (تومان)": (() => {
        let instEarned = 0;
        tcAttendance.forEach((a) => {
          if (a.status === "present") {
            const st = studentObjMap.get(a.studentId);
            const sessionTuition =
              st?.sessionFeeOverride ||
              (st && st.targetSessions > 0
                ? Math.round(st.tuitionFee / st.targetSessions)
                : db.settings.defaultPricePerSession || 350000);
            const wage = Math.round(
              ((tc.hourlyRate || 0) * (tc.percentageRate || 100)) / 100,
            );
            instEarned += sessionTuition - wage;
          }
        });
        return instEarned;
      })(),
      "تعداد کل هنرجویان فعال": studentsInTeacherCount,
      "روزهای حضور": tc.availableDays.join("، "),
      "وضعیت همکاری": tc.status === "active" ? "فعال" : "غیرفعال",
      "تاریخ استخدام": toJalaliDateString(tc.hireDate),
      "یادداشت استاد": tc.notes || "",
    };
  });
  const wsTeachers = XLSX.utils.json_to_sheet(teacherRows);
  XLSX.utils.book_append_sheet(wb, wsTeachers, "اساتید و کارکرد در این بازه");

  // 5. Notes & Global Log Sheet (Filtered by Date Range)
  const noteRows = filteredNotes.map((n, idx) => {
    let targetName = "عمومی / آموزشگاه";
    if (n.targetType === "student" && n.targetId) {
      targetName = `هنرجو: ${studentMap.get(n.targetId) || n.targetId}`;
    } else if (n.targetType === "teacher" && n.targetId) {
      targetName = `استاد: ${teacherMap.get(n.targetId) || n.targetId}`;
    } else if (n.targetType === "date" && n.targetId) {
      targetName = `تاریخ: ${toJalaliDateString(n.targetId)}`;
    }

    return {
      ردیف: idx + 1,
      شناسه: n.id,
      "عنوان یادداشت": n.title,
      دسته‌بندی: n.category || "عمومی",
      "مربوط به": targetName,
      "مهم / سنجاق شده": n.pinned ? "بله" : "خیر",
      "تاریخ شمسی": toJalaliDateString(n.date),
      "متن کامل یادداشت": n.content,
      "زمان ثبت سیستم": n.createdAt,
    };
  });
  const wsNotes = XLSX.utils.json_to_sheet(noteRows);
  XLSX.utils.book_append_sheet(wb, wsNotes, "یادداشت‌ها در این بازه");

  // 6. Transactions Sheet (Filtered by Date Range)
  if (filteredTransactions.length > 0) {
    const transactionRows = filteredTransactions.map((tx, idx) => ({
      ردیف: idx + 1,
      "شناسه تراکنش": tx.id,
      "تاریخ شمسی": toJalaliDateString(tx.date),
      "نوع تراکنش": TRANSACTION_TYPE_FA[tx.type] || tx.type,
      "مبلغ (تومان)": tx.amount,
      "طرف حساب هنرجو": tx.studentId
        ? studentMap.get(tx.studentId) || tx.studentId
        : "-",
      "طرف حساب استاد": tx.teacherId
        ? teacherMap.get(tx.teacherId) || tx.teacherId
        : "-",
      "روش پرداخت": PAYMENT_METHOD_FA[tx.paymentMethod] || tx.paymentMethod,
      "شماره پیگیری / فیش": tx.receiptNumber || "-",
      "شرح تراکنش": tx.description,
    }));
    const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
    XLSX.utils.book_append_sheet(wb, wsTransactions, "تراکنش‌های مالی");
  }

  // Write and download
  wb.SheetNames.forEach((sheetName) => {
    applyTableStyles(wb.Sheets[sheetName]);
  });

  const dateStr =
    `${toJalaliDateString(validStartDate)}_تا_${toJalaliDateString(validEndDate)}`.replace(
      /\//g,
      "-",
    );
  XLSX.writeFile(wb, `${customTitle}_${dateStr}.xlsx`);
}
