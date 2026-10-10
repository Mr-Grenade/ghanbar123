import { CustomSelect } from "./ui/custom-select";
import React, { useState } from "react";
import { useAcademy } from "../context/AcademyContext";
import { Teacher } from "../types";
import { Pagination } from "./Pagination";
import { TeacherWeeklyCalendar } from "./TeacherWeeklyCalendar";
import {
  toPersianDigits,
  toEnglishDigits,
  formatToman,
  toJalaliDateString,
  getTodayString,
  getPersianWeekdayFromDate,
  WEEKDAYS_FA,
} from "../utils/persianDate";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Music,
  Users,
  Award,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  Search,
} from "lucide-react";

const DEFAULT_INSTRUMENTS = [
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
];

export const TeachersManager: React.FC = () => {
  const { db, addTeacher, updateTeacher, deleteTeacher, showToast } =
    useAcademy();

  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] =
    useState<Teacher | null>(null);
  const [teacherStudentsSearch, setTeacherStudentsSearch] =
    useState<string>("");
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formPhones, setFormPhones] = useState<
    { title: string; number: string }[]
  >([]);
  const [formInstruments, setFormInstruments] = useState<string[]>([]);
  const [formHourlyRate, setFormHourlyRate] = useState<number>(350000);
  const [formPercentageRate, setFormPercentageRate] = useState<number>(50);
  const [formSemesterFormat, setFormSemesterFormat] = useState<1 | 2>(1);
  const [formAvailableDays, setFormAvailableDays] = useState<string[]>([
    "شنبه",
    "دوشنبه",
  ]);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formNotes, setFormNotes] = useState<string>("");

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormName("");
    setFormPhone("");
    setFormPhones([]);
    setFormInstruments([]);
    setFormHourlyRate(400000);

    setFormPercentageRate(50);
    setFormSemesterFormat(1);
    setFormAvailableDays(["شنبه", "دوشنبه"]);
    setFormStatus("active");
    setFormNotes("");
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name);
    setFormPhone(teacher.phone);
    setFormPhones(teacher.phones || []);
    setFormInstruments(teacher.instruments || []);
    setFormHourlyRate(teacher.hourlyRate);

    setFormPercentageRate(teacher.percentageRate || 50);
    setFormSemesterFormat(teacher.semesterFormat || 1);
    setFormAvailableDays(teacher.availableDays || []);
    setFormStatus(teacher.status);
    setFormNotes(teacher.notes || "");
    setShowAddEditModal(true);
  };

  const handleToggleDay = (day: string) => {
    if (formAvailableDays.includes(day)) {
      setFormAvailableDays(formAvailableDays.filter((d) => d !== day));
    } else {
      setFormAvailableDays([...formAvailableDays, day]);
    }
  };

  const handleToggleInstrument = (ins: string) => {
    if (formInstruments.includes(ins)) {
      setFormInstruments(formInstruments.filter((i) => i !== ins));
    } else {
      setFormInstruments([...formInstruments, ins]);
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast("لطفاً نام استاد را وارد نمایید.", "warning");
      return;
    }

    const validPhones =
      formPhones.length > 0
        ? formPhones.filter((p) => p.number.trim())
        : [{ title: "موبایل", number: formPhone }];
    if (validPhones.length === 0 || !validPhones[0].number.trim()) {
      showToast("لطفاً حداقل یک شماره تماس وارد کنید.", "warning");
      return;
    }
    const firstPhone = validPhones[0].number;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: formName,
        phone: firstPhone,
        phones: validPhones,
        instruments: formInstruments,
        hourlyRate: Number(formHourlyRate),
        percentageRate: Number(formPercentageRate),
        availableDays: formAvailableDays,
        status: formStatus,
        notes: formNotes,
        semesterFormat: formSemesterFormat,
      });
    } else {
      addTeacher({
        name: formName,
        phone: firstPhone,
        phones: validPhones,
        instruments: formInstruments,
        hourlyRate: Number(formHourlyRate),
        percentageRate: Number(formPercentageRate),
        availableDays: formAvailableDays,
        status: formStatus,
        hireDate: getTodayString(),
        notes: formNotes,
        semesterFormat: formSemesterFormat,
      });
    }

    setShowAddEditModal(false);
  };

  // Compute all students taught by selected teacher across all semesters (current + archives)
  const teacherStudentsAllSemesters = React.useMemo(() => {
    if (!selectedTeacherForDetail) return [];
    const teacherId = selectedTeacherForDetail.id;
    const studentMap = new Map<
      string,
      {
        id: string;
        name: string;
        instrument: string;
        phone?: string;
        isCurrent: boolean;
        currentClassTime?: string;
        currentClassDay?: string;
        totalSessions: number;
        presentSessions: number;
        extraSessions: number;
        semesters: string[];
      }
    >();

    const currentSemesterTitle = db.settings.semesterTitle || "ترم جاری";

    // 1. Current semester
    db.students.forEach((st) => {
      const isEnrolledAndActive =
        st.teacherId === teacherId && st.status === "active";
      const extraAttendance = db.attendance.filter(
        (a) =>
          a.studentId === st.id &&
          a.teacherId === teacherId &&
          (a.isExtraClass || a.id.startsWith("att-extra-")),
      );
      const allTeacherAttendance = db.attendance.filter(
        (a) => a.studentId === st.id && a.teacherId === teacherId,
      );

      const belongsToTeacher =
        st.teacherId === teacherId || allTeacherAttendance.length > 0;

      if (belongsToTeacher) {
        let termTotal = 0;
        let termPresent = 0;
        const extraCount = extraAttendance.length;

        if (st.teacherId === teacherId) {
          const creditUsedExtras = extraAttendance.filter(
            (a) => a.extraClassCreditUsed,
          ).length;
          termTotal = (st.targetSessions || 0) + creditUsedExtras;
          termPresent = st.attendedSessions || 0;
        } else {
          termTotal = allTeacherAttendance.length;
          termPresent = allTeacherAttendance.filter(
            (a) => a.status === "present",
          ).length;
        }

        const isCurrent = isEnrolledAndActive;
        const hasCurrentSessions = allTeacherAttendance.length > 0;

        const initialSemesters: string[] = [];
        if (isCurrent || hasCurrentSessions) {
          initialSemesters.push(currentSemesterTitle);
        }

        studentMap.set(st.id, {
          id: st.id,
          name: st.name,
          instrument: st.instrument,
          phone: st.phone,
          isCurrent,
          currentClassTime: isCurrent ? st.classTime : undefined,
          currentClassDay: isCurrent ? st.classDay : undefined,
          totalSessions: termTotal,
          presentSessions: termPresent,
          extraSessions: extraCount,
          semesters: initialSemesters,
        });
      }
    });

    // 2. Archived semesters
    if (db.archives && db.archives.length > 0) {
      db.archives.forEach((arc) => {
        const semTitle = arc.title || "ترم گذشته";

        (arc.students || []).forEach((st) => {
          const isEnrolled = st.teacherId === teacherId;
          const extraAttendance = (arc.attendance || []).filter(
            (a) =>
              a.studentId === st.id &&
              a.teacherId === teacherId &&
              (a.isExtraClass || a.id.startsWith("att-extra-")),
          );
          const allTeacherAttendance = (arc.attendance || []).filter(
            (a) => a.studentId === st.id && a.teacherId === teacherId,
          );

          if (isEnrolled || allTeacherAttendance.length > 0) {
            let termTotal = 0;
            let termPresent = 0;
            const extraCount = extraAttendance.length;

            if (isEnrolled) {
              const creditUsedExtras = extraAttendance.filter(
                (a) => a.extraClassCreditUsed,
              ).length;
              termTotal = (st.targetSessions || 0) + creditUsedExtras;
              termPresent = st.attendedSessions || 0;
            } else {
              termTotal = allTeacherAttendance.length;
              termPresent = allTeacherAttendance.filter(
                (a) => a.status === "present",
              ).length;
            }

            if (studentMap.has(st.id)) {
              const existing = studentMap.get(st.id)!;
              existing.totalSessions += termTotal;
              existing.presentSessions += termPresent;
              existing.extraSessions += extraCount;
              if (!existing.semesters.includes(semTitle)) {
                existing.semesters.push(semTitle);
              }
            } else {
              studentMap.set(st.id, {
                id: st.id,
                name: st.name,
                instrument: st.instrument,
                phone: st.phone,
                isCurrent: false,
                totalSessions: termTotal,
                presentSessions: termPresent,
                extraSessions: extraCount,
                semesters: [semTitle],
              });
            }
          }
        });
      });
    }

    studentMap.forEach((entry) => {
      if (entry.semesters.length === 0) {
        entry.semesters.push("ترم‌های گذشته");
      }
    });

    return Array.from(studentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "fa"),
    );
  }, [
    selectedTeacherForDetail,
    db.students,
    db.attendance,
    db.archives,
    db.settings.semesterTitle,
  ]);

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent-strong" />
            <span>مدیریت اساتید</span>
          </h2>
        </div>

        <button
          id="btn-add-teacher"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span> افزودن استاد جدید</span>
        </button>
      </div>

      {/* Teachers Cards Grid */}
      {(() => {
        // Pre-calculate unique attendance records across current db and all archives to avoid double counting
        const allAttendanceMap = new Map();
        db.attendance.forEach((a) => allAttendanceMap.set(a.id, a));
        if (db.archives) {
          db.archives.forEach((arc) => {
            arc.attendance.forEach((a) => {
              if (!allAttendanceMap.has(a.id)) {
                allAttendanceMap.set(a.id, a);
              }
            });
          });
        }
        const uniqueAttendance = Array.from(allAttendanceMap.values());

        const paginatedTeachers =
          pageSize === -1
            ? db.teachers
            : db.teachers.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize,
              );

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTeachers.map((teacher) => {
                const assignedStudents = db.students.filter(
                  (s) => s.teacherId === teacher.id,
                );
                const activeStudents = assignedStudents.filter(
                  (s) => s.status === "active",
                );

                const totalSessionsTaught = uniqueAttendance.filter(
                  (a) => a.teacherId === teacher.id && a.status === "present",
                ).length;

                return (
                  <div
                    key={teacher.id}
                    className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-accent-border/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top: Avatar & Name & Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center font-bold text-lg">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3
                              onClick={() => handleOpenEdit(teacher)}
                              className="font-bold text-sm text-[var(--text-primary)] hover:text-accent-strong cursor-pointer flex items-center gap-1"
                            >
                              <span>{teacher.name}</span>
                              <ChevronRight className="w-3 h-3 text-[var(--text-muted)] rotate-180" />
                            </h3>
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span className="font-mono">
                                {toPersianDigits(teacher.phone)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                            teacher.status === "active"
                              ? "bg-success-soft border-success-border text-success-strong"
                              : "bg-surface-2 border-line text-ink"
                          }`}
                        >
                          {teacher.status === "active" ? "فعال" : "غیرفعال"}
                        </span>
                      </div>

                      {/* Instruments Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {teacher.instruments.map((inst) => (
                          <span
                            key={inst}
                            className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[11px] font-medium"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>

                      {/* Details list */}
                      <div className="mt-4 p-3 rounded-xl bg-[var(--bg-tertiary)] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-muted)]">
                            بهای پایه جلسه:
                          </span>
                          <span className="font-bold text-[var(--text-primary)] font-mono">
                            {formatToman(teacher.hourlyRate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[var(--text-muted)]">
                            درصد دریافتی:
                          </span>
                          <span className="font-bold text-[var(--text-primary)] font-mono text-[11px] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                            {toPersianDigits(teacher.percentageRate || 100)}٪
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-muted)]">
                            تعداد هنرجویان فعال:
                          </span>
                          <span className="font-bold text-[var(--text-primary)] font-mono">
                            {toPersianDigits(activeStudents.length)} هنرجو
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-muted)]">
                            جلسات تشکیل شده تا کنون:
                          </span>
                          <span className="font-bold text-success-strong font-mono">
                            {toPersianDigits(totalSessionsTaught)} جلسه
                          </span>
                        </div>
                      </div>

                      {/* Available Days */}
                      <div className="mt-3 text-[11px] text-[var(--text-muted)]">
                        <strong>روزهای حضور:</strong>{" "}
                        {teacher.availableDays.join("، ") || "تعیین نشده"}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedTeacherForDetail(teacher)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-accent-soft text-[var(--text-secondary)] hover:text-accent-strong text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>هنرجویان</span>
                      </button>
                      <button
                        onClick={() => setTeacherToDelete(teacher)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-danger-soft text-[var(--text-secondary)] hover:text-danger-strong text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {db.teachers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={db.teachers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 20]}
                itemLabel="استاد"
              />
            )}
          </>
        );
      })()}

      {/* ================= MODAL: ADD / EDIT TEACHER ================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-7xl md:aspect-video flex flex-col bg-[var(--bg-secondary)] rounded-2xl p-4 sm:p-6 shadow-xl border border-[var(--border-color)] max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent-strong" />
                <span>
                  {editingTeacher
                    ? `ویرایش اطلاعات استاد: ${editingTeacher.name}`
                    : "افزودن استاد جدید"}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--border-color)] transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="teacherForm"
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs transition-colors"
                >
                  ذخیره اطلاعات
                </button>
              </div>
            </div>

            {/* Split Form Layout: In RTL, 1st col is Right (fields, scrollable), 2nd col is Left (calendar, non-scrollable) */}
            <form
              id="teacherForm"
              onSubmit={handleSaveTeacher}
              className="flex-1 min-h-0 mt-3.5 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden text-xs"
            >
              {/* RIGHT HALF: Form fields (Scrollable, neatly structured) */}
              <div
                className="md:col-span-6 flex flex-col h-full overflow-y-auto pr-1 pl-1 pb-4 space-y-3.5"
                style={{ scrollbarWidth: "thin" }}
              >
                {/* 1. Basic Info & Instruments */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] space-y-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1 text-xs">
                      نام و نام خانوادگی استاد:
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1.5 text-xs">
                      سازهای تخصصی:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(db.settings.instrumentsList || DEFAULT_INSTRUMENTS).map(
                        (inst) => {
                          const isSelected = formInstruments.includes(inst);
                          return (
                            <button
                              key={inst}
                              type="button"
                              onClick={() => handleToggleInstrument(inst)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                                isSelected
                                  ? "bg-accent text-on-solid border-accent shadow-2xs"
                                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--border-color)]"
                              }`}
                            >
                              {isSelected ? `✓ ${inst}` : inst}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Contact Numbers & Bio / Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {/* Phone numbers list */}
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-[var(--text-primary)] text-xs">
                        شماره‌های تماس
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormPhones(
                            formPhones.length > 0
                              ? [...formPhones, { title: "", number: "" }]
                              : [
                                  { title: "موبایل", number: formPhone },
                                  { title: "", number: "" },
                                ],
                          )
                        }
                        className="text-[11px] text-accent-strong hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        افزودن شماره
                      </button>
                    </div>
                    <div className="space-y-2 flex-1">
                      {(formPhones.length > 0
                        ? formPhones
                        : [{ title: "موبایل", number: formPhone }]
                      ).map((phone, index) => {
                        const isValidPhone =
                          phone.number.length === 0 || phone.number.length === 11;
                        return (
                          <div key={index} className="flex items-start gap-1.5">
                            <input
                              type="text"
                              placeholder="عنوان"
                              value={phone.title}
                              onChange={(e) => {
                                let newPhones = [...formPhones];
                                if (newPhones.length === 0)
                                  newPhones = [
                                    { title: "موبایل", number: formPhone },
                                  ];
                                newPhones[index].title = e.target.value;
                                setFormPhones(newPhones);
                              }}
                              className="w-24 px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
                              required
                            />
                            <div className="flex-1 flex flex-col gap-0.5">
                              <input
                                type="tel"
                                value={phone.number}
                                onChange={(e) => {
                                  const val = toEnglishDigits(e.target.value)
                                    .replace(/\D/g, "")
                                    .slice(0, 11);
                                  let newPhones = [...formPhones];
                                  if (newPhones.length === 0)
                                    newPhones = [
                                      { title: "موبایل", number: formPhone },
                                    ];
                                  newPhones[index].number = val;
                                  setFormPhones(newPhones);
                                  if (index === 0) setFormPhone(val);
                                }}
                                className={`w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border text-[var(--text-primary)] font-mono text-left text-xs transition-colors ${
                                  !isValidPhone
                                    ? "border-danger focus:ring-danger"
                                    : "border-[var(--border-color)]"
                                }`}
                                maxLength={11}
                                required
                              />
                              {!isValidPhone && (
                                <span className="text-[10px] text-danger px-1">
                                  شماره باید ۱۱ رقم باشد.
                                </span>
                              )}
                            </div>
                            {(formPhones.length > 0
                              ? formPhones
                              : [{ title: "موبایل", number: formPhone }]
                            ).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  let newPhones = [...formPhones];
                                  if (newPhones.length === 0)
                                    newPhones = [
                                      { title: "موبایل", number: formPhone },
                                    ];
                                  newPhones = newPhones.filter(
                                    (_, i) => i !== index,
                                  );
                                  setFormPhones(newPhones);
                                  if (index === 0 && newPhones.length > 0)
                                    setFormPhone(newPhones[0].number);
                                }}
                                className="p-1.5 text-danger-strong hover:bg-danger-soft rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Bio */}
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] flex flex-col">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1.5 text-xs">
                      سوابق و توضیحات:
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="flex-1 min-h-[75px] w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* 3. Rates & Semester Format */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1 text-xs">
                        بهای پایه جلسه (تومان):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          formHourlyRate === 0
                            ? "0"
                            : new Intl.NumberFormat("fa-IR").format(formHourlyRate)
                        }
                        onChange={(e) => {
                          const engDigits = toEnglishDigits(e.target.value);
                          const val = engDigits.replace(/\D/g, "");
                          setFormHourlyRate(val ? parseInt(val, 10) : 0);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1 text-xs">
                        فرمت ترم:
                      </label>
                      <CustomSelect
                        value={formSemesterFormat}
                        onChange={(e) =>
                          setFormSemesterFormat(Number(e.target.value) as 1 | 2)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-xs"
                      >
                        <option value={1}>
                          {db.settings.semesterTitle || "فرمت ۱"}
                        </option>
                        <option value={2}>
                          {db.settings.semester2Title || "فرمت ۲"}
                        </option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1 text-xs">
                        درصد دریافتی استاد (٪):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPercentageRate}
                        onChange={(e) =>
                          setFormPercentageRate(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Attendance Days & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                  <div className="sm:col-span-8 p-3 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold text-[var(--text-primary)] text-xs">
                        روزهای حضور در آموزشگاه:
                      </label>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {toPersianDigits(formAvailableDays.length)} روز انتخاب شده
                      </span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                      {WEEKDAYS_FA.map((day) => {
                        const isSelected = formAvailableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleToggleDay(day)}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all text-center ${
                              isSelected
                                ? "bg-accent text-on-solid shadow-2xs font-bold"
                                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)]">
                    <div className="text-right sm:text-center">
                      <span className="font-semibold text-[var(--text-primary)] block text-xs">
                        وضعیت فعالیت
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          formStatus === "active"
                            ? "text-success-strong"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {formStatus === "active" ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormStatus(
                          formStatus === "active" ? "inactive" : "active",
                        )
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formStatus === "active"
                          ? "bg-success-strong"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formStatus === "active" ? "-translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* LEFT HALF: Weekly Calendar (Non-scrollable wrapper) */}
              <div className="md:col-span-6 h-full min-h-[360px] md:min-h-0 overflow-hidden bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] flex flex-col p-2">
                <TeacherWeeklyCalendar
                  teacherId={editingTeacher?.id}
                  allStudents={db.students}
                  availableDays={formAvailableDays}
                  teacherName={formName || editingTeacher?.name}
                  showInstrument={false}
                  extraClasses={
                    editingTeacher
                      ? db.attendance
                          .filter(
                            (a) =>
                              a.isExtraClass &&
                              a.teacherId === editingTeacher.id &&
                              a.date >= getTodayString(),
                          )
                          .map((a) => {
                            const st = db.students.find(
                              (s) => s.id === a.studentId,
                            );
                            return {
                              day: getPersianWeekdayFromDate(a.date),
                              time: a.time,
                              studentName: st?.name || "نامشخص",
                              durationMinutes:
                                a.durationMinutes ||
                                st?.classDurationMinutes ||
                                30,
                            };
                          })
                      : undefined
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TEACHER ROSTER & PROFILE ================= */}
      {selectedTeacherForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedTeacherForDetail.name}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-soft text-accent-strong font-medium">
                    تمام ترم‌ها
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  سازها: {selectedTeacherForDetail.instruments.join("، ")}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTeacherForDetail(null);
                  setTeacherStudentsSearch("");
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search field for all students taught by this teacher throughout semesters */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={teacherStudentsSearch}
                onChange={(e) => setTeacherStudentsSearch(e.target.value)}
                placeholder={`جستجوی هنرجو در تمام ترم‌ها بر اساس نام، ساز یا شماره تماس... (از ${toPersianDigits(teacherStudentsAllSemesters.length)} هنرجو)`}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-accent-strong transition-colors"
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {/* All Students List with Sessions and Extra Sessions */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] text-xs">
                {teacherStudentsAllSemesters
                  .filter((s) => {
                    if (!teacherStudentsSearch.trim()) return true;
                    const q = teacherStudentsSearch.trim().toLowerCase();
                    return (
                      s.name.toLowerCase().includes(q) ||
                      s.instrument.toLowerCase().includes(q) ||
                      (s.phone && s.phone.includes(q))
                    );
                  })
                  .map((st) => (
                    <div
                      key={st.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {st.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                            ساز {st.instrument}
                          </span>
                          {st.isCurrent ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success-soft text-success-strong font-medium">
                              ترم جاری
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-medium">
                              ترم‌های گذشته
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex flex-wrap items-center gap-2">
                          {st.isCurrent && st.currentClassDay && (
                            <span>
                              {st.currentClassDay}‌ها ساعت {toPersianDigits(st.currentClassTime || "")}
                            </span>
                          )}
                          {st.semesters.length > 0 && (
                            <span>
                              ترم‌ها: {st.semesters.join("، ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* In front of each student name: Present sessions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                          جلسات حاضر:
                        </span>
                        <span className="text-xs font-bold text-success-strong font-mono">
                          {toPersianDigits(st.presentSessions)} جلسه
                        </span>
                      </div>
                    </div>
                  ))}

                {teacherStudentsAllSemesters.length === 0 && (
                  <div className="p-6 text-center text-[var(--text-muted)]">
                    هنرجویی برای این استاد در هیچ‌ترمی ثبت نشده است.
                  </div>
                )}

                {teacherStudentsAllSemesters.length > 0 &&
                  teacherStudentsAllSemesters.filter((s) => {
                    if (!teacherStudentsSearch.trim()) return true;
                    const q = teacherStudentsSearch.trim().toLowerCase();
                    return (
                      s.name.toLowerCase().includes(q) ||
                      s.instrument.toLowerCase().includes(q) ||
                      (s.phone && s.phone.includes(q))
                    );
                  }).length === 0 && (
                    <div className="p-6 text-center text-[var(--text-muted)]">
                      هیچ هنرجویی با این عبارت جستجو یافت نشد.
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE TEACHER CONFIRMATION ================= */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-danger-strong font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>تأیید حذف استاد</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              آیا از حذف استاد «<strong>{teacherToDelete.name}</strong>» اطمینان
              دارید؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-tertiary)]/80"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-danger-strong text-white text-xs font-semibold hover:opacity-90"
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
