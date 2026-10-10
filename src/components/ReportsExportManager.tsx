import React, { useState, useRef, useMemo, useEffect } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  Building2,
  CalendarRange,
  Palette,
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  History,
  RefreshCw,
  FileText,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  Save,
  Image as ImageIcon,
  Trash2,
  Plus,
  Monitor,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  Music,
  Sliders,
  ShieldCheck,
  ChevronDown,
  FolderArchive,
} from "lucide-react";
import { exportMultiSheetExcel } from "../utils/excelExport";
import {
  toPersianDigits,
  toJalaliDateString,
  getTodayString,
} from "../utils/persianDate";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";

const THEME_OPTIONS = [
  { value: "light", label: "روشن کلاسیک", colors: "from-[#fffdf8] to-[#f8f7f0]", darkBg: false },
  { value: "dark", label: "تیره شیک", colors: "from-[#121111] to-[#202024]", darkBg: true },
  { value: "fall-1", label: "پاییز ۱ (عقیقی)", colors: "from-[#f5eee5] to-[#b11f37]", darkBg: false },
  { value: "fall-2", label: "پاییز ۲ (خردلی)", colors: "from-[#f2efe9] to-[#e2decb]", darkBg: false },
  { value: "spring-1", label: "بهار ۱ (سبزینه)", colors: "from-[#eef5ee] to-[#dcebdb]", darkBg: false },
  { value: "spring-2", label: "بهار ۲ (بنفشه)", colors: "from-[#f6f4fa] to-[#e9e5f2]", darkBg: false },
  { value: "summer-1", label: "تابستان ۱ (کهربایی)", colors: "from-[#f6f0e2] to-[#ebe0c9]", darkBg: false },
  { value: "summer-2", label: "تابستان ۲ (لاجوردی)", colors: "from-[#eff7fa] to-[#dceef4]", darkBg: false },
  { value: "winter-1", label: "زمستان ۱ (نقره‌ای)", colors: "from-[#eaf1f7] to-[#d7e3ef]", darkBg: false },
  { value: "winter-2", label: "زمستان ۲ (سربی)", colors: "from-[#f2f3f7] to-[#e1e3e8]", darkBg: false },
];

