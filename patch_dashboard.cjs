const fs = require("fs");
let code = fs.readFileSync("src/components/DashboardOverview.tsx", "utf8");

// 1. Add editingNoteId state
const stateTarget = `  const [newNotePinned, setNewNotePinned] = useState(false);`;
const stateReplacement = `  const [newNotePinned, setNewNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add openEditNote function and modify handleSaveNote
const handleSaveTarget = `  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      showToast("لطفاً عنوان و متن یادداشت را وارد کنید.", "warning");
      return;
    }

    addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      pinned: newNotePinned,
      date: selectedDate || getTodayString(),
      targetType: "general",
    });

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteCategory("اطلاعیه");
    setNewNotePinned(false);
    setShowAddNoteModal(false);
  };`;

const handleSaveReplacement = `  const openEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteCategory(note.category || "اطلاعیه");
    setNewNotePinned(note.pinned || false);
    setShowAddNoteModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      showToast("لطفاً عنوان و متن یادداشت را وارد کنید.", "warning");
      return;
    }

    if (editingNoteId) {
      deleteNote(editingNoteId); // Remove old one before re-adding, simplistic approach
      addNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        category: newNoteCategory,
        pinned: newNotePinned,
        date: selectedDate || getTodayString(),
        targetType: "general",
      });
      setEditingNoteId(null);
    } else {
      addNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        category: newNoteCategory,
        pinned: newNotePinned,
        date: selectedDate || getTodayString(),
        targetType: "general",
      });
    }

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteCategory("اطلاعیه");
    setNewNotePinned(false);
    setShowAddNoteModal(false);
  };`;
code = code.replace(handleSaveTarget, handleSaveReplacement);

// 3. Remove "add note" from bottom, and add cursor-pointer to note div
const notesHtmlTarget = `          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="w-full py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]/70 text-xs font-bold text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-accent-strong" />
              <span>+ افزودن یادداشت جدید</span>
            </button>
          </div>`;
code = code.replace(notesHtmlTarget, "");

const noteDivTarget = `className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-2 relative group"`;
const noteDivReplacement = `className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs space-y-2 relative group cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    onClick={() => openEditNote(note)}`;
code = code.replace(noteDivTarget, noteDivReplacement);

// To prevent delete button from opening edit note, add stopPropagation to delete button
const deleteBtnTarget = `onClick={() => deleteNote(note.id)}`;
const deleteBtnReplacement = `onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}`;
code = code.replace(deleteBtnTarget, deleteBtnReplacement);

// 4. Update the add note logic at the top (reset state)
const addNoteTopBtnTarget = `onClick={() => setShowAddNoteModal(true)}`;
const addNoteTopBtnReplacement = `onClick={() => {
                  setEditingNoteId(null);
                  setNewNoteTitle("");
                  setNewNoteContent("");
                  setNewNoteCategory("اطلاعیه");
                  setNewNotePinned(false);
                  setShowAddNoteModal(true);
                }}`;
code = code.replace(addNoteTopBtnTarget, addNoteTopBtnReplacement);

// 5. Change Add Note Modal title based on editingNoteId
const modalTitleTarget = `افزودن یادداشت یا اطلاعیه جدید`;
const modalTitleReplacement = `{editingNoteId ? "ویرایش یادداشت" : "افزودن یادداشت یا اطلاعیه جدید"}`;
code = code.replace(modalTitleTarget, modalTitleReplacement);

const submitTextTarget = `ثبت یادداشت جدید`;
const submitTextReplacement = `{editingNoteId ? "بروزرسانی یادداشت" : "ثبت یادداشت جدید"}`;
code = code.replace(submitTextTarget, submitTextReplacement);

fs.writeFileSync("src/components/DashboardOverview.tsx", code);
