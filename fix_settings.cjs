const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const targetCheck = `<label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={enableConflictDetection}
                    onChange={(e) =>
                      setEnableConflictDetection(e.target.checked)
                    }
                    className="w-5 h-5 rounded border-[var(--border-color)] text-accent focus:ring-accent shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-primary)] text-sm">
                      فعال‌سازی سیستم جلوگیری از تداخل زمانی و تقویم هوشمند
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      با غیرفعال کردن این گزینه، هشدار و قفل تداخل زمانی در
                      فرم‌های افزودن/ویرایش هنرجو و کلاس فوق‌العاده نمایش داده
                      نمی‌شود و امکان ثبت زمان‌های متداخل فراهم می‌شود.
                    </span>
                  </div>
                </label>`;

const replaceCheck = `<div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-primary)] text-sm">
                      سیستم جلوگیری از تداخل زمانی و تقویم هوشمند
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed max-w-lg">
                      با غیرفعال کردن این گزینه، هشدار و قفل تداخل زمانی در فرم‌های افزودن/ویرایش نمایش داده نمی‌شود.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableConflictDetection(!enableConflictDetection)}
                    className={\`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${enableConflictDetection ? "bg-success-strong" : "bg-slate-300 dark:bg-slate-700"}\`}
                  >
                    <span
                      className={\`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${enableConflictDetection ? "-translate-x-5" : "translate-x-0"}\`}
                    />
                  </button>
                </div>`;
code = code.replace(targetCheck, replaceCheck);

fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
