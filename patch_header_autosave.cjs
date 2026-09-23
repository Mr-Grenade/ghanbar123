const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const targetStr = `{/* Auto-save / Archive Status Indicator */}
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

const newStr = `{/* Auto-save / Archive Status Indicator */}
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
                <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${isArchiveView ? "bg-red-500" : "bg-success"}\`}></span>
                <span className={\`relative inline-flex rounded-full h-3 w-3 \${isArchiveView ? "bg-red-600" : "bg-success"}\`}></span>
              </span>
              {isArchiveView && (
                <span className="text-xs font-bold text-red-600">آرشیو</span>
              )}
            </div>
          )}
        </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
