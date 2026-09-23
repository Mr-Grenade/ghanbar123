import { CustomSelect } from "./ui/custom-select";
import React, { useState, useEffect } from "react";
import { useAcademy } from "../context/AcademyContext";
import { Note, NoteTargetType, Student, Teacher } from "../types";
import {
  toPersianDigits,
  toJalaliDateString,
  getTodayString,
} from "../utils/persianDate";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { Pagination } from "./Pagination";
import {
  StickyNote,
  Plus,
  Pin,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";

export const NotesManager: React.FC = () => {
  const { db, addNote, updateNote, deleteNote, showToast } = useAcademy();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchNoteText, setSearchNoteText] = useState<string>("");
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchNoteText]);

  // Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formContent, setFormContent] = useState<string>("");
  const [formTargetType, setFormTargetType] =
    useState<NoteTargetType>("general");
  const [formTargetId, setFormTargetId] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("اطلاعیه");
  const [formPinned, setFormPinned] = useState<boolean>(false);
  const [formDate, setFormDate] = useState<string>(() => getTodayString());

  const teacherMap = new Map<string, Teacher>(
    db.teachers.map((t) => [t.id, t]),
  );
  const studentMap = new Map<string, Student>(
    db.students.map((s) => [s.id, s]),
  );

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormContent("");
    setFormTargetType("general");
    setFormTargetId("");
    setFormCategory("آموزشی");
    setFormPinned(false);
    setFormDate(getTodayString());
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title || "");
    setFormContent(note.content);
    setFormTargetType(note.targetType);
    setFormTargetId(note.targetId || "");
    setFormCategory(note.category || "عمومی");
    setFormPinned(note.pinned || false);
    setFormDate(note.date);
    setShowAddEditModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      showToast("لطفاً متن یادداشت را وارد کنید.", "warning");
      return;
    }

    const payload = {
      title: formTitle.trim() || undefined,
      content: formContent.trim(),
      targetType: formTargetType,
      targetId:
        formTargetType === "general" ? undefined : formTargetId || undefined,
      pinned: formPinned,
      date: formDate,
    };

    if (editingNote) {
      updateNote(editingNote.id, payload);
    } else {
      addNote(payload);
    }

    setShowAddEditModal(false);
  };

  const filteredNotes = db.notes.filter((note) => {
    if (activeFilter !== "all") {
      if (activeFilter === "pinned" && !note.pinned) return false;
      if (activeFilter !== "pinned" && note.targetType !== activeFilter)
        return false;
    }
    if (searchNoteText) {
      const q = searchNoteText.toLowerCase();
      const matchTitle = note.title
        ? note.title.toLowerCase().includes(q)
        : false;
      const matchContent = note.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & New Note Button */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-warning-strong" />
            <span>سیستم یادداشت‌های هوشمند و متصل به تاریخ، هنرجو و استاد</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            ثبت نکات آموزشی، هماهنگی‌های اساتید، یادآوری‌های روزانه و وقایع
            تقویمی آموزشگاه
          </p>
        </div>

        <button
          id="btn-add-note"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-warning hover:bg-warning/90 text-on-solid text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ یادداشت جدید</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === "all"
                ? "bg-accent text-on-solid font-semibold"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            همه ({toPersianDigits(db.notes.length)})
          </button>
          <button
            onClick={() => setActiveFilter("pinned")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === "pinned"
                ? "bg-warning text-on-solid font-semibold"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            سنجاق‌شده‌ها
          </button>
          <button
            onClick={() => setActiveFilter("date")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === "date"
                ? "bg-info text-on-solid font-semibold"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            متصل به تاریخ تقویمی
          </button>
          <button
            onClick={() => setActiveFilter("student")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === "student"
                ? "bg-success text-on-solid font-semibold"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            مربوط به هنرجویان
          </button>
          <button
            onClick={() => setActiveFilter("teacher")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === "teacher"
                ? "bg-accent text-on-solid font-semibold"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            مربوط به اساتید
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="جستجو در متن یادداشت‌ها..."
            value={searchNoteText}
            onChange={(e) => setSearchNoteText(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Notes Masonry Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center text-[var(--text-muted)]">
          <StickyNote className="w-12 h-12 mx-auto text-ink-muted mb-3 opacity-60" />
          <p className="text-sm">یادداشتی با این مشخصات یافت نشد.</p>
        </div>
      ) : (
        (() => {
          const paginatedNotes =
            pageSize === -1
              ? filteredNotes
              : filteredNotes.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize,
                );

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedNotes.map((note) => {
                  let targetBadge = "عمومی آموزشگاه";
                  let targetIcon = Sparkles;
                  let badgeBg = "bg-accent-soft text-accent-strong";

                  if (note.targetType === "student" && note.targetId) {
                    const st = studentMap.get(note.targetId);
                    targetBadge = `هنرجو: ${st?.name || note.targetId}`;
                    targetIcon = User;
                    badgeBg = "bg-success-soft text-success-strong";
                  } else if (note.targetType === "teacher" && note.targetId) {
                    const tc = teacherMap.get(note.targetId);
                    targetBadge = `استاد: ${tc?.name || note.targetId}`;
                    targetIcon = GraduationCap;
                    badgeBg = "bg-accent-soft text-accent-strong";
                  } else if (note.targetType === "date") {
                    targetBadge = `تاریخ: ${toJalaliDateString(note.targetId || note.date)}`;
                    targetIcon = Calendar;
                    badgeBg = "bg-info-soft text-info-strong";
                  }

                  const Icon = targetIcon;

                  return (
                    <div
                      key={note.id}
                      className={`p-5 rounded-2xl bg-[var(--bg-secondary)] border ${
                        note.pinned
                          ? "border-warning-border shadow-md ring-1 ring-warning/30"
                          : "border-[var(--border-color)]"
                      } shadow-xs space-y-3 flex flex-col justify-between transition-all hover:border-warning-border/60`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Bar: Category, Pin, Target Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${badgeBg}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{targetBadge}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {note.pinned && (
                              <span
                                className="p-1 text-warning-strong"
                                title="سنجاق شده"
                              >
                                <Pin className="w-3.5 h-3.5 fill-warning-strong" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        {note.title && note.title.trim() ? (
                          <h3 className="font-bold text-sm text-[var(--text-primary)]">
                            {note.title}
                          </h3>
                        ) : (
                          <div className="text-xs text-[var(--text-muted)] italic">
                            بدون عنوان
                          </div>
                        )}

                        {/* Body Content */}
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>

                      {/* Footer Meta & Actions */}
                      <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span className="font-mono">
                          {toJalaliDateString(note.date)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(note)}
                            className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] hover:text-accent-strong transition-colors"
                            title="ویرایش"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `آیا از حذف یادداشت «${note.title || "بدون عنوان"}» اطمینان دارید؟`,
                                )
                              ) {
                                deleteNote(note.id);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] hover:text-danger-strong transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredNotes.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 9, 18, 30]}
                itemLabel="یادداشت"
              />
            </div>
          );
        })()
      )}

      {/* ================= MODAL: ADD / EDIT NOTE ================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingNote ? "ویرایش یادداشت" : "افزودن یادداشت جدید"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-xs hover:bg-[var(--bg-tertiary)]/80"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="noteForm"
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs"
                >
                  ذخیره یادداشت
                </button>
              </div>
            </div>

            <form
              id="noteForm"
              onSubmit={handleSaveNote}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  عنوان یادداشت{" "}
                  <span className="text-[var(--text-muted)] font-normal">
                    (اختیاری):
                  </span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="اختیاری - در صورت تمایل عنوان را وارد کنید"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    اتصال یادداشت به:
                  </label>
                  <CustomSelect
                    value={formTargetType}
                    onChange={(e) => {
                      const type = e.target.value as NoteTargetType;
                      setFormTargetType(type);
                      if (type === "student")
                        setFormTargetId(db.students[0]?.id || "");
                      else if (type === "teacher")
                        setFormTargetId(db.teachers[0]?.id || "");
                      else if (type === "date")
                        setFormTargetId(getTodayString());
                      else setFormTargetId("");
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  >
                    <option value="general">عمومی آموزشگاه</option>
                    <option value="date">تاریخ تقویمی خاص</option>
                    <option value="student">هنرجوی مشخص</option>
                    <option value="teacher">استاد مشخص</option>
                  </CustomSelect>
                </div>

                {formTargetType === "student" && (
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      انتخاب هنرجو:
                    </label>
                    <CustomSelect
                      value={formTargetId}
                      onChange={(e) => setFormTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
                      {db.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.instrument})
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                )}

                {formTargetType === "teacher" && (
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      انتخاب استاد:
                    </label>
                    <CustomSelect
                      value={formTargetId}
                      onChange={(e) => setFormTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
                      {db.teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                )}

                {formTargetType === "date" && (
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      انتخاب تاریخ (شمسی):
                    </label>
                    <ShamsiDatePicker
                      value={formTargetId || formDate}
                      onChange={(d) => {
                        setFormTargetId(d);
                        setFormDate(d);
                      }}
                      placeholder="انتخاب تاریخ یادداشت"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  متن کامل یادداشت:
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveNote(e);
                    }
                  }}
                  placeholder="متن یادداشت، توضیحات فنی، تغییرات ساعات... (Enter برای ثبت، Shift+Enter خط بعد)"
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-accent"
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-strong"
                  />
                  <span>سنجاق کردن این یادداشت در بالای لیست</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
