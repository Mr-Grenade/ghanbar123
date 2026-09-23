const fs = require("fs");
let code = fs.readFileSync("src/components/StudentsManager.tsx", "utf8");

// I'll manually modify the Student Edit/Add modal since my previous regex didn't catch it correctly.
const studentHeaderTarget = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingStudent
                  ? \`ویرایش اطلاعات هنرجو: \${editingStudent.name}\`
                  : "ثبت نام هنرجو"}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>
            </div>`;
const studentHeaderReplacement = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingStudent
                  ? \`ویرایش اطلاعات هنرجو: \${editingStudent.name}\`
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
            </div>`;
code = code.replace(studentHeaderTarget, studentHeaderReplacement);

const studentFormTarget = `<form
              onSubmit={handleSaveStudent}
              className="flex-1 min-h-0 mt-4 grid md:grid-cols-12 gap-6 overflow-hidden text-xs"
            >`;
const studentFormReplacement = `<form
              id="studentForm"
              onSubmit={handleSaveStudent}
              className="flex-1 min-h-0 mt-4 grid md:grid-cols-12 gap-6 overflow-hidden text-xs"
            >`;
code = code.replace(studentFormTarget, studentFormReplacement);

const studentFooterTarget = `<div className="mt-auto pt-4 pb-2">
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
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
                      ذخیره اطلاعات هنرجو
                    </button>
                  </div>
                </div>`;
code = code.replace(studentFooterTarget, "");

fs.writeFileSync("src/components/StudentsManager.tsx", code);
