const fs = require("fs");
let code = fs.readFileSync("src/styles.css", "utf8");

// We will inject the new vars into the @theme inline section
const themeInlineRegex = /@theme inline \{([\s\S]*?)\}/;
code = code.replace(themeInlineRegex, (match, inner) => {
  if (!inner.includes("--color-header-sidebar")) {
    return `@theme inline {${inner}
  --color-header-sidebar: var(--bg-header-sidebar, var(--bg-secondary));
  --color-header-sidebar-text: var(--text-header-sidebar, var(--text-primary));
  --color-header-sidebar-border: var(--border-header-sidebar, var(--border-color));
}`;
  }
  return match;
});

// Update Light Theme
const lightRegex = /:root, \[data-theme="light"\] \{([\s\S]*?)\}/;
code = code.replace(lightRegex, (match, inner) => {
  if (!inner.includes("--bg-header-sidebar")) {
    return `:root, [data-theme="light"] {${inner}
  /* Header & Sidebar specific */
  --bg-header-sidebar: #0f172a; /* Navy */
  --text-header-sidebar: #ffffff;
  --border-header-sidebar: #1e293b;
}`;
  }
  return match;
});

// Update Dark Theme
const darkRegex = /\[data-theme="dark"\] \{([\s\S]*?)\}/;
code = code.replace(darkRegex, (match, inner) => {
  if (!inner.includes("--bg-header-sidebar")) {
    return `[data-theme="dark"] {${inner}
  /* Header & Sidebar specific */
  --bg-header-sidebar: #020617; /* Even darker Navy */
  --text-header-sidebar: #f8fafc;
  --border-header-sidebar: #0f172a;
}`;
  }
  return match;
});

// We should also add these defaults to other themes so they don't break,
// using their existing bg-secondary and text-primary colors.
const otherThemesRegex =
  /\[data-theme="(fall-1|fall-2|spring-1|spring-2|winter-1|winter-2|summer-1|summer-2)"\] \{([\s\S]*?)\}/g;
code = code.replace(otherThemesRegex, (match, themeName, inner) => {
  if (!inner.includes("--bg-header-sidebar")) {
    // For other themes, let's just make the sidebar match their accent or secondary.
    // Actually, setting them to var(--bg-secondary) is safer.
    return `[data-theme="${themeName}"] {${inner}
  --bg-header-sidebar: var(--bg-secondary);
  --text-header-sidebar: var(--text-primary);
  --border-header-sidebar: var(--border-color);
}`;
  }
  return match;
});

fs.writeFileSync("src/styles.css", code);
