const fs = require("fs");
let css = fs.readFileSync("src/styles.css", "utf8");

css = css.replace(
  /\/\* ---------------- Light — User Requested Theme ---------------- \*\/[\s\S]*?\/\* ---------------- Dark — Deep Slate ---------------- \*\//,
  `/* ---------------- Light — User Requested Theme ---------------- */
:root,
[data-theme="light"] {
  /* NEW BASE / SURFACE COLORS */
  --bg-primary: #F5F7FA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #EEF2F6;
  
  /* NEW TEXT COLORS */
  --text-primary: #16222E;
  --text-secondary: #55677A;
  --text-muted: #93A1B0;
  
  /* BORDERS */
  --border-color: #E1E7EE;
  --border-strong: #C9D3DE;
  --shadow-tint: #16222E;
  
  /* PRIMARY ACCENT — Deep Sapphire */
  --accent-primary: #1D4E89;
  --accent-hover: #163C6B;
  --accent-active: #102C4F;
  --accent-light: #E5EEF7;
  --accent-text: #163C6B;
  --accent-border: #4C7FB8; /* 40% opacity handled in utilities if needed */
  --accent-disabled: #B9C9DA;
  --accent-fg: #FFFFFF;
  --on-solid: #FFFFFF;

  /* SECONDARY ACCENT — Bright Azure */
  --secondary-primary: #2C8FBF;
  --secondary-hover: #23709A;
  --secondary-light: #DFF1F8;
  --secondary-text: #1B5C7A;
  
  /* STATUS COLORS (Kept consistent with new semantics) */
  --success: #3E7D4C;
  --success-soft: #EAF5EC;
  --success-border: #3E7D4C;
  --success-strong: #3E7D4C;
  
  --warning: #A8730A;
  --warning-soft: #FDF3E0;
  --warning-border: #A8730A;
  --warning-strong: #A8730A;
  
  --danger: #B3261E;
  --danger-soft: #FBEAEA;
  --danger-border: #B3261E;
  --danger-strong: #B3261E;
  
  --info: #55677A;
  --info-soft: #EEF2F6;
  --info-border: #55677A;
  --info-strong: #55677A;
}

/* ---------------- Dark — Deep Slate ---------------- */`,
);

fs.writeFileSync("src/styles.css", css);
