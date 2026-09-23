const fs = require("fs");
let code = fs.readFileSync("src/components/StudentsManager.tsx", "utf8");

const targetHeader = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-accent-strong" />
                <span>
                  مدیریت کلاس‌های فوق‌العاده:{" "}
                  {selectedStudentForExtraClass.name}
                </span>
              </h3>
              <button
                onClick={() => setSelectedStudentForExtraClass(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>`;
const replaceHeader = `<div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
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
            </div>`;
code = code.replace(targetHeader, replaceHeader);

const targetForm = `<form
                    onSubmit={(e) => {`;
const replaceForm = `<form
                    id="extraClassForm"
                    onSubmit={(e) => {`;
code = code.replace(targetForm, replaceForm);

const targetFooter = `<div className="flex items-center justify-end gap-2 pt-3 shrink-0">
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
code = code.replace(targetFooter, "");

fs.writeFileSync("src/components/StudentsManager.tsx", code);
