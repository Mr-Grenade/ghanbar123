const fs = require("fs");
let code = fs.readFileSync("src/components/StudentsManager.tsx", "utf8");

// Move save button to header for Student Modal
const studentHeaderRegex =
  /<h3 className="text-xl font-extrabold text-\[var\(--text-primary\)\]">\s*\{editingStudent \? "ویرایش هنرجو" : "ثبت هنرجوی جدید"\}\s*<\/h3>/;
const studentHeaderReplacement = `<h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    {editingStudent ? "ویرایش هنرجو" : "ثبت هنرجوی جدید"}
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
                      form="studentForm"
                      className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-sm"
                    >
                      ذخیره
                    </button>
                  </div>`;
code = code.replace(studentHeaderRegex, studentHeaderReplacement);

// Remove save button from bottom of Student Modal
const studentFooterRegex =
  /<div className="mt-auto pt-4 pb-2">\s*<div className="flex items-center justify-end gap-2 pt-3 border-t border-\[var\(--border-color\)\]">\s*<button\s*type="button"\s*onClick=\{\(\) => setShowAddEditModal\(false\)\}\s*className="px-4 py-2 rounded-xl bg-\[var\(--bg-tertiary\)\] text-\[var\(--text-secondary\)\] font-semibold"\s*>\s*انصراف\s*<\/button>\s*<button\s*type="submit"\s*className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover"\s*>\s*ذخیره اطلاعات هنرجو\s*<\/button>\s*<\/div>\s*<\/div>/;
code = code.replace(studentFooterRegex, "");

// Give the student form an ID so the submit button in header works
const studentFormRegex =
  /<form onSubmit=\{handleSaveStudent\} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 flex-1 min-h-0">/;
const studentFormReplacement = `<form id="studentForm" onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 flex-1 min-h-0">`;
code = code.replace(studentFormRegex, studentFormReplacement);

// Move save button to header for Extra Class Modal
const extraClassHeaderRegex =
  /<h3 className="text-xl font-extrabold text-\[var\(--text-primary\)\]">\s*ثبت کلاس فوق‌العاده جدید\s*<\/h3>/;
const extraClassHeaderReplacement = `<h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    ثبت کلاس فوق‌العاده جدید
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExtraClassModal(false)}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold text-sm hover:bg-[var(--bg-tertiary)]/80"
                    >
                      بستن
                    </button>
                    <button
                      type="submit"
                      form="extraClassForm"
                      className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover text-sm"
                    >
                      ثبت مورد جدید
                    </button>
                  </div>`;
code = code.replace(extraClassHeaderRegex, extraClassHeaderReplacement);

const extraClassFooterRegex =
  /<div className="flex justify-end gap-3 pt-4 border-t border-\[var\(--border-color\)\]">\s*<button\s*type="button"\s*onClick=\{\(\) => setShowAddExtraClassModal\(false\)\}\s*className="px-4 py-2 rounded-xl bg-\[var\(--bg-tertiary\)\] text-\[var\(--text-secondary\)\] font-semibold hover:bg-\[var\(--bg-tertiary\)\]\/80"\s*>\s*بستن\s*<\/button>\s*<button\s*type="submit"\s*className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover"\s*>\s*ثبت مورد جدید\s*<\/button>\s*<\/div>/;
code = code.replace(extraClassFooterRegex, "");

const extraClassFormRegex =
  /<form onSubmit=\{handleSaveExtraClass\} className="p-6 space-y-5">/;
const extraClassFormReplacement = `<form id="extraClassForm" onSubmit={handleSaveExtraClass} className="p-6 space-y-5">`;
code = code.replace(extraClassFormRegex, extraClassFormReplacement);

fs.writeFileSync("src/components/StudentsManager.tsx", code);
