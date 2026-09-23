const fs = require("fs");
let code = fs.readFileSync("src/components/StudentsManager.tsx", "utf8");

const extraClassHeaderTarget = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 shrink-0">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                ثبت کلاس فوق‌العاده جدید
              </h3>
              <button
                onClick={() => setShowAddExtraClassModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>`;
const extraClassHeaderReplacement = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 shrink-0">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
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
              </div>
            </div>`;
code = code.replace(extraClassHeaderTarget, extraClassHeaderReplacement);

const extraClassFormTarget = `<form
                    onSubmit={handleSaveExtraClass}
                    className="p-6 space-y-5"
                  >`;
const extraClassFormReplacement = `<form
                    id="extraClassForm"
                    onSubmit={handleSaveExtraClass}
                    className="p-6 space-y-5"
                  >`;
code = code.replace(extraClassFormTarget, extraClassFormReplacement);

const extraClassFooterTarget = `<div className="flex items-center justify-end gap-2 pt-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForExtraClass(null)}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold hover:bg-[var(--bg-tertiary)]/80"
                      >
                        بستن
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-accent text-on-solid font-semibold hover:bg-accent-hover"
                      >
                        ثبت مورد جدید
                      </button>
                    </div>`;
code = code.replace(extraClassFooterTarget, "");

fs.writeFileSync("src/components/StudentsManager.tsx", code);
