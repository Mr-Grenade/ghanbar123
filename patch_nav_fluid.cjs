const fs = require("fs");
const path = require("path");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

const returnRegex = /return \(\s*<aside[\s\S]*?\);\s*\};/;

const newReturn = `return (
    <aside
      id="desktop-sidebar-nav"
      className="w-64 bg-[var(--bg-header-sidebar)] text-[var(--text-header-sidebar)] border-l border-[var(--border-header-sidebar)] flex flex-col justify-between py-5 shrink-0 select-none transition-colors duration-200 z-20 relative"
    >
      <div className="flex flex-col gap-6 mb-8 mt-2 px-3">
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
            <p className="text-[10px] font-medium mt-1.5 px-2 leading-relaxed opacity-80 text-[var(--text-header-sidebar)]">
              سیستم مدیریت یکپارچه کلاس‌ها و حضور و غیاب
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActiveTab === item.id;
          return (
            <div key={item.id} className="relative w-full">
              {isActive ? (
                <button
                  id={\`nav-item-\${item.id}\`}
                  onClick={() => handleTabChange(item.id)}
                  className="relative w-[calc(100%-11px)] flex items-center justify-between py-3 mr-[12px] ml-[-1px] pl-4 pr-4 rounded-r-2xl text-xs font-medium transition-all group overflow-visible bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm font-semibold z-10"
                >
                  {/* Top Curve */}
                  <div
                    className="absolute -top-[20px] left-0 w-[20px] h-[20px] pointer-events-none bg-[var(--bg-primary)]"
                    style={{
                      maskImage: 'radial-gradient(circle at 100% 0%, transparent 20px, black 20.5px)',
                      WebkitMaskImage: 'radial-gradient(circle at 100% 0%, transparent 20px, black 20.5px)'
                    }}
                  />
                  {/* Bottom Curve */}
                  <div
                    className="absolute -bottom-[20px] left-0 w-[20px] h-[20px] pointer-events-none bg-[var(--bg-primary)]"
                    style={{
                      maskImage: 'radial-gradient(circle at 100% 100%, transparent 20px, black 20.5px)',
                      WebkitMaskImage: 'radial-gradient(circle at 100% 100%, transparent 20px, black 20.5px)'
                    }}
                  />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className="w-5 h-5 text-[var(--accent-primary)] drop-shadow-sm" />
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg transition-all relative z-10 bg-[var(--accent-primary)]/15 text-[var(--accent-text)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  id={\`nav-item-\${item.id}\`}
                  onClick={() => handleTabChange(item.id)}
                  className="relative w-[calc(100%-24px)] flex items-center justify-between px-4 py-3 mx-3 rounded-xl text-xs font-medium transition-all group text-[var(--text-header-sidebar)] hover:bg-white/10 opacity-80 hover:opacity-100"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span
                      className={\`text-xs font-bold px-2.5 py-1 rounded-lg transition-all relative z-10 \${
                        item.id === "payroll" && overdueStudentsCount > 0
                          ? "bg-[var(--danger)] text-white"
                          : "bg-white/20 text-white"
                      }\`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer Info Box */}
      <div className="flex justify-center p-2 mt-4">
        <span className="text-[10px] font-mono opacity-50 text-[var(--text-header-sidebar)]">
          نسخه ۲.۴.۰
        </span>
      </div>
    </aside>
  );
};`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync("src/components/Navigation.tsx", code);
