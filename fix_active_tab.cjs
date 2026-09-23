const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

const regex = /\{isActive \? \([\s\S]*?\) : \(/;

const replacement = `{isActive ? (
                <button
                  id={\`nav-item-\${item.id}\`}
                  onClick={() => handleTabChange(item.id)}
                  className="relative w-[calc(100%-12px)] flex items-center justify-between py-3 mr-3 pl-4 pr-4 rounded-r-2xl text-xs font-medium transition-all group overflow-visible bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold z-10"
                  style={{
                    marginLeft: '-1px',
                    width: 'calc(100% - 12px + 1px)'
                  }}
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
              ) : (`;

code = code.replace(regex, replacement);

fs.writeFileSync("src/components/Navigation.tsx", code);
