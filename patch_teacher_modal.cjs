const fs = require("fs");
let code = fs.readFileSync("src/components/TeachersManager.tsx", "utf8");

const modalHeaderRegex =
  /<h3 className="text-xl font-extrabold text-\[var\(--text-primary\)\]">\s*\{editingTeacher \? "ویرایش اطلاعات استاد" : "ثبت استاد جدید"\}\s*<\/h3>/;
const modalHeaderReplacement = `<h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                {editingTeacher ? "ویرایش اطلاعات استاد" : "ثبت استاد جدید"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-sm"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  form="teacherForm"
                  className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-sm"
                >
                  ذخیره اطلاعات استاد
                </button>
              </div>`;

code = code.replace(modalHeaderRegex, modalHeaderReplacement);

const modalFormRegex =
  /<form onSubmit=\{handleSaveTeacher\} className="p-6 space-y-6 flex-1 overflow-y-auto">/;
const modalFormReplacement = `<form id="teacherForm" onSubmit={handleSaveTeacher} className="p-6 space-y-6 flex-1 overflow-y-auto">`;
code = code.replace(modalFormRegex, modalFormReplacement);

const modalFooterRegex =
  /<div className="flex justify-end gap-3 pt-4 border-t border-\[var\(--border-color\)\]">\s*<button\s*type="button"\s*onClick=\{\(\) => setShowAddEditModal\(false\)\}\s*className="px-4 py-2 rounded-xl bg-\[var\(--bg-tertiary\)\] text-\[var\(--text-secondary\)\] font-semibold"\s*>\s*انصراف\s*<\/button>\s*<button\s*type="submit"\s*className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover"\s*>\s*ذخیره اطلاعات استاد\s*<\/button>\s*<\/div>/;
code = code.replace(modalFooterRegex, "");

fs.writeFileSync("src/components/TeachersManager.tsx", code);
