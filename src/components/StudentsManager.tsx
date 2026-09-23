import { CustomSelect } from "./ui/custom-select";
import React, { useState, useEffect } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  Student,
  Teacher,
  PaymentStatus,
  StudentStatus,
  ClassSlot,
} from "../types";
import {
  toPersianDigits,
  toEnglishDigits,
  formatToman,
  toJalaliDateString,
  getTodayString,
  addDays,
  WEEKDAYS_FA,
  calculateRemainingSessionsInSemester,
} from "../utils/persianDate";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { getPersianWeekdayFromDate } from "../utils/persianDate";
import { TeacherWeeklyCalendar } from "./TeacherWeeklyCalendar";
import { checkSlotConflict } from "../utils/schedule";
import { Pagination } from "./Pagination";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Award,
  CreditCard,
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  Music,
  PlusCircle,
  MinusCircle,
  ChevronRight,
  Filter,
  DollarSign,
  UserCheck,
  Calendar,
} from "lucide-react";

const HOURS = Array.from({ length: 23 - 8 + 1 }, (_, i) =>
  String(i + 8).padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];

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

const WheelColumn = ({
  items,
  selected,
  onChange,
}: {
  items: string[];
  selected: string;
  onChange: (val: string) => void;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      const idx = items.indexOf(selected);
      if (idx !== -1) {
        containerRef.current.scrollTop = idx * 40;
      }
    }
  }, [items, selected]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / 40);
      if (idx >= 0 && idx < items.length && items[idx] !== selected) {
        onChange(items[idx]);
      }
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[120px] overflow-y-auto snap-y snap-mandatory flex-1 no-scrollbar relative z-10"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div style={{ height: "40px" }} />
      {items.map((item) => (
        <div
          key={item}
          onClick={() => {
            onChange(item);
            if (containerRef.current) {
              containerRef.current.scrollTo({
                top: items.indexOf(item) * 40,
                behavior: "smooth",
              });
            }
          }}
          className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all ${
            item === selected
              ? "text-accent font-bold text-base scale-105"
              : "text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)]"
          }`}
        >
          {item}
        </div>
      ))}
      <div style={{ height: "40px" }} />
    </div>
  );
};

const TimeSelector24h = ({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [h, m] = (value || "16:00").split(":");

  const handleHourChange = (newH: string) => {
    onChange(`${newH}:${m}`);
  };

  const handleMinuteChange = (newM: string) => {
    onChange(`${h}:${newM}`);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ padding: 0 }}
    >
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 w-full h-full min-h-[28px] px-1.5 bg-transparent text-inherit font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent/30 rounded-lg transition-colors text-xs"
        dir="ltr"
      >
        <span>{h}</span>
        <span className="text-[var(--text-muted)] opacity-70 mb-0.5">:</span>
        <span>{m}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 top-full left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-2xl p-2.5 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 w-[135px]">
            <div
              className="relative flex w-full items-center justify-between bg-[var(--bg-tertiary)] rounded-xl overflow-hidden h-[120px] font-mono no-scrollbar"
              dir="ltr"
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[40px] bg-accent/10 border-y border-accent/20 pointer-events-none" />
              <WheelColumn
                items={HOURS}
                selected={h}
                onChange={handleHourChange}
              />
              <div className="text-[var(--text-muted)] font-bold text-base pb-1 relative z-10 opacity-70">
                :
              </div>
              <WheelColumn
                items={MINUTES}
                selected={m}
                onChange={handleMinuteChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const StudentsManager: React.FC = () => {
  const {
    db,
    addStudent,
    updateStudent,
    deleteStudent,
    overrideStudentCredits,
    addExtraClass,
    deleteExtraClass,
    updateExtraClass,
    recordStudentPayment,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useAcademy();

  const [selectedStudentForDetail, setSelectedStudentForDetail] =
    useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] =
    useState<Student | null>(null);
  const [selectedStudentForExtraClass, setSelectedStudentForExtraClass] =
    useState<Student | null>(null);

  const [selectedStudentForNote, setSelectedStudentForNote] =
    useState<Student | null>(null);
  const [noteFormGeneral, setNoteFormGeneral] = useState<string>("");
  const [noteFormFinancial, setNoteFormFinancial] = useState<string>("");

  // States for inline extra class editing
  const [editingExtraClassId, setEditingExtraClassId] = useState<string | null>(
    null,
  );
  const [extraClassToDelete, setExtraClassToDelete] = useState<string | null>(
    null,
  );
  const [editExtraClassDate, setEditExtraClassDate] = useState<string>("");
  const [editExtraClassTime, setEditExtraClassTime] = useState<string>("");
  const [editExtraClassDuration, setEditExtraClassDuration] =
    useState<number>(30);
  const [editExtraClassTeacherId, setEditExtraClassTeacherId] =
    useState<string>("");
  const [editExtraClassNotes, setEditExtraClassNotes] = useState<string>("");

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Extra Class form state
  const [extraClassDate, setExtraClassDate] =
    useState<string>(getTodayString());
  const [extraClassTime, setExtraClassTime] = useState<string>("16:00");
  const [extraClassDuration, setExtraClassDuration] = useState<number>(30);
  const [extraClassTeacherId, setExtraClassTeacherId] = useState<string>("");
  const [extraClassSessionPrice, setExtraClassSessionPrice] = useState<
    number | ""
  >("");
  const [extraClassNotes, setExtraClassNotes] = useState<string>("");

  // Filters (status filter removed as requested)
  const [filterInstrument, setFilterInstrument] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  // Credit override state

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterInstrument, filterTeacher, filterPayment]);

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "pos" | "card_transfer" | "cash"
  >("pos");
  const [paymentReceipt, setPaymentReceipt] = useState<string>("");

  // Student Form State
  const [formName, setFormName] = useState<string>("");
  const [formEnglishName, setFormEnglishName] = useState<string>("");
  const [formNationalId, setFormNationalId] = useState<string>("");
  const [formPhones, setFormPhones] = useState<
    { title: string; number: string }[]
  >([{ title: "موبایل", number: "" }]);
  const [formInstrument, setFormInstrument] = useState<string>(
    db.settings.instrumentsList?.[0] || DEFAULT_INSTRUMENTS[0],
  );
  const [formTeacherId, setFormTeacherId] = useState<string>("");
  const [formClassDurationMinutes, setFormClassDurationMinutes] =
    useState<number>(30);
  const [formSessionFeeOverride, setFormSessionFeeOverride] = useState<
    number | ""
  >("");
  const [formRegisteredDate, setFormRegisteredDate] =
    useState<string>(getTodayString());
  const [formSessionsPerWeek, setFormSessionsPerWeek] = useState<number>(1);
  const [formWeeklySlots, setFormWeeklySlots] = useState<ClassSlot[]>([
    { day: "شنبه", time: "16:00" },
  ]);
  const [formTuitionFee, setFormTuitionFee] = useState<number>(3500000);
  const [formPaidAmount, setFormPaidAmount] = useState<number>(3500000);
  const [formTargetSessions, setFormTargetSessions] = useState<number>(10);
  const [formMakeupCredits, setFormMakeupCredits] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<StudentStatus>("active");
  const [formNotes, setFormNotes] = useState<string>("");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [slotConflicts, setSlotConflicts] = useState<any[]>([]);

  const teacherMap = new Map<string, Teacher>(
    db.teachers.map((t) => [t.id, t]),
  );

  const currentConflicts =
    db.settings.enableConflictDetection !== false && formTeacherId
      ? checkSlotConflict(
          formTeacherId,
          formWeeklySlots.map((s) => ({
            ...s,
            durationMinutes: formClassDurationMinutes,
          })),
          db.students,
          editingStudent?.id,
          db.attendance
            .filter(
              (a) =>
                a.isExtraClass &&
                a.teacherId === formTeacherId &&
                a.date >= getTodayString(),
            )
            .map((a) => {
              const st = db.students.find((s) => s.id === a.studentId);
              return {
                day: getPersianWeekdayFromDate(a.date),
                time: a.time,
                studentName: st?.name || "نامشخص",
                durationMinutes:
                  a.durationMinutes || st?.classDurationMinutes || 30,
              };
            }),
        )
      : [];

  // Helper to get allowed sessions per week for a teacher
  const getTeacherCapacity = (tId: string): number => {
    return db.settings.globalSessionsPerWeek || 1;
  };

  const getTeacherAvailableDays = (tId: string): string[] => {
    const t = teacherMap.get(tId);
    return t?.availableDays && t.availableDays.length > 0
      ? t.availableDays
      : WEEKDAYS_FA;
  };

  // Recompute sessions & pro-rated tuition based on registered date and end of semester
  const calculateProRatedTuition = (
    regDate: string,
    slots: ClassSlot[],
    teacherId: string,
    feeOverride?: number | "",
  ) => {
    const selectedTeacher = teacherMap.get(teacherId) || db.teachers[0];
    const isFormat2 = selectedTeacher?.semesterFormat === 2;
    const defaultStart = isFormat2
      ? db.settings.semester2StartDate
      : db.settings.semesterStartDate;
    const defaultEnd = isFormat2
      ? db.settings.semester2EndDate
      : db.settings.semesterEndDate;

    const semEnd = defaultEnd || addDays(getTodayString(), 90);

    // The start date for calculation is max(regDate, semesterStartDate)
    let actualStart = regDate;
    if (defaultStart && defaultStart > regDate) {
      actualStart = defaultStart;
    }

    const dayNames = slots.map((s) => s.day);
    const remainingCount = calculateRemainingSessionsInSemester(
      actualStart,
      semEnd,
      dayNames,
    );
    const count = Math.max(
      1,
      remainingCount || db.settings.defaultSemesterSessions || 10,
    );

    const sessionRate =
      typeof feeOverride === "number"
        ? feeOverride
        : feeOverride !== "" && formSessionFeeOverride !== ""
          ? Number(formSessionFeeOverride)
          : selectedTeacher?.hourlyRate ||
            db.settings.defaultPricePerSession ||
            350000;
    const calcTuition = count * sessionRate;

    setFormTargetSessions(count);
    setFormTuitionFee(calcTuition);
    // Paid amount is intentionally not auto-updated here to prevent overwriting user input
  };

  // Open Edit Modal
  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormName(st.name);
    setFormEnglishName(st.englishName || "");
    setFormNationalId(st.nationalId || "");
    if (st.phones && st.phones.length > 0) {
      setFormPhones(st.phones);
    } else {
      setFormPhones([{ title: "موبایل", number: st.phone || "" }]);
    }
    setFormInstrument(st.instrument);
    setFormTeacherId(st.teacherId);
    const teacher = teacherMap.get(st.teacherId);
    const currentRate =
      st.sessionFeeOverride ??
      teacher?.hourlyRate ??
      db.settings.defaultPricePerSession ??
      350000;
    setFormSessionFeeOverride(currentRate);
    setFormRegisteredDate(st.registeredDate || getTodayString());

    const slots =
      st.weeklySlots && st.weeklySlots.length > 0
        ? st.weeklySlots
        : [{ day: st.classDay || "شنبه", time: st.classTime || "16:00" }];
    setFormWeeklySlots(slots);
    setFormSessionsPerWeek(st.sessionsPerWeek || slots.length);

    setFormTuitionFee(st.tuitionFee);
    setFormPaidAmount(st.paidAmount);
    setFormTargetSessions(st.targetSessions);
    setFormMakeupCredits(st.makeupCredits);
    setFormStatus(st.status);
    setFormNotes(st.notes || "");
    setShowAddEditModal(true);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName("");
    setFormEnglishName("");
    setFormNationalId("");
    setFormPhones([{ title: "موبایل", number: "" }]);
    setFormInstrument(
      db.settings.instrumentsList?.[0] || DEFAULT_INSTRUMENTS[0],
    );
    const firstTeacher =
      db.teachers.find((t) => t.status === "active") || db.teachers[0];
    const firstTeacherId = firstTeacher?.id || "";
    setFormTeacherId(firstTeacherId);
    const defaultRate =
      firstTeacher?.hourlyRate || db.settings.defaultPricePerSession || 350000;
    setFormSessionFeeOverride(defaultRate);
    const today = getTodayString();
    setFormRegisteredDate(today);

    const allowedDays = getTeacherAvailableDays(firstTeacherId);
    const initialDay = allowedDays[0] || "شنبه";

    const initialSlots: ClassSlot[] = [{ day: initialDay, time: "16:00" }];
    setFormWeeklySlots(initialSlots);
    setFormSessionsPerWeek(1);

    // Pro-rate default for new student with defaultRate
    calculateProRatedTuition(today, initialSlots, firstTeacherId, defaultRate);

    setFormPaidAmount(0);
    setFormMakeupCredits(0);
    setFormStatus("active");
    setFormNotes("");
    setShowAddEditModal(true);
  };

  // When teacher is changed in modal
  const handleTeacherChange = (newTeacherId: string) => {
    setFormTeacherId(newTeacherId);
    const selectedTeacher =
      teacherMap.get(newTeacherId) ||
      db.teachers.find((t) => t.id === newTeacherId);
    const newRate =
      selectedTeacher?.hourlyRate ||
      db.settings.defaultPricePerSession ||
      350000;

    // Update session fee override with the new teacher's default session rate
    setFormSessionFeeOverride(newRate);

    const maxAllowed = getTeacherCapacity(newTeacherId);
    const availDays = getTeacherAvailableDays(newTeacherId);

    let updatedSlots = [...formWeeklySlots];
    if (updatedSlots.length > maxAllowed) {
      updatedSlots = updatedSlots.slice(0, maxAllowed);
      showToast(
        `ظرفیت مجاز جلسات هفتگی برای این استاد حداکثر ${toPersianDigits(maxAllowed)} جلسه است.`,
        "info",
      );
    }

    // Adjust days if not in teacher's available days
    updatedSlots = updatedSlots.map((s, idx) => {
      if (!availDays.includes(s.day)) {
        const fallbackDay = availDays[idx % availDays.length] || "شنبه";
        return { ...s, day: fallbackDay };
      }
      return s;
    });

    setFormWeeklySlots(updatedSlots);
    setFormSessionsPerWeek(updatedSlots.length);

    if (editingStudent) {
      // For existing student being edited, maintain the student's target sessions and recalculate tuition with new teacher's rate
      const count =
        formTargetSessions > 0
          ? formTargetSessions
          : editingStudent.targetSessions || 10;
      setFormTargetSessions(count);
      setFormTuitionFee(count * newRate);
    } else {
      // For new student, recalculate pro-rated remaining sessions and tuition
      calculateProRatedTuition(
        formRegisteredDate,
        updatedSlots,
        newTeacherId,
        newRate,
      );
    }
  };

  const handleUpdateSlot = (
    index: number,
    field: keyof ClassSlot,
    value: string,
  ) => {
    const updated = [...formWeeklySlots];
    updated[index] = { ...updated[index], [field]: value };
    setFormWeeklySlots(updated);
  };

  const handleAddSlot = () => {
    const maxAllowed = getTeacherCapacity(formTeacherId);
    if (formWeeklySlots.length >= maxAllowed) {
      showToast(
        `بر اساس تنظیمات این استاد، حداکثر مجاز ${toPersianDigits(maxAllowed)} جلسه در هفته برای هر هنرجو تعیین شده است.`,
        "warning",
      );
      return;
    }
    const availDays = getTeacherAvailableDays(formTeacherId);
    const usedDays = new Set(formWeeklySlots.map((s) => s.day));
    const nextDay =
      availDays.find((d) => !usedDays.has(d)) || availDays[0] || "شنبه";
    const updated = [...formWeeklySlots, { day: nextDay, time: "17:00" }];
    setFormWeeklySlots(updated);
    setFormSessionsPerWeek(updated.length);
    calculateProRatedTuition(
      formRegisteredDate,
      updated,
      formTeacherId,
      formSessionFeeOverride,
    );
  };

  const handleRemoveSlot = (index: number) => {
    if (formWeeklySlots.length <= 1) return;
    const updated = formWeeklySlots.filter((_, i) => i !== index);
    setFormWeeklySlots(updated);
    setFormSessionsPerWeek(updated.length);
    calculateProRatedTuition(
      formRegisteredDate,
      updated,
      formTeacherId,
      formSessionFeeOverride,
    );
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTeacherId || !formNationalId.trim()) {
      showToast(
        "لطفاً نام هنرجو، کدملی و نام استاد را مشخص نمایید.",
        "warning",
      );
      return;
    }

    if (!/^\d{10}$/.test(formNationalId.trim())) {
      showToast("کدملی باید دقیقاً ۱۰ رقم و فقط شامل اعداد باشد.", "warning");
      return;
    }

    const validPhones = formPhones.filter((p) => p.number.trim());
    if (validPhones.length === 0) {
      showToast("لطفاً حداقل یک شماره تماس وارد کنید.", "warning");
      return;
    }

    for (const phone of validPhones) {
      if (!/^\d{11}$/.test(phone.number.trim())) {
        showToast(
          "شماره تماس باید دقیقاً ۱۱ رقم و فقط شامل اعداد باشد.",
          "warning",
        );
        return;
      }
    }

    let paymentStatus: PaymentStatus = "overdue";
    if (formPaidAmount >= formTuitionFee) {
      paymentStatus = "paid";
    } else if (formPaidAmount > 0) {
      paymentStatus = "partial";
    }

    const primarySlot = formWeeklySlots[0] || { day: "شنبه", time: "16:00" };
    const primaryPhone = validPhones[0].number;
    const sessionOverrideNum =
      formSessionFeeOverride !== ""
        ? Number(formSessionFeeOverride)
        : undefined;

    if (currentConflicts.length > 0) {
      showToast(
        "تداخل زمانی وجود دارد! لطفاً زمان دیگری را انتخاب کنید.",
        "error",
      );
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: formName,
        englishName: formEnglishName,
        nationalId: formNationalId,
        phone: primaryPhone,
        phones: validPhones,
        instrument: formInstrument,
        teacherId: formTeacherId,
        sessionFeeOverride: sessionOverrideNum,
        registeredDate: formRegisteredDate,
        classDay: primarySlot.day,
        classTime: primarySlot.time,
        classDurationMinutes: formClassDurationMinutes,
        sessionsPerWeek: formWeeklySlots.length,
        weeklySlots: formWeeklySlots,
        tuitionFee: Number(formTuitionFee),
        paidAmount: Number(formPaidAmount),
        targetSessions: Number(formTargetSessions),
        makeupCredits: Number(formMakeupCredits),
        paymentStatus,
        status: formStatus,
        notes: formNotes,
      });
    } else {
      const inactiveMatch = db.students.find(
        (s) =>
          s.status !== "active" &&
          s.name === formName &&
          (s.nationalId === formNationalId || s.phone === primaryPhone),
      );
      if (inactiveMatch) {
        updateStudent(inactiveMatch.id, {
          name: formName,
          englishName: formEnglishName,
          nationalId: formNationalId,
          phone: primaryPhone,
          phones: validPhones,
          instrument: formInstrument,
          teacherId: formTeacherId,
          sessionFeeOverride: sessionOverrideNum,
          registeredDate: formRegisteredDate,
          classDay: primarySlot.day,
          classTime: primarySlot.time,
          classDurationMinutes: formClassDurationMinutes,
          sessionsPerWeek: formWeeklySlots.length,
          weeklySlots: formWeeklySlots,
          makeupCredits: Number(formMakeupCredits),
          paymentStatus,
          tuitionFee: Number(formTuitionFee),
          paidAmount: Number(formPaidAmount),
          targetSessions: Number(formTargetSessions),
          status: "active",
          notes: formNotes,
        });
      } else {
        addStudent({
          name: formName,
          englishName: formEnglishName,
          nationalId: formNationalId,
          phone: primaryPhone,
          phones: validPhones,
          instrument: formInstrument,
          teacherId: formTeacherId,
          sessionFeeOverride: sessionOverrideNum,
          registeredDate: formRegisteredDate,
          classDay: primarySlot.day,
          classTime: primarySlot.time,
          classDurationMinutes: formClassDurationMinutes,
          sessionsPerWeek: formWeeklySlots.length,
          weeklySlots: formWeeklySlots,
          makeupCredits: Number(formMakeupCredits),
          paymentStatus,
          tuitionFee: Number(formTuitionFee),
          paidAmount: Number(formPaidAmount),
          targetSessions: Number(formTargetSessions),
          status: formStatus,
          notes: formNotes,
        });
      }
    }
    setShowAddEditModal(false);
  };

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

  // Filtered Students
  const filteredStudents = db.students.filter((st) => {
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      const qEng = toEnglishDigits(q);
      const qClean = qEng.replace(/[-\s]/g, "");

      const matchName = st.name.toLowerCase().includes(q);
      const matchEnglishName = st.englishName
        ? st.englishName.toLowerCase().includes(q)
        : false;
      const matchNationalId = st.nationalId
        ? toEnglishDigits(st.nationalId).includes(qEng)
        : false;

      // Check primary phone + all additional phone numbers
      const allPhoneStrings = [
        st.phone,
        ...(st.phones ? st.phones.map((p) => p.number) : []),
      ].filter(Boolean);

      const matchPhone = allPhoneStrings.some((ph) => {
        const phLower = ph.toLowerCase();
        const phEng = toEnglishDigits(phLower);
        const phClean = phEng.replace(/[-\s]/g, "");
        return (
          phLower.includes(q) ||
          phEng.includes(qEng) ||
          (qClean.length > 0 && phClean.includes(qClean))
        );
      });

      const matchPhoneTitle = st.phones
        ? st.phones.some((p) => p.title && p.title.toLowerCase().includes(q))
        : false;

      const matchInstrument = st.instrument.toLowerCase().includes(q);
      const teacher = teacherMap.get(st.teacherId);
      const matchTeacher = teacher?.name.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchEnglishName &&
        !matchNationalId &&
        !matchPhone &&
        !matchPhoneTitle &&
        !matchInstrument &&
        !matchTeacher
      ) {
        return false;
      }
    }
    if (filterInstrument !== "all" && st.instrument !== filterInstrument)
      return false;
    if (filterTeacher !== "all" && st.teacherId !== filterTeacher) return false;
    if (filterPayment !== "all" && st.paymentStatus !== filterPayment)
      return false;
    if (filterStatus !== "all" && st.status !== filterStatus) return false;
    if (filterDay !== "all") {
      const days =
        st.weeklySlots && st.weeklySlots.length > 0
          ? st.weeklySlots.map((s) => s.day)
          : [st.classDay];
      if (!days.includes(filterDay)) return false;
    }
    return true;
  });

  const allInstruments = db.settings.instrumentsList || DEFAULT_INSTRUMENTS;

  const paginatedStudents =
    pageSize === -1
      ? filteredStudents
      : filteredStudents.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        );

  return (
    <div className="space-y-5">
      {/* Top Action & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-strong" />
              <span>مدیریت هنرجویان</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              مجموع {toPersianDigits(db.students.length)} هنرجو ثبت شده
            </p>
          </div>

          <button
            id="btn-add-student"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت نام هنرجو</span>
          </button>
        </div>

        {/* Dedicated Student Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="student-search-input"
            type="text"
            placeholder="جستجوی سریع هنرجو بر اساس نام و نام‌خانوادگی، ساز، نام استاد یا شماره تماس..."
            dir="rtl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-9 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-border transition-all font-medium text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              title="پاک کردن جستجو"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Rows (without وضعیت هنرجو) */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[var(--border-color)] text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              وضعیت:
            </label>
            <CustomSelect
              dir="auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
            >
              <option value="active">هنرجویان ترم جاری</option>
              <option value="all">همه هنرجویان</option>
            </CustomSelect>
          </div>
          {/* Instrument Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              ساز / رشته:
            </label>
            <CustomSelect
              dir="auto"
              value={filterInstrument}
              onChange={(e) => setFilterInstrument(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
            >
              <option value="all">همه سازها</option>
              {allInstruments.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </CustomSelect>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              استاد مدرس:
            </label>
            <CustomSelect
              dir="auto"
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
            >
              <option value="all">همه اساتید</option>
              {db.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </CustomSelect>
          </div>

          {/* Payment Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              وضعیت پرداخت:
            </label>
            <CustomSelect
              dir="auto"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="paid">تسویه کامل</option>
              <option value="partial">پرداخت ناقص</option>
              <option value="overdue">معوق / بدهکار</option>
            </CustomSelect>
          </div>

          {/* Day Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              روز کلاس:
            </label>
            <CustomSelect
              dir="auto"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
            >
              <option value="all">همه روزها</option>
              {WEEKDAYS_FA.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="text-right py-12 text-[var(--text-muted)]">
            <Users className="w-12 h-12 mx-auto text-ink-muted mb-3 opacity-60" />
            <p className="text-sm">هنرجویی مطابق با معیارهای جستجو یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
                  <th className="py-2.5 px-3 text-center">نام هنرجو</th>
                  <th className="py-2.5 px-3 text-center">ساز و استاد</th>
                  <th className="py-2.5 px-3 text-center">زمان‌بندی هفتگی</th>
                  <th className="py-2.5 px-3 text-center">وضعیت شهریه</th>
                  <th className="py-2.5 px-3 text-center">جبرانی</th>
                  <th className="py-2.5 px-3 text-center">یادداشت</th>
                  <th className="py-2.5 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {paginatedStudents.map((st) => {
                  const teacher = teacherMap.get(st.teacherId);
                  const progressPercent = Math.min(
                    100,
                    Math.round(
                      (st.attendedSessions / (st.targetSessions || 1)) * 100,
                    ),
                  );
                  const debt = st.tuitionFee - st.paidAmount;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-[var(--bg-tertiary)]/50 transition-colors ${st.status !== "active" ? "opacity-60 bg-gray-50 dark:bg-white/5" : ""}`}
                    >
                      {/* Student Name */}
                      <td className="py-3 px-3 text-center">
                        <div
                          onClick={() => handleOpenEdit(st)}
                          className="font-bold text-[var(--text-primary)] hover:text-accent-strong cursor-pointer flex items-center justify-center gap-1.5"
                          title="ویرایش مشخصات"
                        >
                          <span>{st.name}</span>
                          {st.status !== "active" && (
                            <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded ml-1">
                              غیرفعال / ترم گذشته
                            </span>
                          )}
                          <Edit2 className="w-3 h-3 text-[var(--text-muted)]" />
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">
                          {toPersianDigits(st.phone)}
                        </div>
                      </td>

                      {/* Instrument & Teacher */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {st.instrument}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          استاد: {teacher?.name || "نامشخص"}
                        </div>
                      </td>

                      {/* Class Schedule */}
                      <td className="py-3 px-3 text-center">
                        {st.weeklySlots && st.weeklySlots.length > 0 ? (
                          <div className="space-y-2">
                            {st.weeklySlots.map((slot, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex flex-col items-center justify-center text-xs"
                              >
                                <span className="font-semibold text-[var(--text-primary)]">
                                  {slot.day}‌ها
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                                  ساعت {toPersianDigits(slot.time)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">
                              {st.classDay}‌ها
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] font-mono">
                              ساعت {toPersianDigits(st.classTime)} (
                              {toPersianDigits(st.classDurationMinutes || 30)}{" "}
                              دقیقه)
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Payment Status & Debt */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
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
                              ? "تسویه کامل"
                              : st.paymentStatus === "partial"
                                ? "پرداخت ناقص"
                                : "معوق / بدهکار"}
                          </span>
                          {debt > 0 && (
                            <button
                              onClick={() => {
                                setSelectedStudentForPayment(st);
                                setPaymentAmount(debt);
                              }}
                              className="text-xs font-bold text-success-strong hover:underline flex items-center gap-0.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              واریز
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                          {debt > 0 ? (
                            <span className="text-danger-strong font-bold">
                              مانده: {formatToman(debt)}
                            </span>
                          ) : (
                            <span>شهریه: {formatToman(st.tuitionFee)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 bg-[var(--bg-tertiary)] rounded-full px-2 py-1 border border-[var(--border-color)] w-max mx-auto">
                          <button
                            onClick={() =>
                              updateStudent(st.id, {
                                makeupCredits: Math.max(
                                  0,
                                  (st.makeupCredits || 0) - 1,
                                ),
                              })
                            }
                            className="text-[var(--danger-strong)] hover:text-danger-strong hover:bg-danger-soft rounded-full p-0.5 transition-colors"
                          >
                            <MinusCircle size={14} />
                          </button>
                          <span className="font-bold text-xs w-4 text-center font-mono">
                            {toPersianDigits(st.makeupCredits || 0)}
                          </span>
                          <button
                            onClick={() =>
                              updateStudent(st.id, {
                                makeupCredits: (st.makeupCredits || 0) + 1,
                              })
                            }
                            className="text-[var(--success-strong)] hover:text-success-strong hover:bg-success-soft rounded-full p-0.5 transition-colors"
                          >
                            <PlusCircle size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentForNote(st);
                            setNoteFormGeneral(st.notes || "");
                            setNoteFormFinancial(st.financialNote || "");
                          }}
                          className={`p-1.5 rounded-lg transition-colors inline-flex ${
                            st.notes || st.financialNote
                              ? "bg-accent-soft text-accent-strong hover:bg-accent hover:text-on-solid"
                              : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]/80 hover:text-[var(--text-secondary)]"
                          }`}
                          title="مشاهده / ویرایش یادداشت‌ها"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                          </svg>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedStudentForExtraClass(st);
                              setExtraClassDate(getTodayString());
                              setExtraClassTime(st.classTime || "16:00");
                              setExtraClassTeacherId(st.teacherId);
                              setExtraClassDuration(st.classDurationMinutes || 30);
                              setExtraClassNotes("");
                              const defaultPrice =
                                st.sessionFeeOverride ??
                                (st.targetSessions > 0
                                  ? Math.round(
                                      st.tuitionFee / st.targetSessions,
                                    )
                                  : (teacherMap.get(st.teacherId)?.hourlyRate ??
                                    db.settings.defaultPricePerSession ??
                                    350000));
                              setExtraClassSessionPrice(defaultPrice);
                            }}
                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-success-strong hover:bg-success-soft transition-colors"
                            title="ثبت کلاس فوق‌العاده / جبرانی"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedStudentForDetail(st)}
                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-accent-strong hover:bg-accent-soft transition-colors"
                            title="سوابق و تاریخچه"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(st)}
                            className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-danger-strong hover:bg-danger-soft transition-colors"
                            title="حذف هنرجو"
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
          </div>
        )}

        {filteredStudents.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="هنرجو"
            className="mt-4"
          />
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT STUDENT ================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-7xl md:aspect-video flex flex-col bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingStudent
                  ? `ویرایش اطلاعات هنرجو: ${editingStudent.name}`
                  : "ثبت نام هنرجو"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="studentForm"
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs"
                >
                  ذخیره اطلاعات
                </button>
              </div>
            </div>
            <form
              id="studentForm"
              onSubmit={handleSaveStudent}
              className="flex-1 min-h-0 mt-4 grid md:grid-cols-12 gap-6 overflow-hidden text-xs"
            >
              {/* RIGHT HALF: Form fields */}
              <div
                className="md:col-span-6 flex flex-col h-full overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:hidden space-y-4"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="relative col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      نام و نام خانوادگی:
                    </label>
                    <input
                      type="text"
                      dir="auto"
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        setShowNameSuggestions(true);
                      }}
                      onFocus={() => setShowNameSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowNameSuggestions(false), 200)
                      }
                      placeholder="مثال: علی رضایی"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      required
                    />
                    {!editingStudent &&
                      showNameSuggestions &&
                      formName.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50">
                          {Array.from(
                            new Map(
                              db.students
                                .filter(
                                  (s) =>
                                    s.status !== "active" &&
                                    s.name
                                      .toLowerCase()
                                      .includes(formName.toLowerCase()),
                                )
                                .map((s) => [
                                  s.nationalId || s.phone || s.id,
                                  s,
                                ]),
                            ).values(),
                          ).map((s) => (
                            <div
                              key={s.id}
                              className="p-2 hover:bg-accent/10 cursor-pointer text-xs flex justify-between border-b border-[var(--border-color)] last:border-0 items-center"
                              onClick={() => {
                                setFormName(s.name);
                                setFormEnglishName(s.englishName || "");
                                setFormNationalId(s.nationalId || "");
                                setFormPhones(
                                  s.phones || [
                                    { title: "موبایل", number: s.phone },
                                  ],
                                );
                                setShowNameSuggestions(false);
                                setFormInstrument(s.instrument || "");
                                if (s.teacherId) {
                                  handleTeacherChange(s.teacherId);
                                } else {
                                  setFormTeacherId("");
                                }
                              }}
                            >
                              <div>
                                <div className="font-bold">{s.name}</div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                  {s.phone}
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-accent-soft text-accent-strong">
                                هنرجوی سابق
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* English Name */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      نام انگلیسی (برای گواهی):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formEnglishName}
                      onChange={(e) => setFormEnglishName(e.target.value)}
                      placeholder="e.g. Ali Rezaei"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-left"
                    />
                  </div>

                  {/* National ID */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      کد ملی:
                    </label>
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={formNationalId}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setFormNationalId(val);
                        }}
                        placeholder="۱۰ رقم (فقط اعداد)"
                        className={`w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border text-[var(--text-primary)] font-mono transition-colors ${formNationalId.length > 0 && formNationalId.length !== 10 ? "border-danger focus:ring-danger" : "border-[var(--border-color)]"}`}
                        maxLength={10}
                        required
                      />
                      {formNationalId.length > 0 &&
                        formNationalId.length !== 10 && (
                          <span className="text-[10px] text-danger px-1">
                            کد ملی باید ۱۰ رقم باشد.
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Registered Date */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      تاریخ ثبت‌نام:
                    </label>
                    <ShamsiDatePicker
                      value={formRegisteredDate}
                      onChange={(newDate) => {
                        setFormRegisteredDate(newDate);
                        calculateProRatedTuition(
                          newDate,
                          formWeeklySlots,
                          formTeacherId,
                          formSessionFeeOverride,
                        );
                      }}
                      className="w-full"
                      buttonClassName="w-full px-3 py-2 min-h-[42px] h-[42px] rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium hover:border-accent-border transition-all"
                    />
                  </div>
                  {/* Instrument */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      ساز / رشته:
                    </label>
                    <CustomSelect
                      dir="auto"
                      value={formInstrument}
                      onChange={(e) => {
                        const newInst = e.target.value;
                        setFormInstrument(newInst);
                        const currentTeacher = db.teachers.find(
                          (t) => t.id === formTeacherId,
                        );
                        if (
                          !currentTeacher ||
                          !currentTeacher.instruments.includes(newInst)
                        ) {
                          const validTeachers = db.teachers.filter(
                            (t) =>
                              t.status === "active" &&
                              t.instruments.includes(newInst),
                          );
                          if (validTeachers.length > 0) {
                            handleTeacherChange(validTeachers[0].id);
                          } else {
                            setFormTeacherId("");
                          }
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
                      required
                    >
                      {(db.settings.instrumentsList || DEFAULT_INSTRUMENTS).map(
                        (inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ),
                      )}
                    </CustomSelect>
                  </div>

                  {/* Teacher */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      نام استاد:
                    </label>
                    <CustomSelect
                      dir="auto"
                      value={formTeacherId}
                      onChange={(e) => handleTeacherChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
                      required
                    >
                      <option value="" disabled>
                        انتخاب استاد
                      </option>
                      {db.teachers
                        .filter(
                          (t) =>
                            t.status === "active" &&
                            (!formInstrument ||
                              t.instruments.includes(formInstrument)),
                        )
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </CustomSelect>
                    {formTeacherId && (
                      <div className="mt-1.5 text-[11px] flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Calendar className="w-3.5 h-3.5 text-accent-strong shrink-0" />
                        <span>روزهای حضور استاد در آموزشگاه:</span>
                        <span className="font-bold text-accent-strong">
                          {(() => {
                            const t = teacherMap.get(formTeacherId);
                            if (!t || !t.availableDays || t.availableDays.length === 0) {
                              return "همه روزهای هفته";
                            }
                            return t.availableDays.join("، ");
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Phones */}
                  <div className="col-span-2 p-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-tertiary)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-[var(--text-primary)]">
                        شماره‌های تماس
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormPhones([
                            ...formPhones,
                            { title: "", number: "" },
                          ])
                        }
                        className="text-xs text-accent-strong hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        افزودن شماره
                      </button>
                    </div>
                    {formPhones.map((phone, index) => {
                      const isValidPhone =
                        phone.number.length === 0 || phone.number.length === 11;
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <input
                            type="text"
                            placeholder="عنوان (مثال: موبایل مادر)"
                            dir="auto"
                            value={phone.title}
                            onChange={(e) => {
                              const newPhones = [...formPhones];
                              newPhones[index].title = e.target.value;
                              setFormPhones(newPhones);
                            }}
                            className="w-1/3 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                            required
                          />
                          <div className="flex-1 flex flex-col gap-1">
                            <input
                              type="tel"
                              placeholder="09..."
                              value={phone.number}
                              onChange={(e) => {
                                const val = toEnglishDigits(e.target.value)
                                  .replace(/\D/g, "")
                                  .slice(0, 11);
                                const newPhones = [...formPhones];
                                newPhones[index].number = val;
                                setFormPhones(newPhones);
                              }}
                              maxLength={11}
                              className={`w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border text-[var(--text-primary)] font-mono text-left transition-colors ${!isValidPhone ? "border-danger focus:ring-danger" : "border-[var(--border-color)]"}`}
                              dir="ltr"
                              required
                            />
                            {!isValidPhone && (
                              <span className="text-[10px] text-danger px-1">
                                شماره تماس باید ۱۱ رقم باشد.
                              </span>
                            )}
                          </div>
                          {formPhones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newPhones = formPhones.filter(
                                  (_, i) => i !== index,
                                );
                                setFormPhones(newPhones);
                              }}
                              className="p-2 text-danger-strong hover:bg-danger-soft rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly Slots */}
                  <div className="col-span-2 p-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-tertiary)] space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <label className="font-semibold text-[var(--text-primary)] text-xs">
                          زمان‌های کلاس در هفته
                        </label>
                        {formTeacherId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-soft text-accent-strong font-medium">
                            روزهای حضور استاد: {getTeacherAvailableDays(formTeacherId).join("، ")}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSlot()}
                        className="text-[10px] px-2 py-1 bg-accent-soft text-accent-strong rounded-lg hover:bg-accent-hover hover:text-on-solid transition-colors font-bold"
                      >
                        + افزودن جلسه دیگر
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formWeeklySlots.map((slot, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                              <span className="text-[10px] text-[var(--text-muted)] w-8">
                                روز:
                              </span>
                              <CustomSelect
                                dir="auto"
                                value={slot.day}
                                onChange={(e) =>
                                  handleUpdateSlot(idx, "day", e.target.value)
                                }
                                className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
                              >
                                {(() => {
                                  const teacherDays = getTeacherAvailableDays(formTeacherId);
                                  const dayOptions = teacherDays.includes(slot.day)
                                    ? teacherDays
                                    : [slot.day, ...teacherDays];
                                  return dayOptions.map((d) => (
                                    <option key={d} value={d}>
                                      {d} {!teacherDays.includes(d) ? "(خارج از روزهای حضور استاد)" : ""}
                                    </option>
                                  ));
                                })()}
                              </CustomSelect>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-[var(--text-muted)] w-8">
                                ساعت:
                              </span>
                              <TimeSelector24h
                                value={slot.time}
                                onChange={(val) =>
                                  handleUpdateSlot(idx, "time", val)
                                }
                                className="w-[66px] py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono font-medium"
                              />
                            </div>
                            <div className="mr-auto flex items-center gap-2">
                              {formWeeklySlots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(idx)}
                                  className="text-danger-strong hover:text-danger-strong text-xs flex items-center gap-1 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف جلسه</span>
                                </button>
                              )}
                              <span className="px-2.5 py-1 rounded-lg bg-accent-soft text-accent-strong text-xs font-bold font-mono">
                                {toPersianDigits(idx + 1)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conflict Warnings */}
                  {currentConflicts.length > 0 && (
                    <div className="col-span-2 p-3 bg-danger-soft border border-danger-strong rounded-xl text-danger-strong text-xs font-bold space-y-1">
                      <div>تداخل زمانی با کلاس‌های زیر یافت شد:</div>
                      <ul className="list-disc pr-5">
                        {currentConflicts.map((c, i) => (
                          <li key={i}>
                            {c.slot.day} ساعت {c.slot.time} با هنرجو{" "}
                            {c.conflictingStudentName} (زمان اصلی:{" "}
                            {c.conflictingTime})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Sessions */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      تعداد جلسات ترم:
                    </label>
                    <input
                      type="number"
                      value={formTargetSessions}
                      onChange={(e) => {
                        const sessions = Number(e.target.value);
                        setFormTargetSessions(sessions);

                        // Auto-calculate tuition fee
                        const teacher =
                          teacherMap.get(formTeacherId) || db.teachers[0];
                        const sessionRate =
                          formSessionFeeOverride !== ""
                            ? Number(formSessionFeeOverride)
                            : teacher?.hourlyRate ||
                              db.settings.defaultPricePerSession ||
                              350000;
                        setFormTuitionFee(sessions * sessionRate);
                      }}
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Session Duration */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      مدت جلسه:
                    </label>
                    <div className="flex bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormClassDurationMinutes(30)}
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${formClassDurationMinutes === 30 ? "bg-primary text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"}`}
                      >
                        ۳۰ دقیقه
                      </button>
                      <div className="w-px bg-[var(--border-color)]"></div>
                      <button
                        type="button"
                        onClick={() => setFormClassDurationMinutes(60)}
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${formClassDurationMinutes === 60 ? "bg-primary text-[var(--text-paimary)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"}`}
                      >
                        ۶۰ دقیقه
                      </button>
                    </div>
                  </div>

                  {/* Session Fee Override */}
                  <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-[var(--text-primary)]">
                        شهریه هر جلسه (تومان):
                      </label>
                      {teacherMap.get(formTeacherId) && (
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          نرخ پایه استاد:{" "}
                          {formatToman(
                            teacherMap.get(formTeacherId)!.hourlyRate,
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        formSessionFeeOverride === ""
                          ? ""
                          : new Intl.NumberFormat("fa-IR").format(
                              Number(formSessionFeeOverride),
                            )
                      }
                      onChange={(e) => {
                        const engDigits = toEnglishDigits(e.target.value);
                        const val = engDigits.replace(/[^0-9]/g, "");
                        const newOverride = val ? parseInt(val, 10) : "";
                        setFormSessionFeeOverride(newOverride);

                        // Auto-calculate tuition fee
                        const teacher =
                          teacherMap.get(formTeacherId) || db.teachers[0];
                        const sessionRate =
                          newOverride !== ""
                            ? newOverride
                            : teacher?.hourlyRate ||
                              db.settings.defaultPricePerSession ||
                              350000;
                        setFormTuitionFee(formTargetSessions * sessionRate);
                      }}
                      placeholder={
                        teacherMap.get(formTeacherId)
                          ? `پیش‌فرض: ${formatToman(teacherMap.get(formTeacherId)!.hourlyRate, false)}`
                          : "پیش‌فرض استاد"
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold"
                    />
                  </div>

                  {/* Tuition */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      شهریه ترم (تومان):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        formTuitionFee === 0
                          ? "0"
                          : new Intl.NumberFormat("fa-IR").format(
                              formTuitionFee,
                            )
                      }
                      onChange={(e) => {
                        const engDigits = toEnglishDigits(e.target.value);
                        const val = engDigits.replace(/[^0-9]/g, "");
                        setFormTuitionFee(val ? parseInt(val, 10) : 0);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Paid Amount */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      مبلغ دریافتی تا کنون:
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        formPaidAmount === 0
                          ? "0"
                          : new Intl.NumberFormat("fa-IR").format(
                              formPaidAmount,
                            )
                      }
                      onChange={(e) => {
                        const engDigits = toEnglishDigits(e.target.value);
                        const val = engDigits.replace(/[^0-9]/g, "");
                        setFormPaidAmount(val ? parseInt(val, 10) : 0);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      یادداشت و توضیحات آموزشی:
                    </label>
                    <textarea
                      dir="auto"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="سطح، کتاب‌های در دست تدریس، متد و توضیحات تکمیلی..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* LEFT HALF: Calendar (Non-scrollable wrapper) */}
              <div className="md:col-span-6 h-full overflow-hidden bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] flex flex-col p-2">
                {formTeacherId ? (
                  <div className="flex-1 overflow-hidden min-h-[400px]">
                    <TeacherWeeklyCalendar
                      teacherId={formTeacherId}
                      allStudents={db.students}
                      currentStudentId={editingStudent?.id}
                      extraClasses={db.attendance
                        .filter(
                          (a) =>
                            a.isExtraClass &&
                            a.teacherId === formTeacherId &&
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
                        })}
                      proposedSlots={formWeeklySlots.map((s) => ({
                        ...s,
                        durationMinutes: formClassDurationMinutes,
                      }))}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-6 text-right h-full">
                    <Calendar className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-semibold mb-1">
                      هیچ استادی انتخاب نشده است
                    </span>
                    <span className="text-xs opacity-70">
                      لطفاً از فرم سمت راست یک استاد را انتخاب کنید تا تقویم
                      هفتگی و زمان‌های خالی او در این بخش نمایش داده شود.
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT ================= */}
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
                  form="paymentForm"
                  className="px-4 py-1.5 rounded-xl bg-success text-on-solid font-semibold hover:bg-success/90 text-xs"
                >
                  ثبت تراکنش و تسویه
                </button>
              </div>
            </div>

            <form
              id="paymentForm"
              onSubmit={handleRecordPaymentSubmit}
              className="space-y-3.5 text-xs"
            >
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-primary)]">
                  هنرجو: {selectedStudentForPayment.name}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">
                  شهریه کل: {formatToman(selectedStudentForPayment.tuitionFee)}{" "}
                  | پرداخت قبلی:{" "}
                  {formatToman(selectedStudentForPayment.paidAmount)}
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
                  مبلغ دریافتی جدید (تومان):
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
                  dir="auto"
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
                  شماره پیگیری / شماره ارجاع تراکنش:
                </label>
                <input
                  type="text"
                  value={paymentReceipt}
                  onChange={(e) => setPaymentReceipt(e.target.value)}
                  placeholder="مثال: POS-984210"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT DETAILED PROFILE & AUDIT LOGS ================= */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  سوابق هنرجو: {selectedStudentForDetail.name}
                </h3>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  ساز: {selectedStudentForDetail.instrument} | استاد:{" "}
                  {teacherMap.get(selectedStudentForDetail.teacherId)?.name}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-right">
                <div className="text-[var(--text-muted)]">پیشرفت دوره</div>
                <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  {toPersianDigits(selectedStudentForDetail.attendedSessions)}{" "}
                  از {toPersianDigits(selectedStudentForDetail.targetSessions)}{" "}
                  جلسه
                </div>
              </div>

              <div className="p-3 rounded-xl bg-warning-soft border border-warning-border text-right text-warning-strong">
                <div className="text-[var(--text-muted)]">
                  اعتبار جبرانی موجود
                </div>
                <div className="text-base font-bold mt-0.5">
                  {toPersianDigits(selectedStudentForDetail.makeupCredits)} جلسه
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-right">
                <div className="text-[var(--text-muted)]">مانده بدهی شهریه</div>
                <div className="text-base font-bold text-danger-strong mt-0.5">
                  {formatToman(
                    selectedStudentForDetail.tuitionFee -
                      selectedStudentForDetail.paidAmount,
                  )}
                </div>
              </div>
            </div>

            {/* Attendance History for this Student */}
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-strong" />
                <span>سوابق جلسات و حضور و غیاب هنرجو</span>
              </h4>
              <div className="max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] text-xs">
                {db.attendance
                  .filter((a) => a.studentId === selectedStudentForDetail.id)
                  .map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {toJalaliDateString(att.date)}
                        </span>
                        <span className="text-[var(--text-muted)] mr-2 font-mono">
                          ساعت {toPersianDigits(att.time)}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          att.status === "present"
                            ? "bg-success-soft border-success-border text-success-strong"
                            : att.status === "excused"
                              ? "bg-warning-soft border-warning-border text-warning-strong"
                              : att.status === "teacher_cancelled"
                                ? "bg-info-soft border-info-border text-info-strong"
                                : att.status === "no_show"
                                  ? "bg-danger-soft border-danger-border text-danger-strong"
                                  : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]"
                        }`}
                      >
                        {att.status === "present"
                          ? "حاضر"
                          : att.status === "excused"
                            ? "غیبت موجه (+۱ جبرانی)"
                            : att.status === "teacher_cancelled"
                              ? "کنسلی استاد (+۱ جبرانی)"
                              : att.status === "no_show"
                                ? "غیبت غیرموجه"
                                : "ثبت‌نشده"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Credit Audit Logs for this Student */}
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-warning-strong" />
                <span> تاریخچه تغییرات اعتبار جبرانی</span>
              </h4>
              <div className="max-h-36 overflow-y-auto border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] text-xs">
                {db.creditLogs
                  .filter((c) => c.studentId === selectedStudentForDetail.id)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {toJalaliDateString(log.date)}
                        </span>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                          {log.reason}
                        </div>
                      </div>
                      <div className="text-left font-mono font-bold">
                        <span
                          className={
                            log.change > 0
                              ? "text-success-strong font-bold"
                              : "text-danger-strong font-bold"
                          }
                        >
                          {log.change > 0
                            ? `+${toPersianDigits(log.change)}`
                            : toPersianDigits(log.change)}{" "}
                          جلسه
                        </span>
                        <div className="text-xs text-[var(--text-muted)] font-semibold">
                          موجودی: {toPersianDigits(log.newBalance)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXTRA CLASS MANAGEMENT (کلاس فوق‌العاده / جبرانی) ================= */}
      {selectedStudentForExtraClass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-7xl md:aspect-video flex flex-col bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-accent-strong" />
                <span>
                  مدیریت کلاس‌های فوق‌العاده:{" "}
                  {selectedStudentForExtraClass.name}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForExtraClass(null)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-tertiary)]/80"
                >
                  بستن
                </button>
                <button
                  type="submit"
                  form="extraClassForm"
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs"
                >
                  ثبت مورد جدید
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 mt-4 grid md:grid-cols-12 gap-6 overflow-hidden">
              <div
                className="md:col-span-4 flex flex-col gap-8 h-full overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Existing Extra Classes List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>سوابق کلاس‌های فوق‌العاده</span>
                  </h4>
                  {(() => {
                    const extraClasses = db.attendance.filter(
                      (a) =>
                        a.studentId === selectedStudentForExtraClass.id &&
                        (a.isExtraClass || a.id.startsWith("att-extra-")),
                    );
                    if (extraClasses.length === 0) {
                      return (
                        <div className="text-[11px] text-[var(--text-muted)] p-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] text-right">
                          هیچ کلاس فوق‌العاده‌ای ثبت نشده است.
                        </div>
                      );
                    }
                    return (
                      <div className="max-h-60 overflow-y-auto border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] text-xs">
                        {extraClasses.map((rec) => {
                          const isEditing = editingExtraClassId === rec.id;
                          if (isEditing) {
                            return (
                              <div
                                key={rec.id}
                                className="p-3 bg-[var(--bg-tertiary)] space-y-3"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                                      تاریخ:
                                    </label>
                                    <ShamsiDatePicker
                                      value={editExtraClassDate}
                                      onChange={setEditExtraClassDate}
                                      placeholder="تاریخ"
                                      className="w-full"
                                      buttonClassName="w-full px-2 py-1.5 min-h-[34px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs font-medium"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                                      ساعت:
                                    </label>
                                    <TimeSelector24h
                                      value={editExtraClassTime}
                                      onChange={(val) =>
                                        setEditExtraClassTime(val)
                                      }
                                      className="w-full px-2 py-1.5 h-[34px] rounded-lg border border-[var(--border-color)] font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                                      مدت:
                                    </label>
                                    <div className="flex bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden h-[34px] p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditExtraClassDuration(30)}
                                        className={`flex-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                          editExtraClassDuration === 30
                                            ? "bg-accent text-on-solid shadow-xs"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                      >
                                        ۳۰ د
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditExtraClassDuration(60)}
                                        className={`flex-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                          editExtraClassDuration === 60
                                            ? "bg-accent text-on-solid shadow-xs"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        }`}
                                      >
                                        ۶۰ د
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                                    استاد:
                                  </label>
                                  <CustomSelect
                                    dir="auto"
                                    value={editExtraClassTeacherId}
                                    onChange={(e) =>
                                      setEditExtraClassTeacherId(e.target.value)
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--border-color)] font-medium"
                                  >
                                    {db.teachers.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </CustomSelect>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                                    توضیحات:
                                  </label>
                                  <input
                                    type="text"
                                    value={editExtraClassNotes}
                                    onChange={(e) =>
                                      setEditExtraClassNotes(e.target.value)
                                    }
                                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--border-color)]"
                                  />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                  <button
                                    onClick={() => setEditingExtraClassId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                                  >
                                    لغو
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateExtraClass(rec.id, {
                                        date: editExtraClassDate,
                                        time: editExtraClassTime,
                                        teacherId: editExtraClassTeacherId,
                                        notes: editExtraClassNotes,
                                        durationMinutes: editExtraClassDuration,
                                      });
                                      setEditingExtraClassId(null);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-accent text-on-solid"
                                  >
                                    ذخیره
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          const isPast = rec.date < getTodayString();
                          return (
                            <div
                              key={rec.id}
                              className="p-2.5 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                  <span>
                                    {toJalaliDateString(rec.date)} - ساعت{" "}
                                    {toPersianDigits(rec.time)}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                                    <span>
                                      {rec.durationMinutes === 60 ? "۶۰ دقیقه" : "۳۰ دقیقه"}
                                    </span>
                                  </span>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-1.5">
                                  {rec.teacherId &&
                                    teacherMap.get(rec.teacherId) && (
                                      <span>
                                        استاد:{" "}
                                        {teacherMap.get(rec.teacherId)!.name}
                                      </span>
                                    )}
                                  {rec.sessionPrice !== undefined && (
                                    <span className="font-mono font-semibold text-accent-strong">
                                      ({formatToman(rec.sessionPrice)})
                                    </span>
                                  )}
                                  {rec.notes && <span>• {rec.notes}</span>}
                                </div>
                              </div>
                              {!isPast && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingExtraClassId(rec.id);
                                      setEditExtraClassDate(rec.date);
                                      setEditExtraClassTime(rec.time);
                                      setEditExtraClassDuration(
                                        rec.durationMinutes ||
                                          selectedStudentForExtraClass.classDurationMinutes ||
                                          30,
                                      );
                                      setEditExtraClassTeacherId(rec.teacherId);
                                      setEditExtraClassNotes(rec.notes || "");
                                    }}
                                    className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] text-accent-strong hover:bg-accent-soft hover:text-accent-strong transition-colors"
                                    title="ویرایش کلاس"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExtraClassToDelete(rec.id);
                                    }}
                                    className="p-1.5 rounded-lg bg-danger-soft text-danger-strong hover:bg-danger-hover hover:text-on-solid transition-colors"
                                    title="حذف کلاس"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Add New Extra Class Form */}
                <div className="pt-2 border-t md:border-t-0 border-[var(--border-color)]">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت کلاس فوق‌العاده جدید</span>
                  </h4>
                  <form
                    id="extraClassForm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const targetTeacher =
                        extraClassTeacherId ||
                        selectedStudentForExtraClass.teacherId;
                      const dayName = getPersianWeekdayFromDate(extraClassDate);
                      const todayStr = getTodayString();
                      const upcomingExtraClasses = db.attendance
                        .filter(
                          (a) =>
                            a.isExtraClass &&
                            a.teacherId === targetTeacher &&
                            a.date >= todayStr,
                        )
                        .map((a) => {
                          const st = db.students.find(
                            (s) => s.id === a.studentId,
                          );
                          return {
                            day: getPersianWeekdayFromDate(a.date),
                            time: a.time,
                            studentName: st?.name || "نامشخص",
                            durationMinutes: a.durationMinutes || st?.classDurationMinutes || 30,
                          };
                        });

                      const extraConflicts =
                        db.settings.enableConflictDetection !== false
                          ? checkSlotConflict(
                              targetTeacher,
                              [
                                {
                                  day: dayName,
                                  time: extraClassTime,
                                  durationMinutes: extraClassDuration,
                                },
                              ],
                              db.students,
                              undefined,
                              upcomingExtraClasses,
                            )
                          : [];
                      if (extraConflicts.length > 0) {
                        showToast(
                          "تداخل زمانی وجود دارد! لطفاً زمان دیگری را انتخاب کنید.",
                          "error",
                        );
                        return;
                      }

                      addExtraClass({
                        studentId: selectedStudentForExtraClass.id,
                        date: extraClassDate,
                        time: extraClassTime,
                        teacherId: targetTeacher,
                        notes: extraClassNotes,
                        durationMinutes: extraClassDuration,
                        sessionPrice:
                          typeof extraClassSessionPrice === "number"
                            ? extraClassSessionPrice
                            : undefined,
                      });
                      setExtraClassNotes("");
                    }}
                    className="space-y-3.5 text-xs"
                  >
                    {/* Credit status notification */}
                    <div className="p-3 rounded-xl bg-accent-soft/70 border border-accent-border text-[11px] text-accent-strong leading-relaxed">
                      {selectedStudentForExtraClass.makeupCredits > 0 ? (
                        <span>
                          ✅ این هنرجو دارای{" "}
                          <strong>
                            {toPersianDigits(
                              selectedStudentForExtraClass.makeupCredits,
                            )}{" "}
                            جلسه اعتبار جبرانی
                          </strong>{" "}
                          است. با ثبت این جلسه، ۱ جلسه از اعتبار جبرانی او کسر
                          می‌شود.
                        </span>
                      ) : (
                        <span>
                          ℹ️ اعتبار جبرانی این هنرجو <strong>صفر</strong> است.
                          با ثبت این جلسه، مبلغ{" "}
                          <strong>
                            {formatToman(
                              typeof extraClassSessionPrice === "number"
                                ? extraClassSessionPrice
                                : (extraClassTeacherId ||
                                      selectedStudentForExtraClass.teacherId) ===
                                    selectedStudentForExtraClass.teacherId
                                  ? (selectedStudentForExtraClass.sessionFeeOverride ??
                                    (selectedStudentForExtraClass.targetSessions >
                                    0
                                      ? Math.round(
                                          selectedStudentForExtraClass.tuitionFee /
                                            selectedStudentForExtraClass.targetSessions,
                                        )
                                      : (teacherMap.get(
                                          selectedStudentForExtraClass.teacherId,
                                        )?.hourlyRate ??
                                        db.settings.defaultPricePerSession ??
                                        350000)))
                                  : (teacherMap.get(
                                      extraClassTeacherId ||
                                        selectedStudentForExtraClass.teacherId,
                                    )?.hourlyRate ??
                                    db.settings.defaultPricePerSession ??
                                    350000),
                            )}
                          </strong>{" "}
                          به بدهی شهریه و ۱ جلسه به تعداد کل جلسات دوره او اضافه
                          خواهد شد.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Date */}
                      <div>
                        <label className="block font-semibold text-[var(--text-primary)] mb-1">
                          تاریخ برگزاری:
                        </label>
                        <ShamsiDatePicker
                          value={extraClassDate}
                          onChange={setExtraClassDate}
                          placeholder="انتخاب تاریخ"
                          className="w-full"
                          buttonClassName="w-full px-3 py-2 min-h-[42px] h-[42px] rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium hover:border-accent-border transition-all"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block font-semibold text-[var(--text-primary)] mb-1">
                          ساعت برگزاری:
                        </label>
                        <TimeSelector24h
                          value={extraClassTime}
                          onChange={(val) => setExtraClassTime(val)}
                          className="w-full px-2.5 py-2 h-[42px] rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
                        />
                      </div>

                      {/* Duration (30 / 60 mins) */}
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-accent-strong" />
                            <span>مدت زمان جلسه فوق‌العاده / جبرانی:</span>
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] font-normal">
                            {extraClassDuration === 60
                              ? "جلسه کامل (۶۰ دقیقه)"
                              : "نیم جلسه استاندارد (۳۰ دقیقه)"}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-[var(--bg-tertiary)] p-1 rounded-2xl border border-[var(--border-color)]">
                          <button
                            type="button"
                            onClick={() => {
                              setExtraClassDuration(30);
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              extraClassDuration === 30
                                ? "bg-accent text-on-solid shadow-xs"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>۳۰ دقیقه</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExtraClassDuration(60);
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              extraClassDuration === 60
                                ? "bg-accent text-on-solid shadow-xs"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>۶۰ دقیقه (۱ ساعت)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Teacher */}
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        استاد مدرس:
                      </label>
                      <CustomSelect
                        dir="auto"
                        value={
                          extraClassTeacherId ||
                          selectedStudentForExtraClass.teacherId
                        }
                        onChange={(e) => {
                          const newTeacherId = e.target.value;
                          setExtraClassTeacherId(newTeacherId);
                          if (
                            newTeacherId ===
                            selectedStudentForExtraClass.teacherId
                          ) {
                            const defaultPrice =
                              selectedStudentForExtraClass.sessionFeeOverride ??
                              (selectedStudentForExtraClass.targetSessions > 0
                                ? Math.round(
                                    selectedStudentForExtraClass.tuitionFee /
                                      selectedStudentForExtraClass.targetSessions,
                                  )
                                : (teacherMap.get(
                                    selectedStudentForExtraClass.teacherId,
                                  )?.hourlyRate ??
                                  db.settings.defaultPricePerSession ??
                                  350000));
                            setExtraClassSessionPrice(defaultPrice);
                          } else {
                            const otherTeacher = teacherMap.get(newTeacherId);
                            const defaultRate =
                              otherTeacher?.hourlyRate ??
                              db.settings.defaultPricePerSession ??
                              350000;
                            setExtraClassSessionPrice(defaultRate);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium"
                      >
                        {db.teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.instruments.join("، ")})
                          </option>
                        ))}
                      </CustomSelect>
                    </div>

                    {/* Session Price */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-[var(--text-primary)]">
                          شهریه هر جلسه (تومان):
                        </label>
                        {teacherMap.get(
                          extraClassTeacherId ||
                            selectedStudentForExtraClass.teacherId,
                        ) && (
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            {(extraClassTeacherId ||
                              selectedStudentForExtraClass.teacherId) ===
                            selectedStudentForExtraClass.teacherId
                              ? `نرخ فعلی هنرجو: ${formatToman(
                                  selectedStudentForExtraClass.sessionFeeOverride ??
                                    (selectedStudentForExtraClass.targetSessions >
                                    0
                                      ? Math.round(
                                          selectedStudentForExtraClass.tuitionFee /
                                            selectedStudentForExtraClass.targetSessions,
                                        )
                                      : teacherMap.get(
                                          selectedStudentForExtraClass.teacherId,
                                        )!.hourlyRate),
                                )}`
                              : `نرخ پایه استاد: ${formatToman(
                                  teacherMap.get(
                                    extraClassTeacherId ||
                                      selectedStudentForExtraClass.teacherId,
                                  )!.hourlyRate,
                                )}`}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          extraClassSessionPrice === ""
                            ? ""
                            : new Intl.NumberFormat("fa-IR").format(
                                Number(extraClassSessionPrice),
                              )
                        }
                        onChange={(e) => {
                          const engDigits = toEnglishDigits(e.target.value);
                          const val = engDigits.replace(/[^0-9]/g, "");
                          setExtraClassSessionPrice(
                            val ? parseInt(val, 10) : "",
                          );
                        }}
                        placeholder={
                          (extraClassTeacherId ||
                            selectedStudentForExtraClass.teacherId) ===
                          selectedStudentForExtraClass.teacherId
                            ? `پیش‌فرض: ${formatToman(
                                selectedStudentForExtraClass.sessionFeeOverride ??
                                  (selectedStudentForExtraClass.targetSessions >
                                  0
                                    ? Math.round(
                                        selectedStudentForExtraClass.tuitionFee /
                                          selectedStudentForExtraClass.targetSessions,
                                      )
                                    : (teacherMap.get(
                                        selectedStudentForExtraClass.teacherId,
                                      )?.hourlyRate ??
                                      db.settings.defaultPricePerSession ??
                                      350000)),
                                false,
                              )}`
                            : `پیش‌فرض: ${formatToman(
                                teacherMap.get(
                                  extraClassTeacherId ||
                                    selectedStudentForExtraClass.teacherId,
                                )?.hourlyRate ??
                                  db.settings.defaultPricePerSession ??
                                  350000,
                                false,
                              )}`
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        توضیحات:
                      </label>
                      <input
                        type="text"
                        value={extraClassNotes}
                        onChange={(e) => setExtraClassNotes(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      />
                    </div>

                    {db.settings.enableConflictDetection !== false &&
                      (() => {
                        const targetTeacher =
                          extraClassTeacherId ||
                          selectedStudentForExtraClass.teacherId;
                        const dayName =
                          getPersianWeekdayFromDate(extraClassDate);
                        const todayStr = getTodayString();
                        const upcomingExtraClasses = db.attendance
                          .filter(
                            (a) =>
                              a.isExtraClass &&
                              a.teacherId === targetTeacher &&
                              a.date >= todayStr,
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
                          });

                        const extraConflicts = checkSlotConflict(
                          targetTeacher,
                          [
                            {
                              day: dayName,
                              time: extraClassTime,
                              durationMinutes: extraClassDuration,
                            },
                          ],
                          db.students,
                          undefined,
                          upcomingExtraClasses,
                        );
                        return (
                          <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                            {extraConflicts.length > 0 && (
                              <div className="p-3 bg-danger-soft border border-danger-strong rounded-xl text-danger-strong text-xs font-bold space-y-1 mb-3">
                                <div>تداخل زمانی با کلاس‌های زیر یافت شد:</div>
                                <ul className="list-disc pr-5">
                                  {extraConflicts.map((c, i) => (
                                    <li key={i}>
                                      {c.slot.day} ساعت {toPersianDigits(c.slot.time)} با هنرجو{" "}
                                      {c.conflictingStudentName} (زمان کلاس متداخل:{" "}
                                      {toPersianDigits(c.conflictingTime)})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </form>
                </div>
              </div>

              {/* Calendar Column */}
              <div className="md:col-span-8 flex flex-col justify-start h-full pb-4">
                {(() => {
                  const targetTeacher =
                    extraClassTeacherId ||
                    selectedStudentForExtraClass.teacherId;
                  const dayName = getPersianWeekdayFromDate(extraClassDate);
                  const todayStr = getTodayString();
                  const upcomingExtraClasses = db.attendance
                    .filter(
                      (a) =>
                        a.isExtraClass &&
                        a.teacherId === targetTeacher &&
                        a.date >= todayStr,
                    )
                    .map((a) => {
                      const st = db.students.find((s) => s.id === a.studentId);
                      return {
                        day: getPersianWeekdayFromDate(a.date),
                        time: a.time,
                        studentName: st?.name || "نامشخص",
                        durationMinutes:
                          a.durationMinutes ||
                          st?.classDurationMinutes ||
                          30,
                      };
                    });

                  return (
                    <TeacherWeeklyCalendar
                      teacherId={targetTeacher}
                      allStudents={db.students}
                      extraClasses={upcomingExtraClasses}
                      proposedSlots={[
                        {
                          day: dayName,
                          time: extraClassTime,
                          durationMinutes: extraClassDuration,
                        },
                      ]}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-danger-strong font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>تأیید حذف هنرجو</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              آیا از حذف هنرجو «<strong>{studentToDelete.name}</strong>» و کلیه
              سوابق و حضور و غیاب‌های مربوطه اطمینان دارید؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-tertiary)]/80"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-danger-strong text-white text-xs font-semibold hover:opacity-90"
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXTRA CLASS DELETE CONFIRMATION ================= */}
      {extraClassToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-danger-strong font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>تأیید حذف کلاس فوق‌العاده</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              آیا از حذف این کلاس فوق‌العاده و بازگشت اعتبار/شهریه مربوط به آن
              اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setExtraClassToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-tertiary)]/80"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExtraClass(extraClassToDelete);
                  setExtraClassToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-danger-strong text-white text-xs font-semibold hover:opacity-90"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NOTES ================= */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent-strong"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <span>یادداشت‌های هنرجو: {selectedStudentForNote.name}</span>
              </h3>
              <button
                onClick={() => setSelectedStudentForNote(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  یادداشت عمومی:
                </label>
                <textarea
                  dir="auto"
                  value={noteFormGeneral}
                  onChange={(e) => setNoteFormGeneral(e.target.value)}
                  placeholder="نکات آموزشی، رفتاری یا توضیحات کلی در مورد هنرجو..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-border transition-all min-h-[80px]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  یادداشت مالی و سوابق:
                </label>
                <p className="text-[10px] text-[var(--text-muted)] mb-2">
                  تغییرات مربوط به شهریه و واریزی‌ها به صورت خودکار در این بخش
                  ثبت می‌شوند.
                </p>
                <textarea
                  dir="auto"
                  value={noteFormFinancial}
                  onChange={(e) => setNoteFormFinancial(e.target.value)}
                  placeholder="توضیحات مربوط به تخفیف‌ها، شرایط پرداخت یا سوابق مالی..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent-border transition-all min-h-[120px] font-mono leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setSelectedStudentForNote(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--bg-tertiary)]/80 text-xs"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStudent(selectedStudentForNote.id, {
                    notes: noteFormGeneral,
                    financialNote: noteFormFinancial,
                  });
                  setSelectedStudentForNote(null);
                }}
                className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs"
              >
                ذخیره یادداشت‌ها
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
