import React, { useState, useMemo } from "react";
import { useAcademy } from "../context/AcademyContext";
import { Teacher } from "../types";
import {
  toPersianDigits,
  toEnglishDigits,
  formatToman,
  toJalaliDateString,
  formatFullJalali,
  getTodayString,
} from "../utils/persianDate";
import {
  calculateTeacherFinanceSummary,
  printTeacherPayoutReceipt,
  printTeacherFullStatement,
  TeacherFinancialSummary,
} from "../utils/financeUtils";
import { CustomSelect } from "./ui/custom-select";
import {
  Wallet,
  Coins,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  Trash2,
  Plus,
  Search,
  Receipt,
  GraduationCap,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  X,
} from "lucide-react";

interface TeacherFinanceProfileProps {
  selectedTeacherId?: string;
  onSelectTeacher?: (teacherId: string) => void;
  onOpenSettlementModal: (
    teacher: Teacher,
    amount?: number,
    currentDebt?: number,
  ) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const TeacherFinanceProfile: React.FC<TeacherFinanceProfileProps> = ({
  selectedTeacherId,
  onSelectTeacher,
  onOpenSettlementModal,
  isModal = false,
  onClose,
}) => {
  const { db, deleteTransaction, showToast } = useAcademy();

  // Internal teacher selection state if not passed from parent
  const [internalTeacherId, setInternalTeacherId] = useState<string>(
    () => selectedTeacherId || db.teachers[0]?.id || "",
  );

  const activeTeacherId = selectedTeacherId || internalTeacherId;
  const currentTeacher =
    db.teachers.find((t) => t.id === activeTeacherId) || db.teachers[0];

  const handleTeacherChange = (newId: string) => {
    setInternalTeacherId(newId);
    if (onSelectTeacher) {
      onSelectTeacher(newId);
    }
  };

  // Profile View Sub-tab: 'ledger' (payments) vs 'sessions' (work breakdown)
  const [activeProfileTab, setActiveProfileTab] = useState<
    "ledger" | "sessions"
  >("ledger");
  const [sessionSearch, setSessionSearch] = useState<string>("");

  // Calculate summary for active teacher
  const summary: TeacherFinancialSummary | null = useMemo(() => {
    if (!currentTeacher) return null;
    return calculateTeacherFinanceSummary(currentTeacher, db);
  }, [currentTeacher, db]);

  // Overall academy metrics across all teachers
  const allTeachersSummaries = useMemo(() => {
    return db.teachers.map((t) => calculateTeacherFinanceSummary(t, db));
  }, [db]);

  const totalAcademyDebtToTeachers = useMemo(() => {
    return allTeachersSummaries.reduce(
      (sum, s) => (s.netDebt > 0 ? sum + s.netDebt : sum),
      0,
    );
  }, [allTeachersSummaries]);

  const totalAllTimePayouts = useMemo(() => {
    return allTeachersSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  }, [allTeachersSummaries]);

  const studentsMap = useMemo(() => {
    return new Map(db.students.map((s) => [s.id, s]));
  }, [db.students]);

  // Filtered session records for active teacher (supporting Jalali, Gregorian, Persian/English digits, month names, and student/instrument)
  const filteredSessions = useMemo(() => {
    if (!summary?.presentRecords) return [];
    return summary.presentRecords
      .filter((rec) => {
        if (!sessionSearch.trim()) return true;
        const rawQuery = sessionSearch.trim().toLowerCase();
        const engQuery = toEnglishDigits(rawQuery);
        const faQuery = toPersianDigits(engQuery);
        const queryNormalizedSlash = engQuery.replace(/-/g, "/");
        const queryNormalizedDash = engQuery.replace(/\//g, "-");

        const st = studentsMap.get(rec.studentId);
        const stName = (st?.name || "").toLowerCase();
        const inst = (rec.instrument || "").toLowerCase();

        // Gregorian dates
        const gDate = rec.date.toLowerCase();
        const gDateSlash = gDate.replace(/-/g, "/");

        // Jalali dates
        const jDate = toJalaliDateString(rec.date);
        const jDateDash = jDate.replace(/\//g, "-");
        const jDateFa = toPersianDigits(jDate);
        const jDateFaDash = toPersianDigits(jDateDash);
        const fullJalali = formatFullJalali(rec.date).toLowerCase();

        // Time
        const timeStr = rec.time || "";
        const timeFa = toPersianDigits(timeStr);

        return (
          stName.includes(rawQuery) ||
          stName.includes(engQuery) ||
          inst.includes(rawQuery) ||
          inst.includes(engQuery) ||
          gDate.includes(engQuery) ||
          gDate.includes(queryNormalizedDash) ||
          gDateSlash.includes(queryNormalizedSlash) ||
          jDate.includes(engQuery) ||
          jDate.includes(queryNormalizedSlash) ||
          jDateDash.includes(queryNormalizedDash) ||
          jDateFa.includes(rawQuery) ||
          jDateFa.includes(faQuery) ||
          jDateFaDash.includes(rawQuery) ||
          jDateFaDash.includes(faQuery) ||
          fullJalali.includes(rawQuery) ||
          fullJalali.includes(engQuery) ||
          timeStr.includes(engQuery) ||
          timeFa.includes(rawQuery) ||
          timeFa.includes(faQuery)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [summary?.presentRecords, sessionSearch, studentsMap]);

  if (!currentTeacher || !summary) {
    return (
      <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
        <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          استادی برای نمایش پرونده مالی یافت نشد.
        </p>
      </div>
    );
  }

  const handleDeleteTransaction = (txId: string) => {
    if (
      window.confirm(
        "آیا از حذف این سند تسویه حساب اطمینان دارید؟ با حذف سند، مانده بدهی استاد مجدداً افزایش خواهد یافت.",
      )
    ) {
      deleteTransaction(txId);
      showToast("سند تسویه حساب حذف شد و مانده حساب به‌روز گردید.", "info");
    }
  };

  const detailCard = (
    <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
        {/* Teacher Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[var(--border-color)] gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {currentTeacher.name}
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  currentTeacher.status === "active"
                    ? "bg-success-soft text-success-strong"
                    : "bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)]"
                }`}
              >
                {currentTeacher.status === "active" ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-3">
              <span>
                سازهای تخصصی:{" "}
                <strong className="text-[var(--text-primary)]">
                  {(currentTeacher.instruments || []).join("، ") || "عمومی"}
                </strong>
              </span>
              <span>•</span>
              <span>
                تلفن:{" "}
                <strong className="font-mono text-[var(--text-primary)]">
                  {toPersianDigits(currentTeacher.phone)}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[var(--bg-tertiary)]/70 p-2.5 rounded-xl border border-[var(--border-color)] text-[11px]">
            <div>
              <span className="text-[var(--text-muted)] block">
                بهای پایه جلسه:
              </span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {formatToman(summary.sessionPrice)}
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-color)]"></div>
            <div>
              <span className="text-[var(--text-muted)] block">سهم استاد:</span>
              <span className="font-mono font-bold text-accent-strong">
                {toPersianDigits(summary.percentage)}٪
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-color)]"></div>
            <div>
              <span className="text-[var(--text-muted)] block">
                دستمزد هر جلسه:
              </span>
              <span className="font-mono font-bold text-success-strong">
                {formatToman(summary.sessionWage)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Essential Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Gross Earned */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">
              کل کارکرد تا کنون (بستانکاری استاد)
            </div>
            <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-1">
              {formatToman(summary.totalEarned)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">
              حاصل از{" "}
              <span className="font-bold text-[var(--text-primary)]">
                {toPersianDigits(summary.totalPresentSessions)}
              </span>{" "}
              جلسه تشکیل شده
            </div>
          </div>

          {/* Total Paid Out */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">
              کل مبالغ پرداختی و تسویه‌شده
            </div>
            <div className="text-base font-bold font-mono text-success-strong mt-1">
              {formatToman(summary.totalPaid)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">
              طی{" "}
              <span className="font-bold text-success-strong">
                {toPersianDigits(summary.payoutTransactions.length)}
              </span>{" "}
              سند تسویه مالی
            </div>
          </div>

          {/* Net Debt (Outstanding Balance) */}
          <div
            className={`p-3.5 rounded-xl border ${
              summary.netDebt > 0
                ? "bg-danger-soft/70 border-danger-border text-danger-strong"
                : summary.netDebt === 0
                  ? "bg-success-soft/70 border-success-border text-success-strong"
                  : "bg-accent-soft/70 border-accent-border text-accent-strong"
            }`}
          >
            <div className="text-[11px] font-semibold opacity-90">
              مانده بدهی آموزشگاه به استاد
            </div>
            <div className="text-base font-bold font-mono mt-1">
              {summary.netDebt === 0
                ? "۰ تومان (تسویه کامل)"
                : formatToman(Math.abs(summary.netDebt))}
            </div>
            <div className="text-[10px] mt-1 font-semibold">
              {summary.netDebt > 0
                ? "بدهکار به استاد"
                : summary.netDebt === 0
                  ? "حساب کاملاً تراز و صفر است ✓"
                  : "بستانکاری آموزشگاه (مساعده بیش از کارکرد)"}
            </div>
          </div>

          {/* Last Payout Info */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)]">
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">
              آخرین تسویه حساب ثبت‌شده
            </div>
            <div className="text-sm font-bold font-mono text-[var(--text-primary)] mt-1">
              {summary.lastPayout
                ? formatToman(summary.lastPayout.amount)
                : "بدون پرداخت"}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
              {summary.lastPayout
                ? `در تاریخ ${toJalaliDateString(summary.lastPayout.date)}`
                : "تاکنون تسویه‌ای ثبت نشده است"}
            </div>
          </div>
        </div>

        {/* Profile Tabs: Payments Ledger vs Held Sessions */}
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveProfileTab("ledger")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === "ledger"
                    ? "bg-success-soft text-success-strong border border-success-border"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>دفتر معین و تاریخچه پرداخت‌ها</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--bg-secondary)]">
                  {toPersianDigits(summary.payoutTransactions.length)}
                </span>
              </button>

              <button
                onClick={() => setActiveProfileTab("sessions")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === "sessions"
                    ? "bg-accent-soft text-accent-strong border border-accent-border"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ریز کارکرد و جلسات تشکیل شده</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[var(--bg-secondary)]">
                  {toPersianDigits(summary.totalPresentSessions)}
                </span>
              </button>
            </div>

            {activeProfileTab === "sessions" && (
              <div className="w-56 relative text-xs">
                <input
                  type="text"
                  placeholder="جستجوی تاریخ، هنرجو، ساز..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full pr-7 pl-7 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[11px]"
                />
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2 top-2.5 pointer-events-none" />
                {sessionSearch && (
                  <button
                    type="button"
                    onClick={() => setSessionSearch("")}
                    className="absolute left-2 top-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5"
                    title="پاک کردن جستجو"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: Payments & Settlements Ledger */}
          {activeProfileTab === "ledger" && (
            <div className="mt-3 overflow-x-auto">
              {summary.payoutTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
                  <Coins className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  هنوز هیچ سند تسویه حسابی برای این استاد ثبت نشده است. برای ثبت
                  پرداخت، از دکمه «ثبت پرداخت» استفاده نمایید.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                      <th className="py-2.5 px-3 text-center">ردیف</th>
                      <th className="py-2.5 px-3">تاریخ پرداخت</th>
                      <th className="py-2.5 px-3">مبلغ پرداختی</th>
                      <th className="py-2.5 px-3">روش پرداخت</th>
                      <th className="py-2.5 px-3">شماره پیگیری / سند</th>
                      <th className="py-2.5 px-3">شرح پرداخت</th>
                      <th className="py-2.5 px-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {summary.payoutTransactions.map((tx, idx) => {
                      const methodLabels: Record<string, string> = {
                        card_transfer: "کارت به کارت / شبا",
                        cash: "نقدی",
                        pos: "کارتخوان",
                        cheque: "چک",
                      };

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-[var(--text-muted)]">
                            {toPersianDigits(idx + 1)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-[var(--text-primary)]">
                            {toJalaliDateString(tx.date)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-success-strong">
                            {formatToman(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[11px]">
                              {methodLabels[tx.paymentMethod] || tx.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                            {tx.receiptNumber ? (
                              toPersianDigits(tx.receiptNumber)
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[var(--text-secondary)] max-w-xs truncate">
                            {tx.description || "تسویه حساب"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  printTeacherPayoutReceipt(
                                    currentTeacher,
                                    tx,
                                    db,
                                  )
                                }
                                title="چاپ رسید رسمی پرداخت"
                                className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-accent-soft text-[var(--text-secondary)] hover:text-accent-strong transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                title="حذف این سند پرداخت"
                                className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-danger-soft text-[var(--text-secondary)] hover:text-danger-strong transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: Held Sessions Breakdown */}
          {activeProfileTab === "sessions" && (
            <div className="mt-3 overflow-x-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
                  کلاسی منطبق با جستجو یافت نشد.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                      <th className="py-2.5 px-3 text-center">ردیف</th>
                      <th className="py-2.5 px-3">تاریخ جلسه</th>
                      <th className="py-2.5 px-3">ساعت</th>
                      <th className="py-2.5 px-3">هنرجو</th>
                      <th className="py-2.5 px-3">ساز</th>
                      <th className="py-2.5 px-3">نوع جلسه</th>
                      <th className="py-2.5 px-3 text-left">
                        دستمزد استاد از این جلسه
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredSessions.map((rec, idx) => {
                      const st = studentsMap.get(rec.studentId);
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-[var(--text-muted)]">
                            {toPersianDigits(idx + 1)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {toJalaliDateString(rec.date)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                            {toPersianDigits(rec.time)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                            {st?.name || rec.studentId}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            {rec.instrument}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                rec.isExtraClass
                                  ? "bg-accent-soft text-accent-strong"
                                  : "bg-success-soft text-success-strong"
                              }`}
                            >
                              {rec.isExtraClass ? "فوق‌العاده" : "عادی (ترم)"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-left font-mono font-bold text-success-strong">
                            {formatToman(summary.sessionWage)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 font-bold">
                      <td colSpan={6} className="py-2.5 px-3 text-right">
                        مجموع کارکرد جلسات نمایش‌داده‌شده (
                        {toPersianDigits(filteredSessions.length)} جلسه):
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono text-success-strong">
                        {formatToman(
                          filteredSessions.length * summary.sessionWage,
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
  );

  // When used as a neat modal popup window
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <div className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
          {/* Modal Header */}
          <div className="px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-success-soft text-success-strong flex items-center justify-center border border-success-border">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    پرونده مالی استاد: {currentTeacher.name}
                  </h3>
                  {summary.netDebt > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-danger-soft text-danger-strong border border-danger-border">
                      مانده بدهی: {formatToman(summary.netDebt)}
                    </span>
                  ) : summary.netDebt === 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-success-soft text-success-strong border border-success-border">
                      تسویه کامل شده ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-soft text-accent-strong border border-accent-border">
                      مساعده: +{formatToman(Math.abs(summary.netDebt))}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                  <span>سازها: {(currentTeacher.instruments || []).join("، ") || "عمومی"}</span>
                  <span>•</span>
                  <span>سهم استاد: {toPersianDigits(currentTeacher.percentageRate || 100)}٪</span>
                  <span>•</span>
                  <span>پایه جلسه: {formatToman(currentTeacher.hourlyRate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="بستن پنجره"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">بستن</span>
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Quick action buttons bar inside modal */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() =>
                    onOpenSettlementModal(
                      currentTeacher,
                      summary.netDebt > 0 ? summary.netDebt : 0,
                      summary.netDebt,
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-success text-on-solid hover:bg-success/90 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت پرداخت</span>
                </button>

                <button
                  onClick={() => printTeacherFullStatement(summary, db)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[var(--border-color)]"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ صورت‌حساب کامل</span>
                </button>
              </div>
            </div>

            {detailCard}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Academy-wide Macro Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-danger-soft border border-danger-border text-danger-strong flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold opacity-90">
              کل مانده بدهی آموزشگاه به تمام اساتید
            </div>
            <div className="text-lg font-bold font-mono mt-1">
              {formatToman(totalAcademyDebtToTeachers)}
            </div>
          </div>
          <Wallet className="w-8 h-8 text-danger-strong opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-success-soft border border-success-border text-success-strong flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold opacity-90">
              مجموع تسویه‌ها و پرداختی‌ها به اساتید
            </div>
            <div className="text-lg font-bold font-mono mt-1">
              {formatToman(totalAllTimePayouts)}
            </div>
          </div>
          <Coins className="w-8 h-8 text-success-strong opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-accent-soft border border-accent-border text-accent-strong flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold opacity-90">
              تعداد کل اساتید ثبت‌شده
            </div>
            <div className="text-lg font-bold font-mono mt-1">
              {toPersianDigits(db.teachers.length)} نفر مدرس
            </div>
          </div>
          <GraduationCap className="w-8 h-8 text-accent-strong opacity-80" />
        </div>
      </div>

      {/* Teacher Profile Selection Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-[var(--text-primary)] shrink-0 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-accent-strong" />
            <span>انتخاب استاد جهت مشاهده پرونده مالی:</span>
          </label>
          <div className="w-full max-w-sm">
            <CustomSelect
              value={currentTeacher.id}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold"
            >
              {allTeachersSummaries.map((s) => (
                <option key={s.teacher.id} value={s.teacher.id}>
                  {s.teacher.name} — (
                  {s.netDebt > 0
                    ? `بدهی: ${formatToman(s.netDebt)}`
                    : s.netDebt === 0
                      ? "تسویه کامل ✓"
                      : `مساعده مازاد: ${formatToman(Math.abs(s.netDebt))}`}
                  )
                </option>
              ))}
            </CustomSelect>
          </div>
        </div>

        {/* Action Buttons for current teacher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              onOpenSettlementModal(
                currentTeacher,
                summary.netDebt > 0 ? summary.netDebt : 0,
                summary.netDebt,
              )
            }
            className="px-4 py-1.5 rounded-xl bg-success text-on-solid hover:bg-success/90 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت پرداخت</span>
          </button>

          <button
            onClick={() => printTeacherFullStatement(summary, db)}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold flex items-center gap-1 transition-colors border border-[var(--border-color)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ صورت‌حساب</span>
          </button>
        </div>
      </div>

      {detailCard}
    </div>
  );
};
