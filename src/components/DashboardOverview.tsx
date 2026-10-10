import React, { useState } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Music,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Printer,
  Plus,
  Trash2,
  X,
  Pin,
  ListTodo,
  Check,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  toPersianDigits,
  formatToman,
  formatFullJalali,
  getTodayString,
  toJalaliDateString,
  addDays,
} from "../utils/persianDate";
import { printDailyReport } from "../utils/pdfExport";
import { NavTabId, Note } from "../types";
import { ShamsiDatePicker } from "./ShamsiDatePicker";

interface DashboardOverviewProps {
  onNavigate?: (tab: NavTabId) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
}) => {
  const {
    db,
    selectedDate,
    getAttendanceForDate,
    updateAttendanceStatus,
    addNote,
    deleteNote,
    addTodo,
    toggleTodo,
    deleteTodo,
    setCurrentTab,
    showToast,
  } = useAcademy();

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNotePinned, setNewNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Todo States
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const todayStr = getTodayString();
  const tomorrowStr = addDays(todayStr, 1);
  const [newTodoDate, setNewTodoDate] = useState(todayStr);

  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addTodo(newTodoTitle.trim(), newTodoDate);
    setNewTodoTitle("");
  };

  const handleTodoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const allTodos = db.todos || [];
  const totalTodosCount = allTodos.length;
  const completedTodosCount = allTodos.filter((t) => t.completed).length;
  const pendingTodosCount = totalTodosCount - completedTodosCount;

  const sortedTodos = [...allTodos].sort((a, b) => {
    // completed goes to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // then sort by date ascending
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return 0;
  });

  const handleNavigate = (tab: NavTabId) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setCurrentTab(tab);
    }
  };

  const todayRecords = getAttendanceForDate(selectedDate);
  const totalStudents = db.students.length;
  const activeStudents = db.students.filter(
    (s) => s.status === "active",
  ).length;
  const activeTeachers = db.teachers.filter(
    (t) => t.status === "active",
  ).length;

  // Make-up Credits in circulation
  const totalMakeupCredits = db.students.reduce(
    (acc, s) => acc + (s.makeupCredits || 0),
    0,
  );
  const studentsWithCredits = db.students.filter(
    (s) => s.makeupCredits > 0,
  ).length;

  // Financial Stats
  const totalTuitionExpected = db.students.reduce(
    (acc, s) => acc + (s.tuitionFee || 0),
    0,
  );
  const totalTuitionCollected = db.students.reduce(
    (acc, s) => acc + (s.paidAmount || 0),
    0,
  );
  const totalDebt = totalTuitionExpected - totalTuitionCollected;
  const overdueCount = db.students.filter(
    (s) => s.paymentStatus === "overdue",
  ).length;

  // Today Attendance distribution
  const presentCount = todayRecords.filter(
    (r) => r.status === "present",
  ).length;
  const excusedCount = todayRecords.filter(
    (r) => r.status === "excused",
  ).length;
  const cancelledCount = todayRecords.filter(
    (r) => r.status === "teacher_cancelled",
  ).length;
  const noShowCount = todayRecords.filter((r) => r.status === "no_show").length;

  const teacherMap = new Map(db.teachers.map((t) => [t.id, t.name]));
  const studentMap = new Map(db.students.map((s) => [s.id, s.name]));

  const handlePrintDaily = () => {
    const dailyNotes = db.notes.filter(
      (n) => n.date === selectedDate || n.pinned,
    );
    printDailyReport(selectedDate, todayRecords, dailyNotes, db);
  };

  const openEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title || "");
    setNewNoteContent(note.content || "");
    setNewNotePinned(note.pinned || false);
    setShowAddNoteModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      showToast("لطفاً متن یادداشت را وارد کنید.", "warning");
      return;
    }

    const notePayload = {
      title: newNoteTitle.trim() || undefined,
      content: newNoteContent.trim(),
      pinned: newNotePinned,
      date: selectedDate || getTodayString(),
      targetType: "general" as const,
    };

    if (editingNoteId) {
      deleteNote(editingNoteId);
      addNote(notePayload);
      setEditingNoteId(null);
    } else {
      addNote(notePayload);
    }

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNotePinned(false);
    setShowAddNoteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome card */}
      <div className="p-4 md:p-5 rounded-2xl bg-accent text-on-solid shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-on-solid/10 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
              خوش آمدید
            </h2>
            <p className="text-xs md:text-sm text-on-solid/90 mt-1">
              امروز {formatFullJalali(selectedDate)} |{" "}
              {toPersianDigits(todayRecords.length)} کلاس در برنامه ثبت شده است.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Today's Roll-call Snapshot & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todos Box */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col h-full min-h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0 shadow-2xs">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
                  لیست کارها
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {totalTodosCount === 0 ? (
                    "مدیریت و پیگیری کارهای روزانه آموزشگاه"
                  ) : pendingTodosCount > 0 ? (
                    <span>
                      <strong className="text-[var(--text-primary)] font-semibold">
                        {toPersianDigits(pendingTodosCount)}
                      </strong>{" "}
                      کار در انتظار انجام
                      {completedTodosCount > 0 && (
                        <span className="opacity-75 mr-1">
                          ({toPersianDigits(completedTodosCount)} تکمیل‌شده)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      همه کارها انجام شده‌اند ✨
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Line */}
          {totalTodosCount > 0 && (
            <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-accent h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(completedTodosCount / totalTodosCount) * 100}%`,
                }}
              />
            </div>
          )}

          {/* New Task Composer (Rearranged) */}
          <form
            onSubmit={handleAddTodo}
            className="rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all p-3 shadow-2xs mb-4"
          >
            {/* Input Textarea */}
            <textarea
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={handleTodoKeyDown}
              placeholder="کار جدید..."
              className="w-full bg-transparent border-0 text-[var(--text-primary)] text-xs sm:text-sm placeholder:text-[var(--text-muted)] focus:outline-hidden resize-none leading-relaxed min-h-[46px]"
              rows={2}
              required
            />

            {/* Bottom Action Bar: Date Selector & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 mt-1 border-t border-[var(--border-color)]/60">
              <div className="w-full sm:w-[250px]">
                <ShamsiDatePicker
                  value={newTodoDate}
                  onChange={setNewTodoDate}
                  className="w-full block"
                  buttonClassName="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)] rounded-xl font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newTodoTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="افزودن کار (Enter)"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت کار</span>
                  <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono px-1 py-0.2 rounded bg-black/15">
                    ↵ Enter
                  </span>
                </button>
              </div>
            </div>
          </form>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[400px] custom-scrollbar">
            {sortedTodos.length === 0 ? (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center py-8 text-[var(--text-muted)] text-xs text-center border border-dashed border-[var(--border-color)] rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-2 text-[var(--text-muted)]">
                  <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="font-semibold text-xs text-[var(--text-secondary)]">
                  هیچ کاری در لیست نیست
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  برای یادآوری و پیگیری، از کادر بالا کار جدیدی ثبت کنید.
                </p>
              </div>
            ) : (
              sortedTodos.map((todo) => {
                const isCompleted = todo.completed;
                const isPast = !isCompleted && todo.date < todayStr;
                const isToday = !isCompleted && todo.date === todayStr;
                const isTomorrow = !isCompleted && todo.date === tomorrowStr;
                const isUpcoming = !isCompleted && todo.date > tomorrowStr;

                // Color-coded styling based on task date and status
                let containerStyle = "";
                let checkboxStyle = "";
                let statusBadge = null;

                if (isCompleted) {
                  containerStyle =
                    "bg-[var(--bg-tertiary)]/40 border-[var(--border-color)]/70 border-r-4 border-r-emerald-500/40 opacity-70";
                  checkboxStyle =
                    "bg-success border-success text-on-solid shadow-xs";
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      انجام شد
                    </span>
                  );
                } else if (isPast) {
                  // Postponed / Overdue
                  containerStyle =
                    "bg-amber-500/[0.08] dark:bg-amber-950/30 border-amber-500/50 dark:border-amber-500/40 border-r-4 border-r-amber-500 shadow-2xs hover:border-amber-500/70";
                  checkboxStyle =
                    "border-amber-400/80 hover:border-amber-500 bg-[var(--bg-secondary)] dark:bg-black/20 hover:bg-amber-500/10";
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35 flex items-center gap-1 shadow-2xs">
                      <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                      به تعویق افتاده
                    </span>
                  );
                } else if (isToday) {
                  // Today's Work
                  containerStyle =
                    "bg-emerald-500/[0.08] dark:bg-emerald-950/35 border-emerald-500/55 dark:border-emerald-500/45 border-r-4 border-r-emerald-500 shadow-2xs hover:border-emerald-500/75";
                  checkboxStyle =
                    "border-emerald-400/80 hover:border-emerald-500 bg-[var(--bg-secondary)] dark:bg-black/20 hover:bg-emerald-500/10";
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      کارهای امروز
                    </span>
                  );
                } else if (isTomorrow) {
                  // Tomorrow
                  containerStyle =
                    "bg-blue-500/[0.05] dark:bg-blue-950/25 border-blue-500/45 dark:border-blue-500/35 border-r-4 border-r-blue-500 shadow-2xs hover:border-blue-500/65";
                  checkboxStyle =
                    "border-blue-400/80 hover:border-blue-500 bg-[var(--bg-secondary)] dark:bg-black/20 hover:bg-blue-500/10";
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                      فردا
                    </span>
                  );
                } else {
                  // Future / Upcoming
                  containerStyle =
                    "bg-sky-500/[0.03] dark:bg-sky-950/15 border-sky-500/35 dark:border-sky-500/25 border-r-4 border-r-sky-400 shadow-2xs hover:border-sky-500/50";
                  checkboxStyle =
                    "border-sky-400/80 hover:border-sky-500 bg-[var(--bg-secondary)] dark:bg-black/20 hover:bg-sky-500/10";
                  statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-sky-500 shrink-0" />
                      آینده
                    </span>
                  );
                }

                return (
                  <div
                    key={todo.id}
                    className={`group p-3 sm:px-4 sm:py-3.5 flex items-start justify-between gap-3 rounded-2xl border transition-all ${containerStyle}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id)}
                        className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${checkboxStyle}`}
                        title={
                          todo.completed
                            ? "علامت‌گذاری به عنوان انجام نشده"
                            : "علامت‌گذاری به عنوان انجام شده"
                        }
                      >
                        {todo.completed && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>

                      {/* Content & Metadata */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed ${
                            todo.completed
                              ? "line-through text-[var(--text-muted)] font-normal"
                              : isToday || isPast
                                ? "text-[var(--text-primary)] font-semibold"
                                : "text-[var(--text-primary)] font-medium"
                          }`}
                        >
                          {todo.title}
                        </div>

                        {/* Date & Contextual indicators */}
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-muted)] flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <CalendarIcon className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>{toJalaliDateString(todo.date)}</span>
                          </span>

                          {statusBadge}
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 transition-colors p-1.5 rounded-lg cursor-pointer"
                        title="حذف کار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fully Interactive Notes & Reminders Box */}
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between h-full min-h-[500px]">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <span>یادداشت‌ها و اطلاعیه‌ها</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-mono">
                  {toPersianDigits(db.notes.length)}
                </span>
              </h3>
              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setNewNoteTitle("");
                  setNewNoteContent("");
                  setNewNotePinned(false);
                  setShowAddNoteModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-accent text-on-solid hover:bg-accent-hover text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>یادداشت جدید</span>
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[380px] max-h-[520px]">
              {db.notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-[var(--text-muted)] text-xs">
                  <p>یادداشتی ثبت نشده است.</p>
                  <p className="mt-1">
                    برای ثبت رویداد، دکمه «یادداشت جدید» را بزنید.
                  </p>
                </div>
              ) : (
                db.notes.map((note) => {
                  const hasTitle = Boolean(note.title && note.title.trim());
                  return (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-2 relative group cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                      onClick={() => openEditNote(note)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {hasTitle ? (
                          <span className="font-extrabold text-[var(--text-primary)] line-clamp-1 flex-1">
                            {note.title}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)] italic flex-1">
                            بدون عنوان
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {note.pinned && (
                            <Pin className="w-3.5 h-3.5 text-warning-strong fill-warning-strong" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="text-[var(--text-muted)] hover:text-danger p-1 rounded-md transition-colors"
                            title="حذف یادداشت"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        {toJalaliDateString(note.date)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                {editingNoteId
                  ? "ویرایش یادداشت"
                  : "افزودن یادداشت یا اطلاعیه جدید"}
              </h4>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  عنوان یادداشت <span className="text-[var(--text-muted)] font-normal">:</span>
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  متن یادداشت:
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveNote(e);
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={newNotePinned}
                    onChange={(e) => setNewNotePinned(e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                  />
                  <span>سنجاق در بالای لیست</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-on-solid hover:bg-accent-hover font-bold shadow-xs transition-colors"
                >
                  ثبت یادداشت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
