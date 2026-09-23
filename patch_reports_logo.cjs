const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const targetStr = `{/* Signature Upload Area */}`;

const logoUploadStr = `{/* Logo Upload Area */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-accent-strong" />
                      <span>لوگوی آموزشگاه:</span>
                    </span>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      فایل PNG/JPG لوگوی آموزشگاه (نمایش در منوی بالا و گزارشات). پیشنهاد: مربع با پس‌زمینه شفاف.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-file-input"
                    ref={logoFileInputRef}
                  />
                  <label
                    htmlFor="logo-file-input"
                    className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] font-semibold cursor-pointer flex items-center gap-2 shadow-2xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>انتخاب و بارگذاری لوگو</span>
                  </label>

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

              {/* Signature Upload Area */}`;

code = code.replace(targetStr, logoUploadStr);
fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
