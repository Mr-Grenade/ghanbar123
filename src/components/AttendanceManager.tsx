import React, { useState } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  formatFullJalali,
  toPersianDigits,
  formatToman,
  toJalaliDateString,
  addDays,
  getTodayString,
} from "../utils/persianDate";
import { AttendanceRecord, AttendanceStatus, Student, Teacher } from "../types";
import {
  Clock,
  Users,
  GraduationCap,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Edit3,
  Search,
  ChevronDown,
} from "lucide-react";
import { printDailyReport } from "../utils/pdfExport";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { CustomSelect } from "./ui/custom-select";

interface AttendanceManagerProps {
  onOpenCreditModal?: (student: Student) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  onOpenCreditModal,
}) => {
  const {
    db,
    selectedDate,
    setSelectedDate,
    activeAttendanceView,
    setActiveAttendanceView,
    updateAttendanceStatus,
    createOrUpdateAttendance,
    getAttendanceForDate,
    getNotesForDate,
    showToast,
  } = useAcademy();

  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const records = getAttendanceForDate(selectedDate);
  const teacherMap = new Map<string, Teacher>(
    db.teachers.map((t) => [t.id, t]),
  );
  const studentMap = new Map<string, Student>(
    db.students.map((s) => [s.id, s]),
  );

  // Daily statistics
  const unrecordedCount = records.filter((r) => r.status === null).length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const excusedCount = records.filter((r) => r.status === "excused").length;
  const cancelledCount = records.filter(
    (r) => r.status === "teacher_cancelled",
  ).length;
  const noShowCount = records.filter((r) => r.status === "no_show").length;

  const [expandedTeachers, setExpandedTeachers] = useState<string[]>([]);
  const toggleTeacherExpanded = (teacherId: string) => {
    setExpandedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId],
    );
  };

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const handleNextDay = () => {
    const nextD = addDays(selectedDate, 1);
    if (nextD <= getTodayString()) {
      setSelectedDate(nextD);
    }
  };
  const handleToday = () => setSelectedDate(getTodayString());

  // Group records for Teacher-based View
  const teachersWithRecords = new Map<string, AttendanceRecord[]>();
  records.forEach((r) => {
    if (!teachersWithRecords.has(r.teacherId)) {
      teachersWithRecords.set(r.teacherId, []);
    }
    teachersWithRecords.get(r.teacherId)!.push(r);
  });

  // Filtered list for search or teacher filter
  const filteredHourRecords = records.filter((r) => {
    if (filterTeacher !== "all" && r.teacherId !== filterTeacher) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Date Navigation Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Controls: Previous Day Button, Shamsi Date Picker, Next Day Button, Today Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-prev-day"
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
            title="روز قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Shamsi Calendar Picker with maxDate = today */}
          <ShamsiDatePicker
            value={selectedDate}
            onChange={(d) => {
              const today = getTodayString();
              setSelectedDate(d > today ? today : d);
            }}
            maxDate={getTodayString()}
            placeholder="انتخاب روز در تقویم شمسی"
            buttonClassName="py-2"
          />

          <button
            id="btn-next-day"
            onClick={handleNextDay}
            disabled={selectedDate >= getTodayString()}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={
              selectedDate >= getTodayString()
                ? "امکان انتخاب روزهای آینده وجود ندارد"
                : "روز بعد"
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="btn-go-today"
            onClick={handleToday}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selectedDate === getTodayString()
                ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            امروز
          </button>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-3">
          {/* Synchronized View Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <button
              id="tab-view-hour"
              onClick={() => setActiveAttendanceView("hour")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeAttendanceView === "hour"
                  ? "bg-[var(--bg-secondary)] text-accent-strong shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>نمای ساعتی</span>
            </button>
            <button
              id="tab-view-teacher"
              onClick={() => setActiveAttendanceView("teacher")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeAttendanceView === "teacher"
                  ? "bg-[var(--bg-secondary)] text-accent-strong shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>نمای دسته‌بندی استاد</span>
            </button>
          </div>

          {/* Print / PDF Daily Report */}
          <button
            id="btn-print-daily"
            onClick={() =>
              printDailyReport(
                selectedDate,
                records,
                getNotesForDate(selectedDate),
                db,
              )
            }
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
            title="چاپ و استخراج PDF گزارش روزانه"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">چاپ گزارش روز</span>
          </button>
        </div>
      </div>

      {/* Daily Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className={`p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] ${unrecordedCount > 0 ? "border-l-amber-500" : "border-l-[var(--border-color)]"} flex items-center justify-between`}>
          <div>
            <div className="text-xs text-[var(--text-secondary)]">
              در انتظار ثبت
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(unrecordedCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
            <Clock className={`w-5 h-5 ${unrecordedCount > 0 ? "text-amber-500" : "text-[var(--text-muted)]"}`} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--success)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">
              تشکیل شده (حاضر)
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(presentCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--success-soft)]">
            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--warning)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">
              غیبت موجه
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(excusedCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--warning-soft)]">
            <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--danger)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">
              غیبت غیرموجه
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(noShowCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--danger-soft)]">
            <XCircle className="w-5 h-5 text-[var(--danger)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--info)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">
              کنسلی استاد
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(cancelledCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--info-soft)]">
            <Award className="w-5 h-5 text-[var(--info)]" />
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: HOUR-BASED TIMELINE VIEW ================= */}
      {activeAttendanceView === "hour" && (
        <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-strong" />
              <span>لیست هنرجویان </span>
            </h3>
            {/* Teacher Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <CustomSelect
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none text-right"
              >
                <option value="all">همه اساتید</option>
                {db.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </CustomSelect>
            </div>
          </div>

          {filteredHourRecords.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <Clock className="w-12 h-12 mx-auto text-ink-muted mb-3 opacity-60" />
              <p className="text-sm">
                کلاسی برای ساعت‌های انتخابی در این تاریخ ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                    <th className="py-2.5 px-3 text-center w-24">ساعت</th>
                    <th className="py-2.5 px-3 text-right">نام هنرجو</th>
                    <th className="py-2.5 px-3 text-right">ساز</th>
                    <th className="py-2.5 px-3 text-right">نام استاد </th>
                    <th className="py-2.5 px-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredHourRecords.map((rec) => {
                    const student = studentMap.get(rec.studentId);
                    const teacher = teacherMap.get(rec.teacherId);

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                      >
                        {/* Time */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-[var(--bg-tertiary)] font-mono font-bold text-[var(--text-primary)]">
                            {toPersianDigits(rec.time)}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-primary)]">
                              {student?.name || rec.studentId}
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            جلسه{" "}
                            {toPersianDigits(student?.attendedSessions || 0)} از{" "}
                            {toPersianDigits(student?.targetSessions || 10)}
                          </div>
                        </td>

                        {/* Instrument */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-[var(--text-secondary)]">
                            {rec.instrument}
                          </span>
                        </td>

                        {/* Teacher */}
                        <td className="py-3 px-3">
                          <span className="text-[var(--text-primary)] font-medium">
                            {teacher?.name || rec.teacherId}
                          </span>
                        </td>

                        {/* 4 Status Badges */}
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  rec.status === "present" ? null : "present",
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rec.status === "present"
                                  ? "bg-[var(--success)] text-white shadow-xs ring-2 ring-[var(--success)]/30"
                                  : "bg-transparent border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success-soft)]"
                              }`}
                              title={
                                rec.status === "present"
                                  ? "کلیک برای لغو وضعیت و بازگشت به حالت اولیه (ثبت‌نشده)"
                                  : "ثبت حضور هنرجو در جلسه"
                              }
                            >
                              حاضر
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  rec.status === "excused" ? null : "excused",
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rec.status === "excused"
                                  ? "bg-[var(--warning)] text-white shadow-xs ring-2 ring-[var(--warning)]/30"
                                  : "bg-transparent border border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning-soft)]"
                              }`}
                              title={
                                rec.status === "excused"
                                  ? "کلیک برای لغو وضعیت و بازگشت به حالت اولیه (ثبت‌نشده)"
                                  : "غیبت موجه با هماهنگی (+۱ اعتبار جبرانی به هنرجو اضافه می‌شود)"
                              }
                            >
                              موجه (+۱)
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  rec.status === "no_show" ? null : "no_show",
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rec.status === "no_show"
                                  ? "bg-[var(--danger)] text-white shadow-xs ring-2 ring-[var(--danger)]/30"
                                  : "bg-transparent border border-[var(--color1)] text-[var(--color1)] hover:bg-[var(--danger-soft)]"
                              }`}
                              title={
                                rec.status === "no_show"
                                  ? "کلیک برای لغو وضعیت و بازگشت به حالت اولیه (ثبت‌نشده)"
                                  : "ثبت غیبت غیرموجه هنرجو"
                              }
                            >
                              غیرموجه
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  rec.status === "teacher_cancelled"
                                    ? null
                                    : "teacher_cancelled",
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rec.status === "teacher_cancelled"
                                  ? "bg-[var(--info)] text-white shadow-xs ring-2 ring-[var(--info)]/30"
                                  : "bg-transparent border border-[var(--info)] text-[var(--info)] hover:bg-[var(--info-soft)]"
                              }`}
                              title={
                                rec.status === "teacher_cancelled"
                                  ? "کلیک برای لغو وضعیت و بازگشت به حالت اولیه (ثبت‌نشده)"
                                  : "کنسلی جلسه توسط استاد (+۱ اعتبار جبرانی به هنرجو اضافه می‌شود)"
                              }
                            >
                              کنسلی (+۱)
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: TEACHER-BASED VIEW ================= */}
      {activeAttendanceView === "teacher" && (
        <div className="space-y-4">
          {Array.from(teachersWithRecords).map(
            ([teacherId, teacherRecords]) => {
              const teacher = db.teachers.find((t) => t.id === teacherId);

              const tPresent = teacherRecords.filter(
                (r) => r.status === "present",
              ).length;
              const tExcused = teacherRecords.filter(
                (r) => r.status === "excused",
              ).length;
              const tNoShow = teacherRecords.filter(
                (r) => r.status === "no_show",
              ).length;
              const tCancelled = teacherRecords.filter(
                (r) => r.status === "teacher_cancelled",
              ).length;
              const tUnrecorded = teacherRecords.filter(
                (r) => r.status === null,
              ).length;

              return (
                <div
                  key={teacherId}
                  className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-xs"
                >
                  <div
                    className="p-4 bg-[var(--bg-tertiary)] flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                    onClick={() => toggleTeacherExpanded(teacherId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">
                          {teacher?.name || teacherId}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex flex-wrap items-center gap-x-2">
                          <span>تشکیل شده: {toPersianDigits(tPresent)}</span>
                          <span>|</span>
                          <span>غیبت: {toPersianDigits(tExcused + tNoShow)}</span>
                          <span>|</span>
                          <span>کنسلی: {toPersianDigits(tCancelled)}</span>
                          {tUnrecorded > 0 && (
                            <>
                              <span>|</span>
                              <span className="text-amber-500 font-semibold">
                                در انتظار ثبت: {toPersianDigits(tUnrecorded)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expandedTeachers.includes(teacherId) ? "rotate-180" : ""}`}
                    />
                  </div>

                  {expandedTeachers.includes(teacherId) && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {teacherRecords.map((rec) => {
                        const student = db.students.find(
                          (s) => s.id === rec.studentId,
                        );
                        return (
                          <div
                            key={rec.id}
                            className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[var(--text-primary)]">
                                    {student?.name || rec.studentId}
                                  </span>
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                  {rec.time} • {rec.instrument}
                                </div>
                              </div>
                              {(student?.makeupCredits || 0) > 0 && (
                                <span className="px-2 py-0.5 rounded-lg bg-warning-soft text-warning-strong text-[10px] font-bold border border-warning-border">
                                  {toPersianDigits(student?.makeupCredits || 0)}{" "}
                                  جبرانی
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(
                                    rec.id,
                                    rec.status === "present" ? null : "present",
                                  )
                                }
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  rec.status === "present"
                                    ? "bg-[var(--success)] text-white shadow-xs ring-2 ring-[var(--success)]/30"
                                    : "bg-transparent border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success-soft)]"
                                }`}
                                title={
                                  rec.status === "present"
                                    ? "کلیک مجدد برای لغو و بازگشت به حالت ثبت‌نشده"
                                    : "حاضر"
                                }
                              >
                                حاضر
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(
                                    rec.id,
                                    rec.status === "excused" ? null : "excused",
                                  )
                                }
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  rec.status === "excused"
                                    ? "bg-[var(--warning)] text-white shadow-xs ring-2 ring-[var(--warning)]/30"
                                    : "bg-transparent border border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning-soft)]"
                                }`}
                                title={
                                  rec.status === "excused"
                                    ? "کلیک مجدد برای لغو و بازگشت به حالت ثبت‌نشده"
                                    : "غیبت موجه (+۱ جبرانی)"
                                }
                              >
                                موجه
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(
                                    rec.id,
                                    rec.status === "no_show" ? null : "no_show",
                                  )
                                }
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  rec.status === "no_show"
                                    ? "bg-[var(--danger)] text-white shadow-xs ring-2 ring-[var(--danger)]/30"
                                    : "bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                                }`}
                                title={
                                  rec.status === "no_show"
                                    ? "کلیک مجدد برای لغو و بازگشت به حالت ثبت‌نشده"
                                    : "غیرموجه"
                                }
                              >
                                غیرموجه
                              </button>
                              <button
                                onClick={() =>
                                  updateAttendanceStatus(
                                    rec.id,
                                    rec.status === "teacher_cancelled"
                                      ? null
                                      : "teacher_cancelled",
                                  )
                                }
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  rec.status === "teacher_cancelled"
                                    ? "bg-[var(--info)] text-white shadow-xs ring-2 ring-[var(--info)]/30"
                                    : "bg-transparent border border-[var(--info)] text-[var(--info)] hover:bg-[var(--info-soft)]"
                                }`}
                                title={
                                  rec.status === "teacher_cancelled"
                                    ? "کلیک مجدد برای لغو و بازگشت به حالت ثبت‌نشده"
                                    : "کنسلی استاد (+۱ جبرانی)"
                                }
                              >
                                کنسلی
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};
