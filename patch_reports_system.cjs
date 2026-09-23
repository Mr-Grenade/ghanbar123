const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const targetStr = `<h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent-strong" />
              <span>تنظیمات سیستم</span>
            </h3>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">`;

const replaceStr = `<h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent-strong" />
              <span>تنظیمات سیستم</span>
            </h3>

            {/* Archive Selector */}
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--accent-primary)]" />
                  مدیریت ترم و آرشیو
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  مشاهده سیستم زنده (ترم جاری) یا جابجایی بین آرشیوهای قدیمی.
                </p>
              </div>
              <select
                value={activeArchiveId || ""}
                onChange={(e) => setActiveArchiveId(e.target.value || null)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] min-w-[200px]"
              >
                <option value="">سیستم زنده (ترم جاری)</option>
                {db.archives?.map((archive) => (
                  <option key={archive.id} value={archive.id}>
                    {archive.title} ({archive.startDate} تا {archive.endDate})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
