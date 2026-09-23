import React, { useState, useRef, useEffect } from "react";
import {
  MONTHS_FA,
  WEEKDAYS_FA,
  gregorianToJalali,
  jalaliToGregorian,
  toPersianDigits,
  getTodayString,
} from "../utils/persianDate";
import { Calendar, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { CustomSelect } from "./ui/custom-select";

interface ShamsiDatePickerProps {
  value: string; // Gregorian YYYY-MM-DD
  onChange: (gregorianDate: string) => void;
  label?: string;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  compact?: boolean;
  maxDate?: string; // Gregorian YYYY-MM-DD - disable future dates
  minDate?: string; // Gregorian YYYY-MM-DD
}

export const ShamsiDatePicker: React.FC<ShamsiDatePickerProps> = ({
  value,
  onChange,
  label,
  className = "",
  buttonClassName = "",
  placeholder = "انتخاب تاریخ شمسی",
  compact = false,
  maxDate,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupPlacement, setPopupPlacement] = useState<{
    horizontal: "right" | "left" | "center";
    vertical: "bottom" | "top";
  }>({ horizontal: "right", vertical: "bottom" });

  // Compute Jalali details of current selected value
  const getJalaliFromGDate = (gStr: string) => {
    if (!gStr) return null;
    const parts = gStr.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return null;
    return gregorianToJalali(parts[0], parts[1], parts[2]);
  };

  const selectedJalali = getJalaliFromGDate(value);
  const todayJalali = getJalaliFromGDate(getTodayString())!;

  // Internal view month and year
  const [viewYear, setViewYear] = useState<number>(
    selectedJalali?.jy || todayJalali.jy,
  );
  const [viewMonth, setViewMonth] = useState<number>(
    selectedJalali?.jm || todayJalali.jm,
  );

  // When opening picker, calculate boundary safety & sync view year/month with current value
  const handleOpen = () => {
    const cur = getJalaliFromGDate(value) || todayJalali;
    setViewYear(cur.jy);
    setViewMonth(cur.jm);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupWidth = 290;
      const popupHeight = 330;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let horizontal: "right" | "left" | "center" = "right";
      // In RTL with right: 0, the popup extends leftward: (rect.right - popupWidth)
      if (rect.right - popupWidth < 12) {
        // If not enough room to the left, align to the left of the button or center
        if (rect.left + popupWidth <= screenWidth - 12) {
          horizontal = "left";
        } else {
          horizontal = "center";
        }
      }

      let vertical: "bottom" | "top" = "bottom";
      if (screenHeight - rect.bottom < popupHeight && rect.top > popupHeight) {
        vertical = "top";
      }

      setPopupPlacement({ horizontal, vertical });
    }

    setIsOpen(!isOpen);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Days calculation in Jalali Month
  let daysInMonth = 30;
  if (viewMonth <= 6) daysInMonth = 31;
  else if (viewMonth === 12) {
    const isLeap = ((viewYear + 38) * 31) % 128 < 31;
    daysInMonth = isLeap ? 30 : 29;
  }

  // Find starting weekday of 1st day of this Jalali month
  const {
    gy: fGy,
    gm: fGm,
    gd: fGd,
  } = jalaliToGregorian(viewYear, viewMonth, 1);
  const firstDayDate = new Date(fGy, fGm - 1, fGd);
  const jsDay = firstDayDate.getDay(); // 0 is Sun, 6 is Sat
  const startDayOffset = (jsDay + 1) % 7; // 0 for شنبه (Sat), 1 for یکشنبه (Sun)

  const handleSelectDay = (dayNum: number) => {
    const { gy, gm, gd } = jalaliToGregorian(viewYear, viewMonth, dayNum);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const newGDate = `${gy}-${pad(gm)}-${pad(gd)}`;
    onChange(newGDate);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const tG = getTodayString();
    onChange(tG);
    const tj = getJalaliFromGDate(tG)!;
    setViewYear(tj.jy);
    setViewMonth(tj.jm);
    setIsOpen(false);
  };

  const displayText = selectedJalali
    ? `${toPersianDigits(selectedJalali.jd)} ${MONTHS_FA[selectedJalali.jm - 1]} ${toPersianDigits(selectedJalali.jy)}`
    : placeholder;

  const isFullWidth = className.includes("w-full");

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullWidth ? "w-full block" : "inline-block"} text-right ${className}`}
    >
      {label && (
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-accent-border text-[var(--text-primary)] text-xs font-medium shadow-2xs transition-all ${
          isFullWidth ? "w-full" : ""
        } ${
          isOpen ? "ring-2 ring-accent/20 border-accent-border" : ""
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Calendar className="w-3.5 h-3.5 text-accent-strong shrink-0" />
          <span className="truncate">{displayText}</span>
        </div>
        {selectedJalali && (
          <span className="text-[11px] text-[var(--text-muted)] font-mono shrink-0">
            ({toPersianDigits(selectedJalali.jy)}/
            {toPersianDigits(String(selectedJalali.jm).padStart(2, "0"))}/
            {toPersianDigits(String(selectedJalali.jd).padStart(2, "0"))})
          </span>
        )}
      </button>

      {/* Dropdown Calendar Popup */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-50 w-72 max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl text-xs select-none animate-in fade-in zoom-in-95 duration-150 ${
              popupPlacement.vertical === "top"
                ? "bottom-full mb-2"
                : "top-full mt-1.5"
            } ${
              popupPlacement.horizontal === "left"
                ? "left-0"
                : popupPlacement.horizontal === "center"
                  ? "left-1/2 -translate-x-1/2"
                  : "right-0"
            }`}
          >
            {/* Header: Month / Year / Prev / Next */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                <CustomSelect
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-transparent font-bold text-xs text-accent-strong cursor-pointer focus:outline-none"
                >
                  {MONTHS_FA.map((m, idx) => (
                    <option
                      key={m}
                      value={idx + 1}
                      className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    >
                      {m}
                    </option>
                  ))}
                </CustomSelect>
                <CustomSelect
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="bg-transparent font-bold text-xs text-accent-strong cursor-pointer focus:outline-none"
                >
                  {Array.from({ length: 15 }, (_, i) => 1395 + i).map((y) => (
                    <option
                      key={y}
                      value={y}
                      className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    >
                      {toPersianDigits(y)}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors"
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-[var(--text-muted)]">
              {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((w, idx) => (
                <div
                  key={w}
                  className={`py-1 ${idx === 6 ? "text-danger-strong font-bold" : ""}`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading offset days */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="p-1.5" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const {
                  gy: dayGy,
                  gm: dayGm,
                  gd: dayGd,
                } = jalaliToGregorian(viewYear, viewMonth, dayNum);
                const pad = (n: number) => n.toString().padStart(2, "0");
                const thisDayGDate = `${dayGy}-${pad(dayGm)}-${pad(dayGd)}`;

                const isFutureDisabled = maxDate
                  ? thisDayGDate > maxDate
                  : false;
                const isPastDisabled = minDate ? thisDayGDate < minDate : false;
                const isDisabled = isFutureDisabled || isPastDisabled;

                const isSelected =
                  selectedJalali &&
                  selectedJalali.jy === viewYear &&
                  selectedJalali.jm === viewMonth &&
                  selectedJalali.jd === dayNum;

                const isToday =
                  todayJalali.jy === viewYear &&
                  todayJalali.jm === viewMonth &&
                  todayJalali.jd === dayNum;

                const dayOfWeekIndex = (startDayOffset + i) % 7;
                const isFriday = dayOfWeekIndex === 6;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      isDisabled
                        ? "opacity-25 cursor-not-allowed text-[var(--text-muted)]"
                        : isSelected
                          ? "bg-accent text-on-solid shadow-xs scale-105"
                          : isToday
                            ? "bg-accent-soft text-accent-strong ring-1 ring-accent font-bold"
                            : isFriday
                              ? "text-danger-strong hover:bg-danger-soft"
                              : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    {toPersianDigits(dayNum)}
                  </button>
                );
              })}
            </div>

            {/* Footer quick action: Today button */}
            <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-xs text-accent-strong font-semibold hover:underline"
              >
                انتخاب امروز ({toPersianDigits(todayJalali.jd)}{" "}
                {MONTHS_FA[todayJalali.jm - 1]})
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-[11px] font-medium transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
