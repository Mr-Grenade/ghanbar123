const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

// 1. Remove the Archive/Live badge from the top bar
const archiveBadgeRegex =
  /\{\/\* Archive\/Live Status Badge \*\/\}[\s\S]*?<\/div>\n      <\/div>/;
code = code.replace(archiveBadgeRegex, "");

// 2. Replace the Auto-save status indicator with the new combined one
const autosaveRegex =
  /\{\/\* Auto-save Status Indicator: Clean pulsing green or red dot without text \*\/\}[\s\S]*?<\/div>/;
const newAutosave = `{/* Auto-save / Archive Status Indicator */}
        <div
          id="autosave-status-badge"
          className={\`flex items-center justify-center \${isArchiveView ? "px-3 py-1.5 gap-2 bg-red-50 border-red-200" : "p-2 bg-[var(--bg-tertiary)] border-[var(--border-color)]"} rounded-xl border transition-all cursor-default\`}
          title={
            isArchiveView
              ? \`مشاهده آرشیو: \${db.archives?.find((a) => a.id === activeArchiveId)?.title || "ترم گذشته"}\`
              : isAutoSaving
                ? "درحال ذخیره‌سازی داده‌ها در پایگاه داده محلی..."
                : "ذخیره‌سازی خودکار و آنی در پایگاه داده محلی فعال است"
          }
        >
          {isAutoSaving && !isArchiveView ? (
            <RefreshCw className="w-4 h-4 text-warning-strong animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${isArchiveView ? "bg-red-500" : "bg-[var(--success)]"}\`}></span>
                <span className={\`relative inline-flex rounded-full h-3 w-3 \${isArchiveView ? "bg-red-600" : "bg-[var(--success)]"}\`}></span>
              </span>
              {isArchiveView && (
                <span className="text-xs font-bold text-red-600">آرشیو</span>
              )}
            </div>
          )}
        </div>`;

code = code.replace(autosaveRegex, newAutosave);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
