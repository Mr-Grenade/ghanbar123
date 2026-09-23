import React, { useState } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  formatFullJalali,
  toPersianDigits,
  toJalaliDateString,
  getTodayString,
  addDays,
} from "../utils/persianDate";
import {
  History,
  Calendar,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Clock,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { printDailyReport } from "../utils/pdfExport";
import { Student, Teacher } from "../types";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { Pagination } from "./Pagination";

export const HistoricalRecall: React.FC = () => {
  const { db, getAttendanceForDate, getNotesForDate } = useAcademy();

  const [recallDate, setRecallDate] = useState<string>(() =>
    addDays(getTodayString(), -1),
  );

  // Pagination for attendance records
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const dayRecords = getAttendanceForDate(recallDate);
  const dayNotes = getNotesForDate(recallDate);

  const teacherMap = new Map<string, Teacher>(
    db.teachers.map((t) => [t.id, t]),
  );
  const studentMap = new Map<string, Student>(
    db.students.map((s) => [s.id, s]),
  );

  const unrecordedCount = dayRecords.filter((r) => r.status === null).length;
  const presentCount = dayRecords.filter((r) => r.status === "present").length;
  const excusedCount = dayRecords.filter((r) => r.status === "excused").length;
  const cancelledCount = dayRecords.filter(
    (r) => r.status === "teacher_cancelled",
  ).length;
  const noShowCount = dayRecords.filter((r) => r.status === "no_show").length;

  const STATUS_MAP: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    present: {
      label: "حاضر (تشکیل شده)",
      bg: "bg-success-soft border border-success-border",
      text: "text-success-strong",
    },
    excused: {
      label: "غیبت موجه (+۱ جبرانی)",
      bg: "bg-warning-soft border border-warning-border",
      text: "text-warning-strong",
    },
    teacher_cancelled: {
      label: "کنسلی توسط استاد (+۱ جبرانی)",
      bg: "bg-info-soft border border-info-border",
      text: "text-info-strong",
    },
    no_show: {
      label: "غیبت غیرموجه",
      bg: "bg-danger-soft border border-danger-border",
      text: "text-danger-strong",
    },
    unrecorded: {
      label: "ثبت‌نشده",
      bg: "bg-[var(--bg-tertiary)] border border-[var(--border-color)]",
      text: "text-[var(--text-muted)]",
    },
  };

  return (
    <div className="space-y-5">
      {/* Header & Date Picker */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <History className="w-5 h-5 text-accent-strong" />
            <span>
              بازخوانی سوابق تاریخی و گزارش روزهای گذشته (Historical Recall)
            </span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            انتخاب هر روز در تقویم برای مشاهده گزارش بازخوانی‌شده حضور و غیاب،
            رویدادها و چاپ PDF
          </p>
        </div>

        {/* Date Navigator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRecallDate(addDays(recallDate, -1))}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
            title="یک روز قبل‌تر"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Persian Shamsi Calendar Picker with maxDate = today */}
          <ShamsiDatePicker
            value={recallDate}
            onChange={(d) => {
              const today = getTodayString();
              setRecallDate(d > today ? today : d);
            }}
            maxDate={getTodayString()}
            placeholder="انتخاب روز در تقویم شمسی"
            buttonClassName="py-2"
          />

          <button
            onClick={() => {
              const nextD = addDays(recallDate, 1);
              if (nextD <= getTodayString()) {
                setRecallDate(nextD);
              }
            }}
            disabled={recallDate >= getTodayString()}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={
              recallDate >= getTodayString()
                ? "امکان مشاهده روزهای آینده وجود ندارد"
                : "یک روز بعدتر"
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRecallDate(getTodayString())}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              recallDate === getTodayString()
                ? "bg-accent text-on-solid shadow-xs"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)]"
            }`}
          >
            امروز
          </button>

          {/* Export PDF */}
          <button
            id="btn-export-recall-pdf"
            onClick={() =>
              printDailyReport(recallDate, dayRecords, dayNotes, db)
            }
            className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>استخراج گزارش PDF رسمی</span>
          </button>
        </div>
      </div>

      {/* Selected Date Summary Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-2 to-accent-soft text-on-solid shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-accent-strong font-medium">
            گزارش روز انتخابی:
          </div>
          <div className="text-lg font-bold mt-0.5">
            {formatFullJalali(recallDate)} (
            {toPersianDigits(toJalaliDateString(recallDate))})
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-on-solid/10 backdrop-blur-xs font-mono">
            {toPersianDigits(dayRecords.length)} کلاس ثبت شده
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-on-solid/10 backdrop-blur-xs font-mono">
            {toPersianDigits(dayNotes.length)} یادداشت و وقایع
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${unrecordedCount > 0 ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3`}>
        {unrecordedCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-between">
            <div>
              <div className="text-xs">در انتظار ثبت</div>
              <div className="text-xl font-bold font-mono mt-0.5">
                {toPersianDigits(unrecordedCount)}
              </div>
            </div>
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
        )}

        <div className="p-3 rounded-xl bg-success-soft border border-success-border text-success-strong flex items-center justify-between">
          <div>
            <div className="text-xs">جلسات تشکیل شده</div>
            <div className="text-xl font-bold font-mono mt-0.5">
              {toPersianDigits(presentCount)}
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-success-strong" />
        </div>

        <div className="p-3 rounded-xl bg-warning-soft border border-warning-border text-warning-strong flex items-center justify-between">
          <div>
            <div className="text-xs">غیبت‌های موجه (+جبرانی)</div>
            <div className="text-xl font-bold font-mono mt-0.5">
              {toPersianDigits(excusedCount)}
            </div>
          </div>
          <AlertCircle className="w-6 h-6 text-warning-strong" />
        </div>

        <div className="p-3 rounded-xl bg-info-soft border border-info-border text-info-strong flex items-center justify-between">
          <div>
            <div className="text-xs">کنسلی‌های استاد (+جبرانی)</div>
            <div className="text-xl font-bold font-mono mt-0.5">
              {toPersianDigits(cancelledCount)}
            </div>
          </div>
          <Award className="w-6 h-6 text-info-strong" />
        </div>

        <div className="p-3 rounded-xl bg-danger-soft border border-danger-border text-danger-strong flex items-center justify-between">
          <div>
            <div className="text-xs">غیبت‌های غیرموجه</div>
            <div className="text-xl font-bold font-mono mt-0.5">
              {toPersianDigits(noShowCount)}
            </div>
          </div>
          <XCircle className="w-6 h-6 text-danger-strong" />
        </div>
      </div>

      {/* Read-Only Attendance Table */}
      <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-strong" />
          <span>
            جدول لاگ حضور و غیاب روز بازخوانی‌شده (غیرقابل ویرایش / فقط خواندنی)
          </span>
        </h3>

        {dayRecords.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            <Calendar className="w-10 h-10 mx-auto text-ink-muted mb-2 opacity-50" />
            <p className="text-xs">
              در این تاریخ کلاسی برگزار نشده یا ثبت نگردیده است.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                  <th className="py-2.5 px-3">ساعت</th>
                  <th className="py-2.5 px-3">نام هنرجو</th>
                  <th className="py-2.5 px-3">ساز</th>
                  <th className="py-2.5 px-3">استاد مدرس</th>
                  <th className="py-2.5 px-3">وضعیت نهایی</th>
                  <th className="py-2.5 px-3">توضیحات و علت ثبت‌شده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {(pageSize === -1
                  ? dayRecords
                  : dayRecords.slice(
                      (currentPage - 1) * pageSize,
                      currentPage * pageSize,
                    )
                ).map((rec) => {
                  const student = studentMap.get(rec.studentId);
                  const teacher = teacherMap.get(rec.teacherId);
                  const stBadge = (rec.status ? STATUS_MAP[rec.status] : null) || STATUS_MAP.unrecorded;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                        {toPersianDigits(rec.time)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                        {student?.name || rec.studentId}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">
                        {rec.instrument}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-primary)]">
                        {teacher?.name || rec.teacherId}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${stBadge.bg} ${stBadge.text}`}
                        >
                          {stBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">
                        {rec.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {dayRecords.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={dayRecords.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="جلسه"
          />
        )}
      </div>

      {/* Read-Only Notes for that day */}
      {dayNotes.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-warning-strong" />
            <span>یادداشت‌ها و وقایع ثبت‌شده در این تاریخ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {dayNotes.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1"
              >
                <div className="font-bold text-[var(--text-primary)]">
                  {n.title}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
