import React from "react";
import { Student, ClassSlot } from "../types";
import { parseTimeToMinutes, formatMinutesToTime } from "../utils/schedule";
import { toPersianDigits } from "../utils/persianDate";

interface TeacherWeeklyCalendarProps {
  teacherId?: string;
  allStudents?: Student[];
  currentStudentId?: string; // Exclude from occupied slots
  proposedSlots?: ClassSlot[];
  extraClasses?: {
    day: string;
    time: string;
    studentName: string;
    durationMinutes?: number;
  }[];
  availableDays?: string[];
  teacherName?: string;
  showInstrument?: boolean;
}

const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export const TeacherWeeklyCalendar: React.FC<TeacherWeeklyCalendarProps> = ({
  teacherId,
  allStudents = [],
  currentStudentId,
  proposedSlots = [],
  extraClasses = [],
  availableDays,
  teacherName,
  showInstrument = true,
}) => {
  // Gather all occupied slots
  const occupiedSlots: {
    day: string;
    start: number;
    end: number;
    studentName: string;
    instrument?: string;
    isExtra?: boolean;
  }[] = [];

  if (teacherId && allStudents.length > 0) {
    allStudents.forEach((st) => {
      if (st.teacherId !== teacherId) return;
      if (currentStudentId && st.id === currentStudentId) return;
      if (st.status === "inactive") return;

      const slots =
        st.weeklySlots && st.weeklySlots.length > 0
          ? st.weeklySlots
          : [{ day: st.classDay, time: st.classTime }];

      slots.forEach((slot) => {
        if (!slot.day || !slot.time) return;
        const start = parseTimeToMinutes(slot.time);
        const end =
          start + (slot.durationMinutes || st.classDurationMinutes || 30);
        occupiedSlots.push({
          day: slot.day,
          start,
          end,
          studentName: st.name,
          instrument: st.instrument,
          isExtra: false,
        });
      });
    });
  }

  extraClasses.forEach((ec) => {
    if (!ec.day || !ec.time) return;
    const start = parseTimeToMinutes(ec.time);
    const end = start + (ec.durationMinutes || 30);
    occupiedSlots.push({
      day: ec.day,
      start,
      end,
      studentName: ec.studentName + " (جبرانی)",
      isExtra: true,
    });
  });

  const proposed = proposedSlots.map((slot) => {
    const start = parseTimeToMinutes(slot.time);
    const end = start + (slot.durationMinutes || 30);
    return { day: slot.day, start, end };
  });

  const minTime = 8 * 60; // 8:00 AM
  const maxTime = 22 * 60; // 10:00 PM
  const totalMinutes = maxTime - minTime;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 shadow-2xs overflow-hidden select-none">
      {/* Calendar Header with title and summary */}
      <div className="flex items-center justify-between mb-2.5 shrink-0 gap-2">
        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-strong shrink-0"></span>
          <span className="truncate">
            {teacherName ? `برنامه هفتگی: ${teacherName}` : "تقویم هفتگی استاد"}
          </span>
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] shrink-0">
          {occupiedSlots.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-accent-soft text-accent-strong font-bold font-mono">
              {toPersianDigits(occupiedSlots.length)} کلاس هفتگی
            </span>
          )}
          {availableDays && availableDays.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-medium">
              {toPersianDigits(availableDays.length)} روز حضور
            </span>
          )}
        </div>
      </div>

      {/* Grid container: completely non-scrollable */}
      <div className="w-full flex gap-1 sm:gap-1.5 flex-1 min-h-0 overflow-hidden">
        {/* Time column */}
        <div className="relative w-8 sm:w-10 shrink-0 border-l border-[var(--border-color)] flex flex-col">
          <div className="text-center text-[10px] font-bold text-transparent mb-1.5 border-b border-transparent pb-1.5 shrink-0">
            زمان
          </div>
          <div className="relative flex-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-[8px] sm:text-[9px] text-[var(--text-muted)] text-left w-full pl-0.5 sm:pl-1 -translate-y-1/2 font-mono"
                style={{ top: `${((i * 60) / totalMinutes) * 100}%` }}
              >
                {toPersianDigits(i + 8)}:۰۰
              </div>
            ))}
          </div>
        </div>

        {/* Days columns */}
        {WEEKDAYS.map((day) => {
          const isDayAvailable =
            !availableDays ||
            availableDays.length === 0 ||
            availableDays.includes(day);
          const daySlots = occupiedSlots.filter((s) => s.day === day);
          const dayProposed = proposed.filter((s) => s.day === day);

          return (
            <div key={day} className="flex-1 min-w-0 flex flex-col relative">
              {/* Day title badge */}
              <div
                className={`text-center text-[10px] sm:text-[11px] font-bold mb-1.5 border-b pb-1.5 shrink-0 truncate transition-colors ${
                  isDayAvailable
                    ? "text-[var(--text-primary)] border-[var(--border-color)]"
                    : "text-[var(--text-muted)] opacity-50 border-[var(--border-color)]/50"
                }`}
                title={isDayAvailable ? `${day} (روز حضور)` : `${day} (عدم حضور)`}
              >
                {day}
              </div>

              {/* Day column canvas */}
              <div
                className={`relative flex-1 rounded-lg border transition-all overflow-hidden ${
                  isDayAvailable
                    ? "bg-[var(--bg-tertiary)]/40 border-[var(--border-color)]"
                    : "bg-[var(--bg-tertiary)]/15 border-[var(--border-color)]/40 opacity-70"
                }`}
              >
                {/* Horizontal hour lines */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-[var(--border-color)]/40"
                    style={{ top: `${(((i + 1) * 60) / totalMinutes) * 100}%` }}
                  ></div>
                ))}

                {/* Day non-availability watermark label */}
                {!isDayAvailable && daySlots.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-[var(--text-muted)]/60 font-medium rotate-90 sm:rotate-0">
                      عدم حضور
                    </span>
                  </div>
                )}

                {/* Occupied blocks */}
                {daySlots.map((slot, i) => {
                  const top = ((slot.start - minTime) / totalMinutes) * 100;
                  const height = ((slot.end - slot.start) / totalMinutes) * 100;
                  if (slot.start < minTime || slot.start >= maxTime) return null;

                  return (
                    <div
                      key={`occ-${i}`}
                      className={`absolute w-full left-0 right-0 rounded p-0.5 sm:p-1 overflow-hidden transition-all hover:z-30 hover:scale-[1.02] shadow-2xs cursor-default ${
                        slot.isExtra
                          ? "bg-warning-soft/90 border border-warning-strong/80 text-warning-strong"
                          : "bg-accent-soft/90 border border-accent-strong text-accent-strong"
                      }`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: "18px",
                        zIndex: 10,
                      }}
                      title={`${slot.studentName}${showInstrument && slot.instrument ? ` (ساز ${slot.instrument})` : ""} | ${toPersianDigits(formatMinutesToTime(slot.start))} تا ${toPersianDigits(formatMinutesToTime(slot.end))} (${toPersianDigits(slot.end - slot.start)} دقیقه)`}
                    >
                      <div className="text-[8px] sm:text-[9px] font-bold leading-tight truncate">
                        {slot.studentName}
                      </div>
                      {showInstrument && slot.instrument && (
                        <div className="text-[7px] text-[var(--text-muted)] leading-tight truncate hidden sm:block">
                          {slot.instrument}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Proposed blocks (e.g. from student assignment) */}
                {dayProposed.map((slot, i) => {
                  const top = ((slot.start - minTime) / totalMinutes) * 100;
                  const height = ((slot.end - slot.start) / totalMinutes) * 100;
                  if (slot.start < minTime || slot.start >= maxTime) return null;

                  // Overlap check
                  const isConflict = daySlots.some(
                    (occ) => slot.start < occ.end && slot.end > occ.start,
                  );

                  return (
                    <div
                      key={`prop-${i}`}
                      className={`absolute w-full left-0 right-0 rounded p-0.5 sm:p-1 overflow-hidden shadow-xs transition-all ${
                        isConflict
                          ? "bg-danger/90 text-white border-2 border-danger-strong ring-2 ring-danger/40 animate-pulse"
                          : "bg-success-soft border-2 border-success-strong"
                      }`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: "18px",
                        zIndex: 25,
                      }}
                      title={
                        isConflict
                          ? `⚠️ تداخل زمانی با کلاس دیگر در بازه ${toPersianDigits(formatMinutesToTime(slot.start))} تا ${toPersianDigits(formatMinutesToTime(slot.end))}`
                          : `✓ زمان انتخابی: ${toPersianDigits(formatMinutesToTime(slot.start))} تا ${toPersianDigits(formatMinutesToTime(slot.end))} (${toPersianDigits(slot.end - slot.start)} دقیقه)`
                      }
                    >
                      <div
                        className={`text-[8px] sm:text-[9px] font-bold leading-tight truncate ${
                          isConflict ? "text-white" : "text-success-strong"
                        }`}
                      >
                        {isConflict ? "تداخل!" : "زمان انتخابی"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
