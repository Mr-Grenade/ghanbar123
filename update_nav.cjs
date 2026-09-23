const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

const regex = /<aside[\s\S]*?<\/aside>/;
const replacement = `<aside
      id="desktop-sidebar-nav"
      className="w-64 bg-[var(--bg-header-sidebar)] text-[var(--text-header-sidebar)] border-l border-[var(--border-header-sidebar)] flex flex-col justify-between p-3 shrink-0 select-none transition-colors duration-200 z-20"
    >
      <div className="flex flex-col gap-6 mb-6 mt-2">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-[var(--border-header-sidebar)] shrink-0">
            {db.settings.logoUrl ? (
              <img
                src={db.settings.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <AppLogo className="w-12 h-12 text-[#2563eb]" />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--text-header-sidebar)]">
              {db.settings.academyName}
            </h1>
            <p className="text-[10px] font-medium mt-1 px-2 leading-relaxed opacity-80 text-[var(--text-header-sidebar)]">
              سیستم مدیریت یکپارچه کلاس‌ها و حضور و غیاب
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 relative flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActiveTab === item.id;
          return (
            <div key={item.id} className="relative">
              {/* Cone curve indicator pointing to main content (left side in RTL) */}
              {isActive && (
                <div className="absolute -left-3 top-0 bottom-0 w-3 flex items-center justify-center z-10 overflow-visible">
                  <div className="w-0 h-0 border-y-[12px] border-y-transparent border-r-[12px] border-r-[var(--bg-primary)] drop-shadow-sm"></div>
                </div>
              )}
              
              <button
                id={\`nav-item-\${item.id}\`}
                onClick={() => handleTabChange(item.id)}
                className={\`relative w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium transition-all group overflow-visible \${
                  isActive
                    ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm font-semibold"
                    : "text-[var(--text-header-sidebar)] hover:bg-white/10 opacity-90 hover:opacity-100"
                }\`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon
                    className={\`w-4 h-4 transition-transform group-hover:scale-110 \${
                      isActive
                        ? "text-[var(--accent-primary)]"
                        : "text-[var(--text-header-sidebar)] opacity-80 group-hover:opacity-100"
                    }\`}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                
                {item.badge && (
                  <span
                    className={\`text-xs font-bold px-2 py-0.5 rounded-lg transition-all relative z-10 \${
                      isActive
                        ? "bg-[var(--accent-primary)]/20 text-[var(--accent-text)]"
                        : item.id === "payroll" && overdueStudentsCount > 0
                          ? "bg-[var(--danger)] text-white"
                          : "bg-white/20 text-white"
                    }\`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info Box */}
      <div className="flex justify-end p-2 mt-4">
        <span className="text-[9px] font-mono opacity-50 text-[var(--text-header-sidebar)]">
          نسخه ۲.۴.۰
        </span>
      </div>
    </aside>`;

code = code.replace(regex, replacement);
fs.writeFileSync("src/components/Navigation.tsx", code);
