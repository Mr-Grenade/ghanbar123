const fs = require("fs");
let code = fs.readFileSync("src/components/AttendanceManager.tsx", "utf8");

// Replace "حاضر" buttons version 2
code = code.replace(
  /rec\.status === "present"[\s\S]*?\? "bg-success text-on-solid shadow-2xs"[\s\S]*?: "bg-\[var\(--bg-secondary\)\] text-\[var\(--text-secondary\)\] hover:bg-success-soft hover:text-success-strong border border-\[var\(--border-color\)\]"/g,
  `rec.status === "present" ? "bg-[var(--success)] text-white" : "bg-transparent border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success-soft)]"`,
);

// Replace "موجه" buttons version 2
code = code.replace(
  /rec\.status === "excused"[\s\S]*?\? "bg-warning text-on-solid shadow-2xs"[\s\S]*?: "bg-\[var\(--bg-secondary\)\] text-\[var\(--text-secondary\)\] hover:bg-warning-soft hover:text-warning-strong border border-\[var\(--border-color\)\]"/g,
  `rec.status === "excused" ? "bg-[var(--warning)] text-white" : "bg-transparent border border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning-soft)]"`,
);

// Replace "غیرموجه" buttons version 2
code = code.replace(
  /rec\.status === "no_show"[\s\S]*?\? "bg-danger text-on-solid shadow-2xs"[\s\S]*?: "bg-\[var\(--bg-secondary\)\] text-\[var\(--text-secondary\)\] hover:bg-danger-soft hover:text-danger-strong border border-\[var\(--border-color\)\]"/g,
  `rec.status === "no_show" ? "bg-[var(--danger)] text-white" : "bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"`,
);

// Replace "کنسلی" buttons version 2
code = code.replace(
  /rec\.status === "cancelled"[\s\S]*?\? "bg-info text-on-solid shadow-2xs"[\s\S]*?: "bg-\[var\(--bg-secondary\)\] text-\[var\(--text-secondary\)\] hover:bg-info-soft hover:text-info-strong border border-\[var\(--border-color\)\]"/g,
  `rec.status === "cancelled" ? "bg-[var(--info)] text-white" : "bg-transparent border border-[var(--info)] text-[var(--info)] hover:bg-[var(--info-soft)]"`,
);

fs.writeFileSync("src/components/AttendanceManager.tsx", code);
