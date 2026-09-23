const fs = require("fs");

const cssContent = `@import "tailwindcss" source(none);
@source "../src";

/* Theme switching is driven by data-theme on <html> (set by AcademyContext). */
@custom-variant dark (&:where([data-theme="dark"] *));

@theme inline {
  --color-canvas: var(--bg-primary);
  --color-surface: var(--bg-secondary);
  --color-surface-2: var(--bg-tertiary);
  --color-line: var(--border-color);
  --color-ink: var(--text-primary);
  --color-ink-2: var(--text-secondary);
  --color-ink-muted: var(--text-muted);
  --color-accent: var(--accent-primary);
  --color-accent-hover: var(--accent-hover);
  --color-accent-soft: var(--accent-light);
  --color-accent-strong: var(--accent-text);
  --color-accent-border: var(--accent-border);
  --color-accent-fg: var(--accent-fg);
  --color-on-solid: var(--on-solid);

  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-success-border: var(--success-border);
  --color-success-strong: var(--success-strong);

  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-warning-border: var(--warning-border);
  --color-warning-strong: var(--warning-strong);

  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-danger-border: var(--danger-border);
  --color-danger-strong: var(--danger-strong);

  --color-info: var(--info);
  --color-info-soft: var(--info-soft);
  --color-info-border: var(--info-border);
  --color-info-strong: var(--info-strong);

  /* Extend border radius logic */
  --radius-app: 1.25rem;
}

/* ---------------- 1. Main Light Theme ---------------- */
:root, [data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f4f6f8;
  --bg-tertiary: #e9ecef;
  --text-primary: #0a192f;
  --text-secondary: #172a45;
  --text-muted: #5c6b73;
  --border-color: #d0d7dd;
  --shadow-tint: #0a192f;

  /* Accent: Yellow */
  --accent-primary: #ffc300;
  --accent-hover: #e6b000;
  --accent-light: #fff9e6;
  --accent-text: #cc8800;
  --accent-border: #ffe680;
  --accent-fg: #0a192f;
  --on-solid: #0a192f;

  /* Semantic Colors */
  --success: #34c08d;
  --success-soft: #eaf8f3;
  --success-border: #bcebda;
  --success-strong: #23825f;

  --warning: #f39c12;
  --warning-soft: #fef5e7;
  --warning-border: #fad7a1;
  --warning-strong: #a66a0c;

  --danger: #e74c3c;
  --danger-soft: #fdf2f0;
  --danger-border: #f6b9b3;
  --danger-strong: #a82315;

  /* Info: Blue */
  --info: #007bff;
  --info-soft: #e6f2ff;
  --info-border: #99cbff;
  --info-strong: #0056b3;
}

/* ---------------- 2. Main Dark Theme ---------------- */
[data-theme="dark"] {
  --bg-primary: #0a192f;
  --bg-secondary: #112240;
  --bg-tertiary: #233554;
  --text-primary: #e6f1ff;
  --text-secondary: #8892b0;
  --text-muted: #a8b2d1;
  --border-color: #3b4c6b;
  --shadow-tint: #000000;

  /* Accent: Yellow */
  --accent-primary: #ffc300;
  --accent-hover: #ffd000;
  --accent-light: #332700;
  --accent-text: #ffe680;
  --accent-border: #806200;
  --accent-fg: #0a192f;
  --on-solid: #0a192f;

  /* Semantic */
  --success: #34c08d;
  --success-soft: #10281f;
  --success-border: #1e5342;
  --success-strong: #8ee6c3;

  --warning: #f39c12;
  --warning-soft: #2e1d03;
  --warning-border: #7a4e09;
  --warning-strong: #f9ce88;

  --danger: #e74c3c;
  --danger-soft: #2d0e0b;
  --danger-border: #73261e;
  --danger-strong: #f3a59d;

  --info: #007bff;
  --info-soft: #001833;
  --info-border: #003d80;
  --info-strong: #80bfff;
}

/* ---------------- 3. Fall 1 (Copper & Rust) ---------------- */
[data-theme="fall-1"] {
  --bg-primary: #f5eee5;
  --bg-secondary: #fdf9f4;
  --bg-tertiary: #e9dbcb;
  --text-primary: #291508;
  --text-secondary: #50301b;
  --text-muted: #7d5c43;
  --border-color: #d9c0a8;
  --shadow-tint: #4c2a12;

  --accent-primary: #b4471c;
  --accent-hover: #8f3615;
  --accent-light: #fbe6d8;
  --accent-text: #7d2f11;
  --accent-border: #e8bfa4;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #14705a; --success-soft: #ddefe8; --success-border: #a4d3c4; --success-strong: #0d5041;
  --warning: #a86d0a; --warning-soft: #f8ecd5; --warning-border: #e2c99a; --warning-strong: #764c07;
  --danger: #b53a2c; --danger-soft: #f9e4df; --danger-border: #ebb4a8; --danger-strong: #85271c;
  --info: #6d5399; --info-soft: #eee9f5; --info-border: #cdc0e0; --info-strong: #4d3a6f;
}

/* ---------------- 4. Fall 2 (Olive & Gold) ---------------- */
[data-theme="fall-2"] {
  --bg-primary: #f2efe9;
  --bg-secondary: #faf8f5;
  --bg-tertiary: #e2decb;
  --text-primary: #2f2a1b;
  --text-secondary: #4a4331;
  --text-muted: #6e644a;
  --border-color: #d1c8ab;
  --shadow-tint: #2f2a1b;

  --accent-primary: #8a7c22;
  --accent-hover: #6e6219;
  --accent-light: #f2f0dc;
  --accent-text: #524a10;
  --accent-border: #c8c08a;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #34633e; --success-soft: #d9e9db; --success-border: #99c2a5; --success-strong: #1a3b22;
  --warning: #c26e11; --warning-soft: #faebd9; --warning-border: #e8b98b; --warning-strong: #784206;
  --danger: #9c3328; --danger-soft: #f2dddb; --danger-border: #d99f98; --danger-strong: #591912;
  --info: #4a6878; --info-soft: #e2ebf0; --info-border: #a8c1cf; --info-strong: #273b45;
}

/* ---------------- 5. Spring 1 (Meadow Green) ---------------- */
[data-theme="spring-1"] {
  --bg-primary: #eef5ee;
  --bg-secondary: #fbfdfa;
  --bg-tertiary: #dcebdb;
  --text-primary: #12220f;
  --text-secondary: #2c4429;
  --text-muted: #587054;
  --border-color: #bfd7bd;
  --shadow-tint: #2c4429;

  --accent-primary: #2f7d4f;
  --accent-hover: #24603d;
  --accent-light: #dff0e4;
  --accent-text: #1e5335;
  --accent-border: #aed4bb;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #14795c; --success-soft: #dcf1e7; --success-border: #a5d7c5; --success-strong: #0d5744;
  --warning: #a97207; --warning-soft: #f8eed6; --warning-border: #e3cd9d; --warning-strong: #7a5105;
  --danger: #b93f36; --danger-soft: #f8e6e4; --danger-border: #e8b7b2; --danger-strong: #872b24;
  --info: #4f6fbd; --info-soft: #e6ecf8; --info-border: #bcc9e8; --info-strong: #38508e;
}

/* ---------------- 6. Spring 2 (Lavender & Mint) ---------------- */
[data-theme="spring-2"] {
  --bg-primary: #f6f4fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e9e5f2;
  --text-primary: #2d243b;
  --text-secondary: #4b3e5e;
  --text-muted: #74638a;
  --border-color: #d1c8e3;
  --shadow-tint: #2d243b;

  --accent-primary: #8561c5;
  --accent-hover: #6b4ca1;
  --accent-light: #ebe4f7;
  --accent-text: #50377a;
  --accent-border: #c8b5eb;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #35a881; --success-soft: #e0f5ee; --success-border: #a8dfcc; --success-strong: #1b634a;
  --warning: #d99138; --warning-soft: #fdf2e4; --warning-border: #f0cba1; --warning-strong: #8a571c;
  --danger: #d95f6c; --danger-soft: #faeaec; --danger-border: #edb8bf; --danger-strong: #8c3641;
  --info: #438bbb; --info-soft: #e5f1f7; --info-border: #abd1e8; --info-strong: #245575;
}

/* ---------------- 7. Winter 1 (Arctic Sapphire) ---------------- */
[data-theme="winter-1"] {
  --bg-primary: #eaf1f7;
  --bg-secondary: #f9fbfd;
  --bg-tertiary: #d7e3ef;
  --text-primary: #0b1926;
  --text-secondary: #21384c;
  --text-muted: #4d6780;
  --border-color: #bccfe0;
  --shadow-tint: #1b3350;

  --accent-primary: #1a6ea3;
  --accent-hover: #135381;
  --accent-light: #dceaf6;
  --accent-text: #10496f;
  --accent-border: #a9c9e2;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #12735c; --success-soft: #daeee8; --success-border: #a0d1c3; --success-strong: #0b5343;
  --warning: #a1700f; --warning-soft: #f6edd8; --warning-border: #ddc99f; --warning-strong: #714e08;
  --danger: #b23f3a; --danger-soft: #f7e6e5; --danger-border: #e6b6b3; --danger-strong: #822a26;
  --info: #5566bd; --info-soft: #e7eaf8; --info-border: #c1c8e9; --info-strong: #3b4a8e;
}

/* ---------------- 8. Winter 2 (Deep Plum & Silver) ---------------- */
[data-theme="winter-2"] {
  --bg-primary: #f2f3f7;
  --bg-secondary: #ffffff;
  --bg-tertiary: #e1e3e8;
  --text-primary: #271d2b;
  --text-secondary: #4b3d52;
  --text-muted: #74647d;
  --border-color: #c9c3ce;
  --shadow-tint: #271d2b;

  --accent-primary: #6b4c7a;
  --accent-hover: #533961;
  --accent-light: #ece7ef;
  --accent-text: #3c2847;
  --accent-border: #c4b5cd;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #3c8273; --success-soft: #e4f0ed; --success-border: #a8ccc4; --success-strong: #204d43;
  --warning: #ab7f3d; --warning-soft: #f5efe7; --warning-border: #d4bc97; --warning-strong: #63471c;
  --danger: #ad4b59; --danger-soft: #f5e6e8; --danger-border: #d6a4ab; --danger-strong: #6b2a34;
  --info: #4a778c; --info-soft: #e6eff2; --info-border: #adc6d1; --info-strong: #294754;
}

/* ---------------- 9. Summer 1 (Sunlit Sand) ---------------- */
[data-theme="summer-1"] {
  --bg-primary: #f6f0e2;
  --bg-secondary: #fffbf2;
  --bg-tertiary: #ebe0c9;
  --text-primary: #241708;
  --text-secondary: #46331e;
  --text-muted: #736044;
  --border-color: #dccdaf;
  --shadow-tint: #4a3618;

  --accent-primary: #c1731a;
  --accent-hover: #9c5a12;
  --accent-light: #fbecd4;
  --accent-text: #85480d;
  --accent-border: #e6c894;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #167a5b; --success-soft: #ddf0e7; --success-border: #a6d6c3; --success-strong: #0e5641;
  --warning: #b07a10; --warning-soft: #f9eed4; --warning-border: #e5cd98; --warning-strong: #7d550a;
  --danger: #bd4230; --danger-soft: #fae6e1; --danger-border: #ecb8ac; --danger-strong: #8a2c1f;
  --info: #6a5ac0; --info-soft: #ece9f8; --info-border: #c8c1ec; --info-strong: #4a3d90;
}

/* ---------------- 10. Summer 2 (Ocean Turquoise) ---------------- */
[data-theme="summer-2"] {
  --bg-primary: #eff7fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #dceef4;
  --text-primary: #12303d;
  --text-secondary: #275266;
  --text-muted: #517a8c;
  --border-color: #b5d5e0;
  --shadow-tint: #12303d;

  --accent-primary: #1e9ebd;
  --accent-hover: #167a94;
  --accent-light: #dcf2f7;
  --accent-text: #105a6e;
  --accent-border: #92d4e3;
  --accent-fg: #ffffff;
  --on-solid: #ffffff;

  --success: #35a878; --success-soft: #e2f5ee; --success-border: #a1dec6; --success-strong: #1b6345;
  --warning: #e09f3e; --warning-soft: #fbf2e3; --warning-border: #f2ce9c; --warning-strong: #8f601b;
  --danger: #d45959; --danger-soft: #fcebeb; --danger-border: #efaeae; --danger-strong: #8a3232;
  --info: #5575c4; --info-soft: #e8ecf7; --info-border: #b3c2e8; --info-strong: #334a85;
}

@layer base {
  *,
  *::before,
  *::after {
    border-color: var(--border-color);
    font-family: "Vazirmatn", sans-serif !important;
  }
  html,
  body {
    background: linear-gradient(
      170deg,
      var(--bg-primary) 0%,
      var(--bg-secondary) 100%
    );
    background-attachment: fixed;
    color: var(--text-primary);
    font-size: 19px;
    line-height: 1.65;
    letter-spacing: -0.01em;
    font-feature-settings: "tnum";
    font-family: "Vazirmatn", sans-serif !important;
  }
  input,
  button,
  select,
  textarea,
  optgroup {
    font-family: "Vazirmatn", sans-serif !important;
  }
  code,
  kbd,
  samp,
  pre,
  .font-mono {
    font-family: "Vazirmatn", sans-serif !important;
    font-variant-numeric: tabular-nums;
  }
  ::selection {
    background-color: color-mix(
      in srgb,
      var(--accent-primary) 28%,
      transparent
    );
  }
}

/* Attendance status tags — one shared vocabulary across every tab */
.tag-present,
.tag-excused,
.tag-cancelled,
.tag-noshow {
  font-weight: 700;
  border-width: 1px;
  border-style: solid;
}
.tag-present {
  background-color: var(--success-soft);
  color: var(--success-strong);
  border-color: var(--success-border);
}
.tag-excused {
  background-color: var(--warning-soft);
  color: var(--warning-strong);
  border-color: var(--warning-border);
}
.tag-cancelled {
  background-color: var(--info-soft);
  color: var(--info-strong);
  border-color: var(--info-border);
}
.tag-noshow {
  background-color: var(--danger-soft);
  color: var(--danger-strong);
  border-color: var(--danger-border);
}

@utility card-surface {
  background: linear-gradient(
    170deg,
    var(--bg-secondary) 0%,
    color-mix(in srgb, var(--bg-secondary) 70%, var(--bg-tertiary) 30%) 100%
  );
  border: 1px solid var(--border-color);
  border-radius: var(--radius-app);
  box-shadow: var(--shadow-card);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--text-muted) 45%, transparent);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--text-muted) 70%, transparent);
}

@media print {
  body {
    background: white !important;
    color: black !important;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
}

@layer utilities {
  /* Replace solid backgrounds with subtle gradients */
  .bg-\\[var\\(--bg-primary\\)\\] {
    background: linear-gradient(
      170deg,
      var(--bg-primary) 0%,
      var(--bg-secondary) 100%
    ) !important;
  }
  .bg-\\[var\\(--bg-secondary\\)\\] {
    background: linear-gradient(
      170deg,
      var(--bg-secondary) 0%,
      color-mix(in srgb, var(--bg-secondary) 70%, var(--bg-tertiary) 30%) 100%
    ) !important;
  }
  .bg-\\[var\\(--bg-tertiary\\)\\] {
    background: linear-gradient(
      170deg,
      var(--bg-tertiary) 0%,
      var(--bg-secondary) 100%
    ) !important;
  }
  .bg-accent {
    background: linear-gradient(
      135deg,
      var(--accent-primary) 0%,
      var(--accent-hover) 100%
    ) !important;
  }
  .bg-success {
    background: linear-gradient(
      135deg,
      var(--success) 0%,
      var(--success-strong) 100%
    ) !important;
  }
  .bg-danger {
    background: linear-gradient(
      135deg,
      var(--danger) 0%,
      var(--danger-strong) 100%
    ) !important;
  }
  .bg-warning {
    background: linear-gradient(
      135deg,
      var(--warning) 0%,
      var(--warning-strong) 100%
    ) !important;
  }
  .bg-info {
    background: linear-gradient(
      135deg,
      var(--info) 0%,
      var(--info-strong) 100%
    ) !important;
  }
}
`;

fs.writeFileSync("src/styles.css", cssContent);
