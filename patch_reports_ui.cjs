const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const targetStr = `<div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      بارگذاری تصویر امضای دیجیتال:
                    </label>`;

const logoUploadStr = `<div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    بارگذاری لوگوی آموزشگاه (نمایش در هدر):
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        ref={logoFileInputRef}
                        onChange={handleLogoUpload}
                        className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-light)] file:text-[var(--accent-text)] hover:file:bg-[var(--accent-primary)] hover:file:text-white"
                      />
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        فرمت‌های مجاز: PNG, JPG. پیشنهاد: مربع، پس‌زمینه شفاف (Max 2MB).
                      </p>
                    </div>
                    {logoUrl && (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-300 shadow-2xs">
                        <img
                          src={logoUrl}
                          alt="لوگوی آموزشگاه"
                          className="max-h-12 max-w-[150px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="p-1.5 rounded-lg bg-danger-soft text-danger hover:bg-danger hover:text-white transition-colors"
                          title="حذف لوگو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      بارگذاری تصویر امضای دیجیتال:
                    </label>`;

code = code.replace(targetStr, logoUploadStr);
fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
