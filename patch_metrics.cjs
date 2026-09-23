const fs = require("fs");
let code = fs.readFileSync("src/components/AttendanceManager.tsx", "utf8");

// Replace metrics bar
const metricsStart = '<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">';
const metricsEnd =
  "{/* ================= VIEW 1: HOUR-BASED TIMELINE VIEW ================= */}";
const startIdx = code.indexOf(metricsStart);
const endIdx = code.indexOf(metricsEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newMetrics = `<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--success)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">تشکیل شده</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(presentCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--success-soft)]">
            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--warning)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">غیبت موجه</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(excusedCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--warning-soft)]">
            <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--danger)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">غیبت غیرموجه</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(noShowCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--danger-soft)]">
            <XCircle className="w-5 h-5 text-[var(--danger)]" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] border-r-0 border-l-[3px] border-l-[var(--info)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">کنسلی استاد</div>
            <div className="text-xl font-bold font-mono mt-0.5 text-[var(--text-primary)]">
              {toPersianDigits(cancelledCount)} جلسه
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--info-soft)]">
            <Award className="w-5 h-5 text-[var(--info)]" />
          </div>
        </div>
      </div>

      `;
  code = code.substring(0, startIdx) + newMetrics + code.substring(endIdx);
  fs.writeFileSync("src/components/AttendanceManager.tsx", code);
}
