import { Student, AttendanceRecord, ClassSlot } from "../types";

export interface ScheduleConflict {
  slot: ClassSlot;
  conflictingStudentName: string;
  conflictingTime: string;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function checkSlotConflict(
  teacherId: string,
  testSlots: ClassSlot[],
  allStudents: Student[],
  excludeStudentId?: string,
  extraClasses?: {
    day: string;
    time: string;
    studentName: string;
    durationMinutes?: number;
  }[],
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  // Find all slots for this teacher
  const occupiedSlots: {
    day: string;
    start: number;
    end: number;
    studentName: string;
    originalTime: string;
  }[] = [];

  allStudents.forEach((st) => {
    if (st.teacherId !== teacherId) return;
    if (excludeStudentId && st.id === excludeStudentId) return;

    const slots =
      st.weeklySlots && st.weeklySlots.length > 0
        ? st.weeklySlots
        : [{ day: st.classDay, time: st.classTime }];

    slots.forEach((slot) => {
      const start = parseTimeToMinutes(slot.time);
      const end =
        start + (slot.durationMinutes || st.classDurationMinutes || 30); // Default to 30 mins if not set
      occupiedSlots.push({
        day: slot.day,
        start,
        end,
        studentName: st.name,
        originalTime: slot.time,
      });
    });
  });

  // Check against testSlots
  if (extraClasses) {
    extraClasses.forEach((ec) => {
      const start = parseTimeToMinutes(ec.time);
      const end = start + (ec.durationMinutes || 30);
      occupiedSlots.push({
        day: ec.day,
        start,
        end,
        studentName: ec.studentName + " (جبرانی)",
        originalTime: ec.time,
      });
    });
  }

  testSlots.forEach((testSlot) => {
    const start = parseTimeToMinutes(testSlot.time);
    const end = start + (testSlot.durationMinutes || 30);

    for (const occ of occupiedSlots) {
      if (occ.day === testSlot.day) {
        // Two intervals [start, end) and [occ.start, occ.end) overlap if and only if:
        if (start < occ.end && end > occ.start) {
          conflicts.push({
            slot: testSlot,
            conflictingStudentName: occ.studentName,
            conflictingTime: `${formatMinutesToTime(occ.start)} تا ${formatMinutesToTime(occ.end)}`,
          });
        }
      }
    }
  });

  return conflicts;
}
