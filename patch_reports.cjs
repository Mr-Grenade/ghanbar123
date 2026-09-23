const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const useAcademyRegex =
  /export const ReportsExportManager: React\.FC = \(\) => \{\s*const \{\s*db,/;
const useAcademyReplacement = `export const ReportsExportManager: React.FC = () => {
  const {
    db,
    theme,
    setTheme,`;
code = code.replace(useAcademyRegex, useAcademyReplacement);

const settingsSectionRegex =
  /<span className="font-semibold text-\[var\(--text-primary\)\] text-sm">\s*اجرای برنامه با نسبت تصویر 16:9\s*<\/span>\s*<\/label>/;
const settingsSectionReplacement = `<span className="font-semibold text-[var(--text-primary)] text-sm">
                      اجرای برنامه با نسبت تصویر 16:9
                    </span>
                  </label>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      تم و رنگ‌بندی برنامه:
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
                      <option value="light">تم روشن (اصلی)</option>
                      <option value="dark">تم تیره (اصلی)</option>
                      <option value="fall-1">پاییز ۱ (گرم و مسی)</option>
                      <option value="fall-2">پاییز ۲ (زیتونی و طلایی)</option>
                      <option value="spring-1">بهار ۱ (سبز چمنزار)</option>
                      <option value="spring-2">بهار ۲ (بنفش و نعنایی)</option>
                      <option value="summer-1">تابستان ۱ (آفتابی و شنی)</option>
                      <option value="summer-2">تابستان ۲ (آبی فیروزه‌ای)</option>
                      <option value="winter-1">زمستان ۱ (آبی قطبی)</option>
                      <option value="winter-2">زمستان ۲ (نقره‌ای و بنفش تیره)</option>
                    </select>
                  </div>`;
code = code.replace(settingsSectionRegex, settingsSectionReplacement);

fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
