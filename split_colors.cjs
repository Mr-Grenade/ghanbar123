const fs = require("fs");

let code = fs.readFileSync("src/styles.css", "utf8");

// Replace `--color-header-sidebar:` with separate properties
code = code.replace(
  /  --color-header-sidebar: var\(--bg-header-sidebar, var\(--bg-secondary\)\);/g,
  `  --color-header: var(--bg-header, var(--bg-primary));
  --color-header-text: var(--text-header, var(--text-primary));
  --color-header-border: var(--border-header, var(--border-color));
  
  --color-sidebar: var(--bg-sidebar, var(--bg-secondary));
  --color-sidebar-text: var(--text-sidebar, var(--text-primary));
  --color-sidebar-border: var(--border-sidebar, var(--border-color));`,
);
code = code.replace(
  /  --color-header-sidebar-text: var\(--text-header-sidebar, var\(--text-primary\)\);\n/g,
  "",
);
code = code.replace(
  /  --color-header-sidebar-border: var\(--border-header-sidebar, var\(--border-color\)\);\n/g,
  "",
);

// Replace light theme definition
code = code.replace(
  /  --bg-header-sidebar: #0f172a; \/\* Navy \*\/\n  --text-header-sidebar: #ffffff;\n  --border-header-sidebar: #1e293b;/g,
  `  /* Header */
  --bg-header: #ffffff;
  --text-header: #1e293b;
  --border-header: #e2e8f0;
  
  /* Sidebar */
  --bg-sidebar: #0f172a;
  --text-sidebar: #ffffff;
  --border-sidebar: #1e293b;`,
);

// Replace dark theme definition
code = code.replace(
  /  --bg-header-sidebar: #020617; \/\* Even darker Navy \*\/\n  --text-header-sidebar: #f8fafc;\n  --border-header-sidebar: #0f172a;/g,
  `  /* Header */
  --bg-header: #020617;
  --text-header: #f8fafc;
  --border-header: #0f172a;
  
  /* Sidebar */
  --bg-sidebar: #020617;
  --text-sidebar: #f8fafc;
  --border-sidebar: #0f172a;`,
);

// Replace fallback themes definition
code = code.replace(
  /  --bg-header-sidebar: var\(--bg-secondary\);\n  --text-header-sidebar: var\(--text-primary\);\n  --border-header-sidebar: var\(--border-color\);/g,
  `  --bg-header: var(--bg-primary);
  --text-header: var(--text-primary);
  --border-header: var(--border-color);
  
  --bg-sidebar: var(--bg-secondary);
  --text-sidebar: var(--text-primary);
  --border-sidebar: var(--border-color);`,
);

fs.writeFileSync("src/styles.css", code);
