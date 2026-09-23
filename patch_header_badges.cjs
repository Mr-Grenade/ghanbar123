const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const targetStr = `<div className="flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-5 py-2 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-primary)]">
            <Calendar className="w-5 h-5 text-accent-strong shrink-0" />
            <span>{formatFullJalali(todayStr)}</span>
          </div>
          <span className="text-[var(--border-color)] font-bold text-base">
            |
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-accent-soft border border-accent-border text-accent-strong text-base md:text-lg font-extrabold tracking-wider">
            <Clock className="w-4 h-4 text-accent-strong animate-pulse" />
            <span>{toPersianDigits(currentTime)}</span>
          </div>
        </div>`;

const newStr = `<div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-5 py-2 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-primary)]">
            <Calendar className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
            <span>{formatFullJalali(todayStr)}</span>
          </div>
          <span className="text-[var(--border-color)] font-bold text-base">
            |
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--accent-primary)] text-base md:text-lg font-extrabold tracking-wider">
            <Clock className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
            <span>{toPersianDigits(currentTime)}</span>
          </div>
        </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