export const ReportsExportManager: React.FC = () => {
  const {
    db,
    theme,
    setTheme,
    exportBackup,
    exportAuditLogs,
    importBackup,
    resetDatabase,
    updateSettings,
    archiveAndResetSemester,
    showToast,
    activeArchiveId,
    setActiveArchiveId,
  } = useAcademy();

  const todayStr = getTodayString();

  // Helper to format dates to Shamsi with Persian digits
  const formatToShamsi = (dateStr?: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
      return toPersianDigits(dateStr);
    }
    return toPersianDigits(toJalaliDateString(dateStr));
  };

  // Archive Dropdown State
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState(false);
  const archiveDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        archiveDropdownRef.current &&
        !archiveDropdownRef.current.contains(event.target as Node)
      ) {
        setIsArchiveDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeArchive = useMemo(
    () => db.archives?.find((a) => a.id === activeArchiveId),
    [db.archives, activeArchiveId],
  );

  // 3 Organized Sub-tabs: Profile & Appearance, Academic & Semesters, Backup & Data
  const [activeTab, setActiveTab] = useState<"profile" | "academic" | "data">("profile");

  // Rollover State
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [rolloverStep, setRolloverStep] = useState<1 | 2>(1);
  const [rolloverFormat, setRolloverFormat] = useState<1 | 2>(1);
  const [rolloverTitle, setRolloverTitle] = useState("");
  const [returningStudentIds, setReturningStudentIds] = useState<string[]>([]);
  const [carryOverFinancials, setCarryOverFinancials] = useState(true);
  const [carryOverCredits, setCarryOverCredits] = useState(false);
  const [trackStudents, setTrackStudents] = useState<any[]>([]);

  // Reset Confirmation Modal State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Excel Date Range State
  const [excelStartDate, setExcelStartDate] = useState("2026-01-01");
  const [excelEndDate, setExcelEndDate] = useState(todayStr);

  // Form Settings State
  const [academyName, setAcademyName] = useState(db.settings.academyName);
  const [managerName, setManagerName] = useState(db.settings.managerName);
  const [phone, setPhone] = useState(db.settings.phone);
  const [address, setAddress] = useState(
    db.settings.address || "تهران، خیابان ولیعصر",
  );
  const [signatureUrl, setSignatureUrl] = useState<string>(
    db.settings.signatureUrl || "",
  );
  const [logoUrl, setLogoUrl] = useState<string>(db.settings.logoUrl || "");

  const [semesterTitle, setSemesterTitle] = useState(
    db.settings.semesterTitle || "ترم بهار ۱۴۰۵",
  );
  const [semesterStartDate, setSemesterStartDate] = useState(
    db.settings.semesterStartDate || getTodayString(),
  );
  const [semesterEndDate, setSemesterEndDate] = useState(
    db.settings.semesterEndDate || "2026-06-20",
  );

  const [semester2Title, setSemester2Title] = useState(
    db.settings.semester2Title || "ترم ۲ ماهه",
  );
  const [semester2StartDate, setSemester2StartDate] = useState(
    db.settings.semester2StartDate || getTodayString(),
  );
  const [semester2EndDate, setSemester2EndDate] = useState(
    db.settings.semester2EndDate || "2026-05-20",
  );

  const [enableConflictDetection, setEnableConflictDetection] = useState(
    db.settings.enableConflictDetection ?? true,
  );
  const [force169Ratio, setForce169Ratio] = useState(
    db.settings.force169Ratio || false,
  );
  const [screensaverTimeoutMinutes, setScreensaverTimeoutMinutes] = useState<
    0 | 5 | 10 | 15 | 30
  >((db.settings.screensaverTimeoutMinutes as 0 | 5 | 10 | 15 | 30) ?? 0);

  const [globalSessionsPerWeek, setGlobalSessionsPerWeek] = useState(
    db.settings.globalSessionsPerWeek || 1,
  );

  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [instrumentsList, setInstrumentsList] = useState<string[]>(
    db.settings.instrumentsList || [
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
    ],
  );

  // File upload refs
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Dirty state checker to show sticky save bar
  const isDirty = useMemo(() => {
    return (
      academyName !== db.settings.academyName ||
      managerName !== db.settings.managerName ||
      phone !== db.settings.phone ||
      address !== (db.settings.address || "تهران، خیابان ولیعصر") ||
      signatureUrl !== (db.settings.signatureUrl || "") ||
      logoUrl !== (db.settings.logoUrl || "") ||
      semesterTitle !== (db.settings.semesterTitle || "ترم بهار ۱۴۰۵") ||
      semesterStartDate !== (db.settings.semesterStartDate || getTodayString()) ||
      semesterEndDate !== (db.settings.semesterEndDate || "2026-06-20") ||
      semester2Title !== (db.settings.semester2Title || "ترم ۲ ماهه") ||
      semester2StartDate !== (db.settings.semester2StartDate || getTodayString()) ||
      semester2EndDate !== (db.settings.semester2EndDate || "2026-05-20") ||
      enableConflictDetection !== (db.settings.enableConflictDetection ?? true) ||
      force169Ratio !== (db.settings.force169Ratio || false) ||
      screensaverTimeoutMinutes !==
        ((db.settings.screensaverTimeoutMinutes as 0 | 5 | 10 | 15 | 30) ?? 0) ||
      globalSessionsPerWeek !== (db.settings.globalSessionsPerWeek || 1) ||
      JSON.stringify(instrumentsList) !==
        JSON.stringify(db.settings.instrumentsList || [])
    );
  }, [
    academyName,
    managerName,
    phone,
    address,
    signatureUrl,
    logoUrl,
    semesterTitle,
    semesterStartDate,
    semesterEndDate,
    semester2Title,
    semester2StartDate,
    semester2EndDate,
    enableConflictDetection,
    force169Ratio,
    screensaverTimeoutMinutes,
    globalSessionsPerWeek,
    instrumentsList,
    db.settings,
  ]);

  const handleDiscardChanges = () => {
    setAcademyName(db.settings.academyName);
    setManagerName(db.settings.managerName);
    setPhone(db.settings.phone);
    setAddress(db.settings.address || "تهران، خیابان ولیعصر");
    setSignatureUrl(db.settings.signatureUrl || "");
    setLogoUrl(db.settings.logoUrl || "");
    setSemesterTitle(db.settings.semesterTitle || "ترم بهار ۱۴۰۵");
    setSemesterStartDate(db.settings.semesterStartDate || getTodayString());
    setSemesterEndDate(db.settings.semesterEndDate || "2026-06-20");
    setSemester2Title(db.settings.semester2Title || "ترم ۲ ماهه");
    setSemester2StartDate(db.settings.semester2StartDate || getTodayString());
    setSemester2EndDate(db.settings.semester2EndDate || "2026-05-20");
    setEnableConflictDetection(db.settings.enableConflictDetection ?? true);
    setForce169Ratio(db.settings.force169Ratio || false);
    setScreensaverTimeoutMinutes(
      (db.settings.screensaverTimeoutMinutes as 0 | 5 | 10 | 15 | 30) ?? 0,
    );
    setGlobalSessionsPerWeek(db.settings.globalSessionsPerWeek || 1);
    setInstrumentsList(
      db.settings.instrumentsList || [
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
      ],
    );
    showToast("تغییرات لغو شد و مقادیر ذخیره شده بازگردانی گردیدند.", "info");
  };

  const handleAddInstrument = () => {
    const trimmed = newInstrumentName.trim();
    if (!trimmed) return;
    if (instrumentsList.includes(trimmed)) {
      showToast("این ساز از قبل در لیست سازها وجود دارد.", "warning");
      return;
    }
    setInstrumentsList([...instrumentsList, trimmed]);
    setNewInstrumentName("");
    showToast(`ساز «${trimmed}» اضافه شد. برای اعمال نهایی، دکمه ذخیره را بزنید.`, "success");
  };

  const handleRemoveInstrument = (ins: string) => {
    const studentsUsing = db.students.filter(
      (s) => s.status === "active" && s.instrument === ins,
    ).length;
    const teachersUsing = db.teachers.filter(
      (t) => t.instruments?.includes(ins),
    ).length;

    if (studentsUsing > 0 || teachersUsing > 0) {
      if (
        !window.confirm(
          `ساز «${ins}» در حال حاضر توسط ${studentsUsing} هنرجو و ${teachersUsing} استاد در حال استفاده است. آیا از حذف آن مطمئن هستید؟`,
        )
      ) {
        return;
      }
    }

    setInstrumentsList(instrumentsList.filter((i) => i !== ins));
    showToast(`ساز «${ins}» حذف شد.`, "warning");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("حجم فایل لوگو نباید بیش از ۲ مگابایت باشد.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        showToast("لوگو بارگذاری شد. لطفاً تغییرات را ذخیره کنید.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    showToast("تصویر لوگو برداشته شد.", "info");
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("حجم فایل امضا نباید بیش از ۲ مگابایت باشد.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSignatureUrl(base64);
        showToast("تصویر امضا بارگذاری شد. لطفاً تغییرات را ذخیره کنید.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = () => {
    setSignatureUrl("");
    showToast("تصویر امضا برداشته شد.", "info");
    if (signatureFileInputRef.current) signatureFileInputRef.current.value = "";
  };

  const handleStartRollover = (format: 1 | 2) => {
    setRolloverFormat(format);
    const title = format === 1 ? semesterTitle : semester2Title;
    setRolloverTitle(title + " (پایان ترم)");

    const formatTeachers = db.teachers
      .filter(
        (t) =>
          t.semesterFormat === format || (!t.semesterFormat && format === 1),
      )
      .map((t) => t.id);

    const studentsInTrack = db.students.filter((s) =>
      formatTeachers.includes(s.teacherId),
    );

    setTrackStudents(studentsInTrack);
    setReturningStudentIds(
      studentsInTrack.filter((s) => s.status === "active").map((s) => s.id),
    );

    setRolloverStep(1);
    setIsRolloverModalOpen(true);
  };

  const handleCompleteRollover = () => {
    archiveAndResetSemester(rolloverFormat, returningStudentIds, {
      archiveTitle: rolloverTitle,
      carryOverFinancials,
      carryOverCredits,
    });
    setIsRolloverModalOpen(false);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      academyName,
      managerName,
      phone,
      address,
      signatureUrl,
      logoUrl,
      defaultSemesterSessions: db.settings.defaultSemesterSessions,
      semesterTitle,
      semesterStartDate,
      semesterEndDate,
      semester2Title,
      semester2StartDate,
      semester2EndDate,
      force169Ratio,
      screensaverTimeoutMinutes,
      enableConflictDetection,
      globalSessionsPerWeek: Number(globalSessionsPerWeek),
      instrumentsList,
    });
    showToast("تنظیمات با موفقیت ذخیره شد.", "success");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importBackup(file);
      e.target.value = "";
    }
  };

  const handleExportExcel = () => {
    const validEndDate = excelEndDate > todayStr ? todayStr : excelEndDate;
    if (excelStartDate > validEndDate) {
      showToast("تاریخ شروع گزارش نمی‌تواند بعد از تاریخ پایان باشد.", "warning");
      return;
    }

    exportMultiSheetExcel(
      db,
      `گزارش_جامع_آموزشگاه_${academyName.replace(/\s+/g, "_")}`,
      {
        startDate: excelStartDate,
        endDate: validEndDate,
      },
    );
    showToast("فایل اکسل با موفقیت استخراج و دانلود شد.", "success");
  };

  return (
    <div className="space-y-6 relative pb-24">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center shadow-xs border border-accent-border shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
              تنظیمات و مدیریت سیستم
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              هویت آموزشگاه، زمان‌بندی ترم‌ها، قوانین آموزشی، ظاهر نرم‌افزار و پشتیبان‌گیری داده‌ها
            </p>
          </div>
        </div>

        {/* Top Save & Discard Buttons */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[var(--border-color)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>انصراف</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSaveAll()}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              isDirty
                ? "bg-accent hover:bg-accent-hover text-on-solid ring-2 ring-accent/30 animate-pulse"
                : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)]"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isDirty ? "ذخیره تغییرات" : "ذخیره تنظیمات"}</span>
          </button>
        </div>
      </div>

      {/* 3 Main Sub-Tabs Navigation Bar */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "profile"
              ? "bg-accent text-on-solid shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>اطلاعات و ظاهر آموزشگاه</span>
        </button>

        <button
          onClick={() => setActiveTab("academic")}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "academic"
              ? "bg-accent text-on-solid shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>ترم‌ها و قوانین آموزشی</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "data"
              ? "bg-accent text-on-solid shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>پشتیبان‌گیری و داده‌ها</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PROFILE & APPEARANCE (اطلاعات و ظاهر آموزشگاه) */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* TOP: Theme Palette Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  تم و رنگ‌بندی محیط کاربری
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  پالت رنگی دلخواه خود را متناسب با نور محیط و سلیقه کاری انتخاب نمایید.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {THEME_OPTIONS.map((t) => {
                const isSelected = theme === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    title={t.label}
                    onClick={() => setTheme(t.value as any)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative group flex items-center justify-center ${
                      isSelected
                        ? "border-accent shadow-md ring-2 ring-accent/30 bg-[var(--bg-tertiary)]"
                        : "border-[var(--border-color)] hover:border-accent/40 bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div
                      className={`w-full h-10 rounded-xl bg-gradient-to-br ${t.colors} border border-[var(--border-color)] shadow-2xs flex items-center justify-center`}
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-accent text-on-solid flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOP: Screensaver & Aspect Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Screensaver Timeout */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-strong" />
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    محافظ صفحه نمایش (Screen Saver)
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  در صورت عدم کار با موس یا کیبورد، صفحه ورودی زیبا (ON:TIME) ظاهر می‌شود و به محض حرکت موس یا زدن کلید فوراً محو می‌گردد.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { value: 0, label: "غیرفعال" },
                    { value: 5, label: "۵ دقیقه" },
                    { value: 10, label: "۱۰ دقیقه" },
                    { value: 15, label: "۱۵ دقیقه" },
                    { value: 30, label: "۳۰ دقیقه" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setScreensaverTimeoutMinutes(
                          opt.value as 0 | 5 | 10 | 15 | 30,
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        screensaverTimeoutMinutes === opt.value
                          ? "bg-accent text-on-solid border-accent shadow-xs"
                          : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-accent/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)]">
                زمان فعلی: {screensaverTimeoutMinutes === 0 ? "غیرفعال" : `پس از ${screensaverTimeoutMinutes} دقیقه بی‌کاری`}
              </div>
            </div>

            {/* 16:9 Aspect Ratio Lock */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-accent-strong" />
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      قفل نسبت تصویر ۱۶:۹
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForce169Ratio(!force169Ratio)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      force169Ratio ? "bg-accent" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        force169Ratio ? "-translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  مناسب برای مانیتورهای عریض یا کیوسک‌های لمسی در صورت تمایل به ثابت ماندن کادر برنامه در نسبت استاندارد نمایشگرهای تلویزیونی و پرده‌های آموزشی.
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)]">
                وضعیت: {force169Ratio ? "فعال (کادر ثابت ۱۶:۹)" : "غیرفعال (پر کردن تمام صفحه)"}
              </div>
            </div>
          </div>

          {/* BOTTOM: Academy Info Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  مشخصات سازمانی و ارتباطی آموزشگاه
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  این اطلاعات در سربرگ تمام گزارش‌ها، قبض‌ها، فاکتورهای هنرجویان و مدارک چاپی درج می‌شود.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-accent-strong" />
                  <span>نام آموزشگاه:</span>
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="مثال: آموزشگاه موسیقی شاهرخ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-hidden focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent-strong" />
                  <span>نام مدیر / موسس:</span>
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="مثال: استاد شاهرخ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-hidden focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-accent-strong" />
                  <span>تلفن تماس:</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: ۰۲۱-۸۸۸۸۸۸۸۸"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-semibold text-left focus:outline-hidden focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent-strong" />
                <span>نشانی کامل آموزشگاه:</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: تهران، خیابان ولیعصر، تقاطع مطهری، پلاک ۱۲"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* BOTTOM: 3 Equal-Height Cards (Logo, Signature, Live Document Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Logo */}
            <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent-strong" />
                    <span>لوگوی رسمی آموزشگاه</span>
                  </span>
                  {logoUrl && (
                    <span className="text-[10px] text-success-strong font-bold bg-success-soft px-2 py-0.5 rounded-md">
                      ثبت شده ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  تصویر مربع شفاف (PNG) با حداکثر حجم ۲ مگابایت برای نوار ناوبری و سربرگ قبض‌ها.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center min-h-[130px] my-auto text-center">
                {logoUrl ? (
                  <div className="relative group p-2 bg-white/95 rounded-xl border border-gray-200 shadow-xs">
                    <img
                      src={logoUrl}
                      alt="لوگوی آموزشگاه"
                      className="h-16 max-w-[140px] object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-danger text-white hover:bg-danger-strong shadow-md transition-transform transform group-hover:scale-105"
                      title="حذف لوگو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      لوگویی بارگذاری نشده است
                    </span>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-file-input"
                  ref={logoFileInputRef}
                />
                <label
                  htmlFor="logo-file-input"
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{logoUrl ? "تغییر تصویر لوگو" : "بارگذاری تصویر لوگو"}</span>
                </label>
              </div>
            </div>

            {/* Card 2: Signature */}
            <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                    <User className="w-4 h-4 text-accent-strong" />
                    <span>مهر و امضای مدیریت</span>
                  </span>
                  {signatureUrl && (
                    <span className="text-[10px] text-success-strong font-bold bg-success-soft px-2 py-0.5 rounded-md">
                      ثبت شده ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  اسکن مهر یا امضا روی پس‌زمینه سفید یا شفاف جهت چاپ خودکار در پای اسناد مالی.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center min-h-[130px] my-auto text-center">
                {signatureUrl ? (
                  <div className="relative group p-2 bg-white/95 rounded-xl border border-gray-200 shadow-xs">
                    <img
                      src={signatureUrl}
                      alt="امضای مدیریت"
                      className="h-16 max-w-[140px] object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-danger text-white hover:bg-danger-strong shadow-md transition-transform transform group-hover:scale-105"
                      title="حذف امضا"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <User className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      امضایی بارگذاری نشده است
                    </span>
                  </div>
                )}
              </div>

              <div>
                <input
                  ref={signatureFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  id="signature-file-input"
                />
                <label
                  htmlFor="signature-file-input"
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{signatureUrl ? "تغییر تصویر امضا" : "بارگذاری تصویر امضا"}</span>
                </label>
              </div>
            </div>

            {/* Card 3: Live Document Preview Miniature (Zero Dead Space) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-strong" />
                  <span>پیش‌نمایش سربرگ چاپی</span>
                </span>
                <span className="text-[10px] bg-accent-soft text-accent-strong font-bold px-2 py-0.5 rounded-full">
                  زنده
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2.5 font-sans text-right my-auto">
                {/* Miniature Document Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="لوگو"
                        className="w-9 h-9 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 truncate max-w-[130px]">
                        {academyName || "نام آموزشگاه"}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        سیستم جامع مدیریت آموزش
                      </div>
                    </div>
                  </div>
                  <div className="text-left text-[9px] text-slate-500 font-mono">
                    <div>۱۴۰۵/۰۷/۰۱</div>
                    <div>شماره: ۱۰۲۴</div>
                  </div>
                </div>

                {/* Dummy invoice body lines */}
                <div className="space-y-1 text-[9px] text-slate-600">
                  <div className="flex justify-between">
                    <span>تلفن تماس:</span>
                    <span className="font-mono text-slate-800">
                      {phone ? toPersianDigits(phone) : "۰۲۱-۸۸۸۸۸۸۸۸"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>نشانی:</span>
                    <span className="truncate max-w-[130px] text-slate-800">
                      {address || "تهران، خیابان ولیعصر"}
                    </span>
                  </div>
                </div>

                {/* Miniature Signature footer */}
                <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                  <div className="text-[9px] text-slate-500">
                    <div>مدیریت آموزشگاه:</div>
                    <div className="font-bold text-slate-800 truncate max-w-[80px]">
                      {managerName || "مدیر آموزشگاه"}
                    </div>
                  </div>
                  <div className="text-center">
                    {signatureUrl ? (
                      <img
                        src={signatureUrl}
                        alt="امضا"
                        className="h-7 max-w-[70px] object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-14 h-7 rounded border border-dashed border-slate-300 flex items-center justify-center text-[7px] text-slate-400">
                        محل امضا
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                تغییرات شما در نام، نشانی، شماره تماس، لوگو و امضا بلافاصله در فاکتورها و مدارک چاپی اعمال می‌گردد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ACADEMIC & SEMESTERS (ترم‌ها و قوانین آموزشی) */}
      {/* ========================================================================= */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          {/* Active Archive Selector Bar */}
          <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  انتخاب وضعیت سیستم (ترم زنده یا آرشیوهای قدیمی)
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  می‌توانید برای مشاهده یا گزارش‌گیری، به دوره‌ها و ترم‌های گذشته جابجا شوید.
                </p>
              </div>
            </div>

            {/* Custom Theme-Matching Dropdown with Shamsi Dates */}
            <div className="relative" ref={archiveDropdownRef}>
              <button
                type="button"
                onClick={() => setIsArchiveDropdownOpen((prev) => !prev)}
                className={`w-full sm:w-auto min-w-[260px] sm:min-w-[310px] px-4 py-2.5 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border transition-all text-right flex items-center justify-between gap-3 shadow-2xs cursor-pointer ${
                  isArchiveDropdownOpen
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-[var(--border-color)]"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {!activeArchiveId || !activeArchive ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse shrink-0" />
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          سیستم زنده (ترم جاری فعال)
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          داده‌های برخط پایگاه داده
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0">
                        <FolderArchive className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-right truncate">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {activeArchive.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {formatToShamsi(activeArchive.startDate)} تا{" "}
                          {formatToShamsi(activeArchive.endDate)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                    isArchiveDropdownOpen ? "rotate-180 text-accent-strong" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isArchiveDropdownOpen && (
                <div className="absolute left-0 sm:left-0 sm:right-auto mt-2 w-full sm:w-[330px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-muted)] border-b border-[var(--border-color)] mb-1 flex items-center justify-between">
                    <span>انتخاب وضعیت سیستم</span>
                    <span className="text-[10px] font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md">
                      {toPersianDigits((db.archives?.length || 0) + 1)} گزینه
                    </span>
                  </div>

                  {/* Live Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveArchiveId(null);
                      setIsArchiveDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                      !activeArchiveId
                        ? "bg-accent-soft text-accent-strong font-bold"
                        : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">🟢 سیستم زنده (ترم جاری فعال)</span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ثبت و ویرایش اطلاعات به صورت زنده
                        </span>
                      </div>
                    </div>
                    {!activeArchiveId && (
                      <Check className="w-4 h-4 text-accent-strong shrink-0" />
                    )}
                  </button>

                  {/* Archives Section */}
                  {db.archives && db.archives.length > 0 && (
                    <>
                      <div className="my-1.5 border-t border-[var(--border-color)]" />
                      <div className="text-[10px] font-bold text-[var(--text-muted)] px-3 py-1">
                        ترم‌ها و دوره‌های بایگانی شده:
                      </div>
                      <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {db.archives.map((archive) => {
                          const isSelected = activeArchiveId === archive.id;
                          return (
                            <button
                              key={archive.id}
                              type="button"
                              onClick={() => {
                                setActiveArchiveId(archive.id);
                                setIsArchiveDropdownOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-accent-soft text-accent-strong font-bold"
                                  : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                                  <FolderArchive className="w-4 h-4 text-accent-strong" />
                                </div>
                                <div className="flex flex-col truncate">
                                  <span className="text-xs font-bold truncate">
                                    {archive.title}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                    {formatToShamsi(archive.startDate)} تا{" "}
                                    {formatToShamsi(archive.endDate)}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-accent-strong shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Two Distinct Semester Cards (Format 1 & Format 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format 1 (ترم اصلی / بلندمدت) */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      فرمت شماره ۱ (ترم اصلی آموزشگاه)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent-strong text-[11px] font-bold">
                    فرمت ۱
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                      عنوان ترم اول:
                    </label>
                    <input
                      type="text"
                      value={semesterTitle}
                      onChange={(e) => setSemesterTitle(e.target.value)}
                      placeholder="مثال: ترم بهار ۱۴۰۵"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                        تاریخ شروع ترم:
                      </label>
                      <ShamsiDatePicker
                        value={semesterStartDate}
                        onChange={(d) => setSemesterStartDate(d)}
                        placeholder="تاریخ شروع ترم"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                        تاریخ پایان ترم:
                      </label>
                      <ShamsiDatePicker
                        value={semesterEndDate}
                        onChange={(d) => setSemesterEndDate(d)}
                        placeholder="تاریخ پایان ترم"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => handleStartRollover(1)}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-accent-soft hover:text-accent-strong text-[var(--text-primary)] text-xs font-bold flex items-center justify-center gap-2 border border-[var(--border-color)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>جادوگر پایان ترم و بستن {semesterTitle || "فرمت ۱"}</span>
                </button>
              </div>
            </div>

            {/* Format 2 (ترم دوم / دوره‌های فشرده) */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success" />
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      فرمت شماره ۲ (ترم کوتاه یا فشرده)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-success-soft text-success-strong text-[11px] font-bold">
                    فرمت ۲
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                      عنوان ترم دوم:
                    </label>
                    <input
                      type="text"
                      value={semester2Title}
                      onChange={(e) => setSemester2Title(e.target.value)}
                      placeholder="مثال: ترم ۲ ماهه تابستان"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                        تاریخ شروع ترم دوم:
                      </label>
                      <ShamsiDatePicker
                        value={semester2StartDate}
                        onChange={(d) => setSemester2StartDate(d)}
                        placeholder="تاریخ شروع ترم دوم"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                        تاریخ پایان ترم دوم:
                      </label>
                      <ShamsiDatePicker
                        value={semester2EndDate}
                        onChange={(d) => setSemester2EndDate(d)}
                        placeholder="تاریخ پایان ترم دوم"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => handleStartRollover(2)}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-success-soft hover:text-success-strong text-[var(--text-primary)] text-xs font-bold flex items-center justify-center gap-2 border border-[var(--border-color)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>جادوگر پایان ترم و بستن {semester2Title || "فرمت ۲"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic & Conflict Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conflict Detection Switch */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent-strong" />
                    <span>سیستم هوشمند ضد تداخل زمانی</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEnableConflictDetection(!enableConflictDetection)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      enableConflictDetection
                        ? "bg-success-strong"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enableConflictDetection
                          ? "-translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  هنگام ثبت کلاس یا تغییر زمان، از هم‌پوشانی ساعت کلاس اساتید، هنرجویان و اتاق‌های آموزشی جلوگیری نموده و در صورت تداخل به صورت بلادرنگ هشدار می‌دهد.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-secondary)]">
                وضعیت: {enableConflictDetection ? "🟢 فعال و تحت محافظت" : "⚪️ غیرفعال"}
              </div>
            </div>

            {/* Weekly Sessions Allowed */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <label className="block font-bold text-sm text-[var(--text-primary)]">
                  سقف جلسات مجاز در هفته برای هر هنرجو:
                </label>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  حداکثر تعداد جلسه‌ای که یک هنرجو می‌تواند در برنامه هفتگی برای کلاس‌های عادی رزرو نماید.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={globalSessionsPerWeek}
                    onChange={(e) =>
                      setGlobalSessionsPerWeek(Number(e.target.value))
                    }
                    className="w-28 px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-sm text-center"
                  />
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">
                    جلسه در طول هر هفته
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                پیشنهاد استاندارد: ۱ یا ۲ جلسه در هفته
              </div>
            </div>
          </div>

          {/* Instruments Management Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    سازهای فعال در آموزشگاه
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    این لیست در فرم‌های ثبت‌نام هنرجو، تخصص اساتید و فیلترهای برنامه‌ریزی هفتگی ظاهر می‌شود.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-[var(--bg-tertiary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                تعداد سازها: {toPersianDigits(instrumentsList.length)}
              </span>
            </div>

            {/* Add Instrument Quick Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newInstrumentName}
                  onChange={(e) => setNewInstrumentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInstrument();
                    }
                  }}
                  placeholder="نام ساز جدید را بنویسید (مثلاً هارمونیکا، کاخن، کمانچه)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-semibold focus:outline-hidden focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddInstrument}
                className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن ساز</span>
              </button>
            </div>

            {/* Instruments Badge Cloud */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {instrumentsList.map((ins) => (
                <div
                  key={ins}
                  className="group px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] flex items-center gap-2 text-xs transition-all shadow-2xs"
                >
                  <span className="font-bold text-[var(--text-primary)]">
                    {ins}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveInstrument(ins)}
                    className="text-[var(--text-muted)] hover:text-danger p-0.5 transition-colors"
                    title={`حذف ساز ${ins}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: BACKUP & DATA MANAGEMENT (پشتیبان‌گیری و داده‌ها) */}
      {/* ========================================================================= */}
      {activeTab === "data" && (
        <div className="space-y-6">
          {/* Top Priority Card: Full Multi-Sheet Excel Export */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-success-soft text-success-strong flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  استخراج گزارش جامع عملکرد به اکسل (.xlsx)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  شامل شیت‌های تفکیک‌شده هنرجویان، اساتید، حضور و غیاب، شهریه‌ها و خلاصه وضعیت مالی
                </p>
              </div>
            </div>

            {/* Shamsi Date Range Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">
                  از تاریخ (شمسی):
                </label>
                <ShamsiDatePicker
                  value={excelStartDate}
                  onChange={(d) => setExcelStartDate(d)}
                  placeholder="تاریخ شروع"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1.5">
                  تا تاریخ (شمسی):
                </label>
                <ShamsiDatePicker
                  value={excelEndDate}
                  onChange={(d) => {
                    if (d > todayStr) {
                      showToast(
                        "تاریخ پایان نمی‌تواند از تاریخ امروز فراتر رود.",
                        "warning",
                      );
                      setExcelEndDate(todayStr);
                    } else {
                      setExcelEndDate(d);
                    }
                  }}
                  placeholder="تاریخ پایان"
                />
              </div>
            </div>

            <button
              id="btn-export-full-excel"
              onClick={handleExportExcel}
              className="w-full py-3 rounded-2xl bg-success hover:bg-success/90 text-on-solid text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل اکسل چندبرگ برای بازه انتخابی (.xlsx)</span>
            </button>
          </div>

          {/* Database Backup & Audit Logs in 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JSON Backup Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                      فایل پشتیبان دیتابیس (JSON)
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      تهیه رونوشت کامل از تمام جداول جهت انتقال یا نگهداری امن
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] text-xs space-y-1.5 text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>مجموع رکوردهای ثبت‌شده:</span>
                    <span className="font-bold font-mono">
                      {toPersianDigits(
                        db.students.length +
                          db.teachers.length +
                          db.attendance.length +
                          db.notes.length +
                          db.transactions.length,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>هنرجویان / اساتید:</span>
                    <span className="font-mono">
                      {toPersianDigits(db.students.length)} هنرجو / {toPersianDigits(db.teachers.length)} استاد
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>آخرین به‌روزرسانی سیستم:</span>
                    <span className="font-mono">
                      {new Date(db.lastUpdated).toLocaleTimeString("fa-IR")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={exportBackup}
                  className="py-2.5 px-3 rounded-xl bg-accent hover:bg-accent-hover text-on-solid text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل پشتیبان</span>
                </button>

                <label className="py-2.5 px-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-[var(--border-color)]">
                  <Upload className="w-4 h-4" />
                  <span>بارگذاری و بازیابی</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* System Audit Logs */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                      لاگ وقایع و تاریخچه سیستم (.log)
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      ثبت وقایع حساس مانند ثبت تراکنش‌ها، تغییر جلسات و ورود اطلاعات
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] text-xs space-y-1.5 text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>تراکنش‌های مالی:</span>
                    <span className="font-mono font-bold">
                      {toPersianDigits(db.transactions?.length || 0)} رکورد
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>تغییرات جلسات و جبرانی‌ها:</span>
                    <span className="font-mono">
                      {toPersianDigits(db.creditLogs?.length || 0)} رویداد
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>فرمت خروجی:</span>
                    <span className="font-mono font-bold text-accent-strong">
                      متنی ساخت‌یافته (.log)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={exportAuditLogs}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2 border border-[var(--border-color)] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل متنی لاگ رویدادها</span>
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset Database */}
          <div className="p-6 rounded-3xl bg-danger-soft/20 border border-danger-border shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-danger-soft text-danger-strong flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-danger-strong">
                    منطقه حساس و نگهداری (Danger Zone)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    بازنشانی دیتابیس تمام اطلاعات فعلی را پاک کرده و به نمونه اولیه سیستم برمی‌گرداند.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-danger hover:bg-danger-strong text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>بازنشانی به اطلاعات اولیه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar when dirty */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)]/95 backdrop-blur-md border border-accent shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span>تغییراتی در تنظیمات اعمال کرده‌اید.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] transition-colors"
            >
              لغو تغییرات
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll()}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-on-solid flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره فوری</span>
            </button>
          </div>
        </div>
      )}

      {/* Rollover Modal Dialog */}
      <Dialog open={isRolloverModalOpen} onOpenChange={setIsRolloverModalOpen}>
        <DialogContent className="sm:max-w-[500px] font-sans text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-base font-bold">
              جادوگر انتقال ترم ({rolloverFormat === 1 ? semesterTitle : semester2Title})
            </DialogTitle>
          </DialogHeader>

          {rolloverStep === 1 ? (
            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5">
                  نام فایل آرشیو این ترم:
                </label>
                <input
                  type="text"
                  value={rolloverTitle}
                  onChange={(e) => setRolloverTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-semibold"
                />
              </div>

              <div className="space-y-3 bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <label
                    className="font-medium cursor-pointer"
                    htmlFor="carryDebt"
                  >
                    انتقال مانده بدهی و بستانکاری به ترم جدید
                  </label>
                  <Checkbox
                    id="carryDebt"
                    checked={carryOverFinancials}
                    onCheckedChange={(c) =>
                      setCarryOverFinancials(c as boolean)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label
                    className="font-medium cursor-pointer"
                    htmlFor="carryCredits"
                  >
                    انتقال جلسات جبرانی ذخیره‌شده به ترم جدید
                  </label>
                  <Checkbox
                    id="carryCredits"
                    checked={carryOverCredits}
                    onCheckedChange={(c) => setCarryOverCredits(c as boolean)}
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                با کلیک بر روی ادامه، می‌توانید تک‌تک مشخص کنید کدام هنرجویان برای ترم آینده ثبت‌نام خود را تمدید کرده‌اند.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRolloverModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => setRolloverStep(2)}
                  disabled={!rolloverTitle}
                  className="px-4 py-2 rounded-xl bg-accent text-on-solid hover:bg-accent-hover text-xs font-bold"
                >
                  ادامه انتخاب هنرجویان
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-xs">
              <p className="font-semibold">
                هنرجویانی که برای ترم جدید تمدید می‌کنند را انتخاب کنید:
              </p>
              <div className="max-h-[300px] overflow-y-auto space-y-1.5 border border-[var(--border-color)] p-2 rounded-2xl">
                {trackStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 hover:bg-[var(--bg-tertiary)] rounded-xl"
                  >
                    <label
                      className="cursor-pointer flex-1"
                      htmlFor={`rollover-${student.id}`}
                    >
                      <span className="font-bold">{student.name}</span>{" "}
                      <span className="text-[11px] opacity-60">
                        ({student.instrument})
                      </span>
                    </label>
                    <Checkbox
                      id={`rollover-${student.id}`}
                      checked={returningStudentIds.includes(student.id)}
                      onCheckedChange={(c) => {
                        if (c) {
                          setReturningStudentIds((prev) => [
                            ...prev,
                            student.id,
                          ]);
                        } else {
                          setReturningStudentIds((prev) =>
                            prev.filter((id) => id !== student.id),
                          );
                        }
                      }}
                    />
                  </div>
                ))}
                {trackStudents.length === 0 && (
                  <p className="text-center text-xs opacity-50 py-4">
                    هیچ هنرجویی در این فرمت یافت نشد.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setRolloverStep(1)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs font-semibold"
                >
                  بازگشت
                </button>
                <button
                  type="button"
                  onClick={handleCompleteRollover}
                  className="px-4 py-2 rounded-xl bg-success text-on-solid hover:bg-success/90 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ایجاد آرشیو و پایان ترم</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Database Reset Confirmation Modal */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] font-sans text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-base font-bold text-danger-strong flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span>تایید بازنشانی کامل دیتابیس</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs leading-relaxed">
            <p className="text-[var(--text-primary)]">
              آیا از بازنشانی کامل پایگاه داده به اطلاعات نمونه اطمینان دارید؟
            </p>
            <div className="p-3 rounded-xl bg-danger-soft/20 border border-danger-border text-danger-strong text-[11px]">
              توجه: تمام هنرجویان، اساتید، گزارش‌های حضور و غیاب و تراکنش‌های فعلی حذف شده و با اطلاعات دمو جایگزین خواهند شد. این عملیات غیرقابل بازگشت است.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-semibold"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                resetDatabase();
                setIsResetConfirmOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-danger hover:bg-danger-strong text-white text-xs font-bold"
            >
              بله، بازنشانی شود
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
