import React, { useState } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  toPersianDigits,
  toEnglishDigits,
  formatToman,
  toJalaliDateString,
  getTodayString,
  addDays,
  getCurrentJalaliMonthRange,
  getCurrentJalaliWeekRange,
} from "../utils/persianDate";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { Pagination } from "./Pagination";
import {
  Calculator,
  Calendar,
  Wallet,
  DollarSign,
  Printer,
  ChevronRight,
  UserCheck,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Receipt,
  Coins,
} from "lucide-react";
import { Student, Teacher } from "../types";
import { CustomSelect } from "./ui/custom-select";
import { TeacherFinanceProfile } from "./TeacherFinanceProfile";
import { TeacherSettlementModal } from "./TeacherSettlementModal";
import { calculateTeacherFinanceSummary } from "../utils/financeUtils";

export const PayrollManager: React.FC = () => {
  const {
    db,
    calculateTeacherPayroll,
    addTransaction,
    deleteTransaction,
    recordStudentPayment,
    showToast,
  } = useAcademy();

  // Custom Date Range State (default to last 30 days to today)
  const [startDate, setStartDate] = useState<string>(() =>
    addDays(getTodayString(), -30),
  );
  const [endDate, setEndDate] = useState<string>(() => getTodayString());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");

  // Sub-tab: Teacher Payroll Calculator vs Student Tuition Ledger
  const [activeFinanceTab, setActiveFinanceTab] = useState<
    "payroll" | "tuition"
  >("payroll");

  // Teacher Finance Profile Modal State
  const [isFinanceProfileModalOpen, setIsFinanceProfileModalOpen] =
    useState<boolean>(false);
  const [selectedProfileTeacherId, setSelectedProfileTeacherId] =
    useState<string>("");

  // Teacher Settlement Modal State
  const [isSettlementModalOpen, setIsSettlementModalOpen] =
    useState<boolean>(false);
  const [settlementTeacher, setSettlementTeacher] = useState<Teacher | null>(
    null,
  );
  const [settlementDefaultAmount, setSettlementDefaultAmount] = useState<
    number | undefined
  >(undefined);
  const [settlementCurrentDebt, setSettlementCurrentDebt] = useState<number>(0);

  const handleOpenSettlement = (
    teacher: Teacher,
    amount?: number,
    currentDebt?: number,
  ) => {
    setSettlementTeacher(teacher);
    setSettlementDefaultAmount(amount);
    setSettlementCurrentDebt(currentDebt !== undefined ? currentDebt : 0);
    setIsSettlementModalOpen(true);
  };

  // Quick Payment Modal State (Students)
  const [selectedStudentForPayment, setSelectedStudentForPayment] =
    useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "pos" | "card_transfer" | "cash"
  >("pos");
  const [paymentReceipt, setPaymentReceipt] = useState<string>("");

  // Tuition Table Pagination
  const [tuitionPage, setTuitionPage] = useState<number>(1);
  const [tuitionPageSize, setTuitionPageSize] = useState<number>(10);

  const payrollResults = calculateTeacherPayroll(
    startDate,
    endDate,
    selectedTeacherId === "all" ? undefined : selectedTeacherId,
  );

  const totalPayrollPayable = payrollResults.reduce(
    (acc, p) => acc + p.totalPayable,
    0,
  );
  const totalPresentSessions = payrollResults.reduce(
    (acc, p) => acc + p.totalPresentSessions,
    0,
  );

  // Overall Debt to All Teachers
  const totalAcademyDebtToTeachers = db.teachers.reduce((sum, t) => {
    const s = calculateTeacherFinanceSummary(t, db);
    return s.netDebt > 0 ? sum + s.netDebt : sum;
  }, 0);

  // Student Billing Totals
  const totalTuition = db.students.reduce((acc, s) => acc + s.tuitionFee, 0);
  const totalCollected = db.students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalOutstanding = totalTuition - totalCollected;
  const overdueStudents = db.students.filter(
    (s) => s.paymentStatus === "overdue",
  );
  const partialStudents = db.students.filter(
    (s) => s.paymentStatus === "partial",
  );
  const paidStudents = db.students.filter((s) => s.paymentStatus === "paid");

  const teacherMap = new Map<string, Teacher>(
    db.teachers.map((t) => [t.id, t]),
  );

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;
    if (paymentAmount <= 0) {
      showToast("لطفاً مبلغ معتبری وارد کنید.", "warning");
      return;
    }
    recordStudentPayment(
      selectedStudentForPayment.id,
      paymentAmount,
      paymentMethod,
      paymentReceipt,
    );
    setSelectedStudentForPayment(null);
    setPaymentAmount(0);
    setPaymentReceipt("");
  };

  const handlePrintPayrollSlip = (item: (typeof payrollResults)[0]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>فیش تسویه حق‌التدریس - ${item.teacher.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
          body { padding: 30px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
          .info-box { display: flex; justify-content: space-between; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
          th { background: #f1f5f9; }
          .total-box { font-size: 16px; font-weight: bold; text-align: left; padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${db.settings.academyName}</h1>
          <div class="subtitle">صورتحساب و فیش پرداخت کارکرد استاد</div>
        </div>
        <div class="info-box">
          <div><strong>نام استاد:</strong> ${item.teacher.name}</div>
          <div><strong>بازه زمانی:</strong> از ${toJalaliDateString(startDate)} تا ${toJalaliDateString(endDate)}</div>
          <div><strong>تلفن:</strong> ${toPersianDigits(item.teacher.phone)}</div>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
             <div style="font-size: 11px; color: #64748b;">بهای پایه جلسه</div>
             <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">${formatToman(item.hourlyRate)}</div>
          </div>
          <div style="flex: 1; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
             <div style="font-size: 11px; color: #64748b;">سهم استاد از جلسه</div>
             <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #0284c7;">${toPersianDigits(item.teacher.percentageRate || 100)}٪</div>
          </div>
          <div style="flex: 1; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center;">
             <div style="font-size: 11px; color: #64748b;">دستمزد هر جلسه</div>
             <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #16a34a;">${formatToman(Math.round((item.hourlyRate * (item.teacher.percentageRate || 100)) / 100))}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>عنوان شاخص</th>
              <th>تعداد / مقدار</th>
              <th>نرخ محاسبه (تومان)</th>
              <th>مبلغ کل (تومان)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>جلسات تشکیل شده (حاضر)</td>
              <td>${toPersianDigits(item.totalPresentSessions)} جلسه</td>
              <td>${formatToman(Math.round((item.hourlyRate * (item.teacher.percentageRate || 100)) / 100), false)}</td>
              <td>${formatToman(item.totalPayable)}</td>
            </tr>
            <tr>
              <td>غیبت‌های موجه</td>
              <td>${toPersianDigits(item.totalExcusedSessions)} جلسه</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>کنسلی‌های اعلامی استاد</td>
              <td>${toPersianDigits(item.totalCancelledSessions)} جلسه</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>غیبت‌های غیرموجه</td>
              <td>${toPersianDigits(item.totalNoShowSessions)} جلسه</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>

        ${
          item.studentBreakdown && item.studentBreakdown.length > 0
            ? `
        <h3 style="font-size: 13px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #334155;">جزئیات هنرجویان (حاضر)</h3>
        <table>
          <thead>
            <tr>
              <th>نام هنرجو</th>
              <th>ساز آموزشی</th>
              <th>تعداد جلسات</th>
            </tr>
          </thead>
          <tbody>
            ${item.studentBreakdown
              .map(
                (st) => `
              <tr>
                <td>${st.studentName}</td>
                <td>${st.instrument}</td>
                <td>${toPersianDigits(st.presentCount)} جلسه</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }

        <div style="display: flex; gap: 15px; margin-top: 20px;">
          <div class="total-box" style="flex: 2;">
            <span style="font-size: 11px; font-weight: normal; color: #15803d; display: block; margin-bottom: 4px;">مبلغ خالص قابل پرداخت به استاد:</span>
            ${formatToman(item.totalPayable)}
          </div>
          <div class="total-box" style="flex: 1; border-color: #bfdbfe; background: #eff6ff; color: #1e3a8a;">
             <span style="font-size: 11px; font-weight: normal; color: #1d4ed8; display: block; margin-bottom: 4px;">سهم آموزشگاه (درآمد خالص):</span>
             ${formatToman(item.totalInstituteRevenue)}
          </div>
        </div>

        <div class="signatures">
          <div>امضای استاد مدرس</div>
          <div>مهر و امضای مدیریت آموزشگاه</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Sub-tabs */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-success-strong" />
            <span>امور مالی و حسابداری</span>
          </h2>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] overflow-x-auto">
          <button
            onClick={() => setActiveFinanceTab("payroll")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFinanceTab === "payroll"
                ? "bg-[var(--bg-secondary)] text-success-strong shadow-xs font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>محاسبه حقوق و کارکرد</span>
          </button>

          <button
            onClick={() => setActiveFinanceTab("tuition")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFinanceTab === "tuition"
                ? "bg-[var(--bg-secondary)] text-accent-strong shadow-xs font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>شهریه هنرجویان</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: TEACHER PAYROLL CALCULATOR ================= */}
      {activeFinanceTab === "payroll" && (
        <div className="space-y-4">
          {/* Query Filter Controls */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Start Date */}
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1 font-semibold">
                    از تاریخ (شمسی):
                  </label>
                  <ShamsiDatePicker
                    value={startDate}
                    onChange={(d) => {
                      const today = getTodayString();
                      setStartDate(d > today ? today : d);
                    }}
                    maxDate={getTodayString()}
                    placeholder="انتخاب تاریخ شروع"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1 font-semibold">
                    تا تاریخ (شمسی):
                  </label>
                  <ShamsiDatePicker
                    value={endDate}
                    onChange={(d) => {
                      const today = getTodayString();
                      setEndDate(d > today ? today : d);
                    }}
                    maxDate={getTodayString()}
                    placeholder="انتخاب تاریخ پایان"
                  />
                </div>
              </div>

              {/* Quick Period Info & Macro Stats */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-danger-soft border border-danger-border text-danger-strong text-xs font-bold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>
                    مانده کل بدهی به اساتید:{" "}
                    {formatToman(totalAcademyDebtToTeachers)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Payroll Detailed Cards Table */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                    <th className="py-2.5 px-3">نام استاد</th>
                    <th className="py-2.5 px-3">بهای پایه جلسه</th>
                    <th className="py-2.5 px-3 text-center">سهم استاد (٪)</th>
                    <th className="py-2.5 px-3 text-center">جلسات حاضر</th>
                    <th className="py-2.5 px-3 text-center">غیبت/کنسلی</th>
                    <th className="py-2.5 px-3">سهم استاد (بازه)</th>
                    <th className="py-2.5 px-3">سهم آموزشگاه</th>
                    <th className="py-2.5 px-3">مانده بدهی کل استاد</th>
                    <th className="py-2.5 px-3 text-center">وضعیت تسویه</th>
                    <th className="py-2.5 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {payrollResults.map((item) => {
                    const teacherSummary = calculateTeacherFinanceSummary(
                      item.teacher,
                      db,
                    );
                    const hasDebt = teacherSummary.netDebt > 0;

                    return (
                      <tr
                        key={item.teacher.id}
                        className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--text-primary)]">
                            {item.teacher.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            {item.teacher.instruments.join("، ")}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-medium">
                          {formatToman(item.hourlyRate)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-accent-strong">
                          {toPersianDigits(item.teacher.percentageRate || 100)}٪
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-success-soft text-success-strong font-bold font-mono">
                            {toPersianDigits(item.totalPresentSessions)} جلسه
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[var(--text-muted)]">
                          {toPersianDigits(
                            item.totalExcusedSessions +
                              item.totalCancelledSessions +
                              item.totalNoShowSessions,
                          )}{" "}
                          جلسه
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-success-strong font-mono text-sm">
                            {formatToman(item.totalPayable)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-accent-strong font-mono text-sm">
                            {formatToman(item.totalInstituteRevenue)}
                          </div>
                        </td>

                        {/* Overall Net Debt Column */}
                        <td className="py-3 px-3 font-mono font-bold">
                          {hasDebt ? (
                            <span className="text-danger-strong">
                              {formatToman(teacherSummary.netDebt)}
                            </span>
                          ) : teacherSummary.netDebt === 0 ? (
                            <span className="text-success-strong font-semibold">
                              ۰ تومان (تسویه)
                            </span>
                          ) : (
                            <span className="text-accent-strong">
                              +{formatToman(Math.abs(teacherSummary.netDebt))}{" "}
                              مساعده
                            </span>
                          )}
                        </td>

                        {/* Settlement Status / Action Column */}
                        <td className="py-3 px-3 text-center">
                          {!hasDebt ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-success-soft text-success-strong border border-success-border inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>تسویه شده ✓</span>
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenSettlement(
                                  item.teacher,
                                  teacherSummary.netDebt,
                                  teacherSummary.netDebt,
                                )
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-success text-on-solid hover:bg-success/90 inline-flex items-center gap-1 shadow-2xs"
                              title="تسویه حساب و صفر کردن بدهی استاد"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>تسویه بدهی</span>
                            </button>
                          )}
                        </td>

                        {/* Operations Column */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProfileTeacherId(item.teacher.id);
                                setIsFinanceProfileModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-success-soft text-[var(--text-secondary)] hover:text-success-strong text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="مشاهده پرونده و پروفایل مالی استاد"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>پروفایل مالی</span>
                            </button>

                            <button
                              onClick={() => handlePrintPayrollSlip(item)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="چاپ فیش کارکرد این بازه"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>چاپ فیش</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: STUDENT TUITION & DEBT TRACKER ================= */}
      {activeFinanceTab === "tuition" && (
        <div className="space-y-4">
          {/* Tuition Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-accent-soft border border-accent-border text-accent-strong flex items-center justify-between">
              <div>
                <div className="text-xs">کل شهریه ثبت‌نامی دوره‌ها</div>
                <div className="text-xl font-bold font-mono mt-1">
                  {formatToman(totalTuition)}
                </div>
              </div>
              <Receipt className="w-8 h-8 text-accent-strong opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-success-soft border border-success-border text-success-strong flex items-center justify-between">
              <div>
                <div className="text-xs">مجموع دریافتی‌های صندوق آموزشگاه</div>
                <div className="text-xl font-bold font-mono mt-1">
                  {formatToman(totalCollected)}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-success-strong opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-danger-soft border border-danger-border text-danger-strong flex items-center justify-between">
              <div>
                <div className="text-xs">مانده بدهی معوق هنرجویان</div>
                <div className="text-xl font-bold font-mono mt-1">
                  {formatToman(totalOutstanding)} (
                  {toPersianDigits(
                    overdueStudents.length + partialStudents.length,
                  )}{" "}
                  نفر)
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-danger-strong opacity-80" />
            </div>
          </div>

          {/* Students Billing Table */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                لیست وضعیت شهریه و بدهی تمام هنرجویان
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                    <th className="py-2.5 px-3">نام هنرجو</th>
                    <th className="py-2.5 px-3">ساز و استاد</th>
                    <th className="py-2.5 px-3">شهریه کل دوره</th>
                    <th className="py-2.5 px-3">مبلغ پرداختی</th>
                    <th className="py-2.5 px-3">مانده بدهی</th>
                    <th className="py-2.5 px-3">وضعیت تسویه</th>
                    <th className="py-2.5 px-3 text-center">ثبت واریز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {(tuitionPageSize === -1
                    ? db.students
                    : db.students.slice(
                        (tuitionPage - 1) * tuitionPageSize,
                        tuitionPage * tuitionPageSize,
                      )
                  ).map((st) => {
                    const debt = st.tuitionFee - st.paidAmount;
                    const teacher = teacherMap.get(st.teacherId);

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--text-primary)]">
                            {st.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">
                            {toPersianDigits(st.phone)}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div>{st.instrument}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            {teacher?.name}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono">
                          {formatToman(st.tuitionFee)}
                        </td>

                        <td className="py-3 px-3 font-mono text-success-strong font-semibold">
                          {formatToman(st.paidAmount)}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold">
                          {debt > 0 ? (
                            <span className="text-danger-strong">
                              {formatToman(debt)}
                            </span>
                          ) : (
                            <span className="text-success-strong">۰ تومان</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                              st.paymentStatus === "paid"
                                ? "bg-success-soft border-success-border text-success-strong"
                                : st.paymentStatus === "partial"
                                  ? "bg-warning-soft border-warning-border text-warning-strong"
                                  : "bg-danger-soft border-danger-border text-danger-strong"
                            }`}
                          >
                            {st.paymentStatus === "paid"
                              ? "تسویه شده"
                              : st.paymentStatus === "partial"
                                ? "پرداخت ناقص"
                                : "معوق / بدهکار"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {debt > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedStudentForPayment(st);
                                setPaymentAmount(debt);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-success text-on-solid font-semibold text-[11px] hover:bg-success/90 transition-colors flex items-center gap-1 mx-auto"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>واریز</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-success-strong font-medium">
                              تسویه
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {db.students.length > 0 && (
              <Pagination
                currentPage={tuitionPage}
                totalItems={db.students.length}
                pageSize={tuitionPageSize}
                onPageChange={setTuitionPage}
                onPageSizeChange={setTuitionPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="هنرجو"
              />
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK PAYMENT ================= */}
      {selectedStudentForPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-success-strong" />
                <span>ثبت دریافت شهریه هنرجو</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPayment(null)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-tertiary)]/80"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="payrollPaymentForm"
                  className="px-4 py-1.5 rounded-xl bg-success text-on-solid font-semibold hover:bg-success/90 text-xs"
                >
                  ثبت تراکنش
                </button>
              </div>
            </div>

            <form
              id="payrollPaymentForm"
              onSubmit={handleRecordPaymentSubmit}
              className="space-y-3.5 text-xs"
            >
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-primary)]">
                  هنرجو: {selectedStudentForPayment.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">
                  شهریه دوره:{" "}
                  {formatToman(selectedStudentForPayment.tuitionFee)}
                </div>
                <div className="text-xs font-bold text-danger-strong mt-1">
                  مانده بدهی:{" "}
                  {formatToman(
                    selectedStudentForPayment.tuitionFee -
                      selectedStudentForPayment.paidAmount,
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  مبلغ دریافتی (تومان):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    paymentAmount === 0
                      ? "0"
                      : new Intl.NumberFormat("fa-IR").format(paymentAmount)
                  }
                  onChange={(e) => {
                    const engDigits = toEnglishDigits(e.target.value);
                    const val = engDigits.replace(/\D/g, "");
                    setPaymentAmount(val ? parseInt(val, 10) : 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  روش پرداخت:
                </label>
                <CustomSelect
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  <option value="pos">کارتخوان آموزشگاه (POS)</option>
                  <option value="card_transfer">کارت به کارت / شبا</option>
                  <option value="cash">نقدی</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  شماره ارجاع یا پیگیری فیش:
                </label>
                <input
                  type="text"
                  value={paymentReceipt}
                  onChange={(e) => setPaymentReceipt(e.target.value)}
                  placeholder="POS-..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
                />
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: TEACHER FINANCE PROFILE ================= */}
      {isFinanceProfileModalOpen && (
        <TeacherFinanceProfile
          isModal={true}
          onClose={() => setIsFinanceProfileModalOpen(false)}
          selectedTeacherId={selectedProfileTeacherId}
          onSelectTeacher={(id) => setSelectedProfileTeacherId(id)}
          onOpenSettlementModal={handleOpenSettlement}
        />
      )}

      {/* ================= MODAL: TEACHER SETTLEMENT ================= */}
      <TeacherSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => {
          setIsSettlementModalOpen(false);
          setSettlementTeacher(null);
        }}
        teacher={settlementTeacher}
        initialAmount={settlementDefaultAmount}
        currentNetDebt={settlementCurrentDebt}
      />
    </div>
  );
};
