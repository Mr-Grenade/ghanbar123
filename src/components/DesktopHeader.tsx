import React, { useState, useEffect } from "react";
import { useAcademy } from "../context/AcademyContext";
import {
  formatFullJalali,
  toPersianDigits,
  getTodayString,
  getCurrentPersianSeason,
} from "../utils/persianDate";
import {
  Sun,
  Moon,
  Sparkles,
  Palette,
  Save,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  Clock,
  Leaf,
  SunMedium,
  Snowflake,
  Flame,
  History,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { exportMultiSheetExcel } from "../utils/excelExport";

interface DesktopHeaderProps {
  onOpenBackupModal?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onOpenBackupModal,
}) => {
  const {
    db,
    theme,
    activeArchiveId,
    isArchiveView,
    setTheme,
    isAutoSaving,
    lastSavedTime,
    searchQuery,
    setSearchQuery,
    exportBackup,
    setCurrentTab,
    showToast,
  } = useAcademy();

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getTodayString();

  return (
    <header
      id="desktop-header"
      className="bg-[var(--bg-header)] text-[var(--text-header)] border-b border-[var(--border-header)] px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors duration-200 gap-4"
    >
      {/* Spacer to push center content slightly or just keep it balanced */}
      <div className="hidden lg:block w-32 shrink-0"></div>

      {/* Center: Enlarged Prominent Date and Time Display centered in top bar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-header)]">
            <Calendar className="w-5 h-5 opacity-80 shrink-0" />
            <span>{formatFullJalali(todayStr)}</span>
          </div>
          <span className="text-[var(--text-header)] opacity-30 font-bold text-base">
            |
          </span>
          <div className="flex items-center gap-2 px-2 py-1 text-[var(--text-clock)] text-base md:text-lg font-extrabold tracking-wider">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{toPersianDigits(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Left Side (RTL End): Auto-save pulse dot, Theme Switcher, Quick Excel */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Auto-save / Archive Status Indicator */}
        <div
          id="autosave-status-badge"
          className={`flex items-center justify-center ${isArchiveView ? "px-3 py-1.5 gap-2 bg-red-50 border-red-200" : "p-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-color)]"} rounded-xl border transition-all cursor-default`}
          title={
            isArchiveView
              ? `مشاهده آرشیو: ${db.archives?.find((a) => a.id === activeArchiveId)?.title || "ترم گذشته"}`
              : isAutoSaving
                ? "درحال ذخیره‌سازی داده‌ها در پایگاه داده محلی..."
                : "ذخیره‌سازی خودکار و آنی در پایگاه داده محلی فعال است"
          }
        >
          {isAutoSaving && !isArchiveView ? (
            <RefreshCw className="w-4 h-4 text-warning-strong animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isArchiveView ? "bg-red-500" : "bg-success"}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${isArchiveView ? "bg-red-600" : "bg-success"}`}
                ></span>
              </span>
              {isArchiveView && (
                <span className="text-xs font-bold text-red-600">آرشیو</span>
              )}
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        {theme === "light" ? (
          <button
            id="btn-theme-dark"
            onClick={() => setTheme("dark")}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center"
            title="پوسته تاریک"
          >
            <Moon className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-theme-light"
            onClick={() => setTheme("light")}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center"
            title="پوسته روشن"
          >
            <Sun className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
