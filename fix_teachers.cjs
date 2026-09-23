const fs = require("fs");
let code = fs.readFileSync("src/components/TeachersManager.tsx", "utf8");

const targetHeader = `<div className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingTeacher
                  ? \`ویرایش اطلاعات استاد: \${editingTeacher.name}\`
                  : "افزودن استاد جدید"}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>
            </div>`;
const replaceHeader = `<div className="w-full max-w-7xl md:aspect-video flex flex-col bg-[var(--bg-secondary)] rounded-2xl p-6 shadow-xl border border-[var(--border-color)] space-y-4 max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingTeacher
                  ? \`ویرایش اطلاعات استاد: \${editingTeacher.name}\`
                  : "افزودن استاد جدید"}
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
                  form="teacherForm"
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-xs"
                >
                  ذخیره اطلاعات
                </button>
              </div>
            </div>`;
code = code.replace(targetHeader, replaceHeader);

const targetForm = `<form onSubmit={handleSaveTeacher} className="space-y-3.5 text-xs">`;
const replaceForm = `<form id="teacherForm" onSubmit={handleSaveTeacher} className="flex-1 min-h-0 mt-4 overflow-y-auto pr-2 pb-4 space-y-3.5 text-xs">`;
code = code.replace(targetForm, replaceForm);

const targetFooter = `<div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover"
                >
                  ذخیره اطلاعات استاد
                </button>
              </div>`;
code = code.replace(targetFooter, "");

fs.writeFileSync("src/components/TeachersManager.tsx", code);
