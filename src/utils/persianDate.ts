/**
 * Persian (Solar Hijri / Jalali) Date and Number Utilities
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ENGLISH_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const WEEKDAYS_FA = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export const MONTHS_FA = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/**
 * Convert English digits to Persian digits
 */
export function toPersianDigits(
  input: string | number | null | undefined,
): string {
  if (input === null || input === undefined) return "";
  const str = input.toString();
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * Convert Persian digits to English digits
 */
export function toEnglishDigits(str: string): string {
  if (!str) return "";
  return str.replace(/[۰-۹]/g, (w) => {
    return ENGLISH_DIGITS[PERSIAN_DIGITS.indexOf(w)];
  });
}

/**
 * Format currency with commas and optional Persian digits
 */
export function formatToman(
  amount: number,
  showUnit = true,
  persianDigits = true,
): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return showUnit
      ? persianDigits
        ? "۰ تومان"
        : "0 تومان"
      : persianDigits
        ? "۰"
        : "0";
  }
  const formatted = amount.toLocaleString("en-US");
  const result = persianDigits ? toPersianDigits(formatted) : formatted;
  return showUnit ? `${result} تومان` : result;
}

/**
 * Algorithm to convert Gregorian date to Jalali (Solar Hijri)
 */
export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Algorithm to convert Jalali to Gregorian date
 */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): { gy: number; gm: number; gd: number } {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd_m = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= gd_m[gm]) {
    days -= gd_m[gm];
    gm++;
  }
  return { gy, gm, gd: days + 1 };
}

/**
 * Convert YYYY-MM-DD (Gregorian) to Jalali string like "1403/12/01"
 */
export function toJalaliDateString(gDateStr: string): string {
  if (!gDateStr) return "";
  const parts = gDateStr.split("-").map(Number);
  if (
    parts.length < 3 ||
    isNaN(parts[0]) ||
    isNaN(parts[1]) ||
    isNaN(parts[2])
  ) {
    return gDateStr;
  }
  const { jy, jm, jd } = gregorianToJalali(parts[0], parts[1], parts[2]);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

/**
 * Convert Jalali string "1403/12/01" to Gregorian YYYY-MM-DD
 */
export function toGregorianDateString(jDateStr: string): string {
  if (!jDateStr) return "";
  const parts = jDateStr.split("/").map(Number);
  if (
    parts.length < 3 ||
    isNaN(parts[0]) ||
    isNaN(parts[1]) ||
    isNaN(parts[2])
  ) {
    return jDateStr;
  }
  const { gy, gm, gd } = jalaliToGregorian(parts[0], parts[1], parts[2]);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

/**
 * Format date to full readable Persian text: "دوشنبه ۲۸ اسفند ۱۴۰۳"
 */
export function formatFullJalali(gDateStr: string): string {
  if (!gDateStr) return "";
  const parts = gDateStr.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return gDateStr;
  }
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  const jsDay = dateObj.getDay();
  const persianWeekdayIndex = (jsDay + 1) % 7;
  const weekdayName = WEEKDAYS_FA[persianWeekdayIndex];

  const { jy, jm, jd } = gregorianToJalali(parts[0], parts[1], parts[2]);
  const monthName = MONTHS_FA[jm - 1];

  return `${weekdayName} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

/**
 * Get weekday name for a Gregorian YYYY-MM-DD date string
 */
export function getWeekdayName(gDateStr: string): string {
  if (!gDateStr) return "";
  const parts = gDateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const jsDay = d.getDay();
    const persianWeekdayIndex = (jsDay + 1) % 7;
    return WEEKDAYS_FA[persianWeekdayIndex];
  }
  const d = new Date(gDateStr);
  if (isNaN(d.getTime())) return "";
  const jsDay = d.getDay();
  const persianWeekdayIndex = (jsDay + 1) % 7;
  return WEEKDAYS_FA[persianWeekdayIndex];
}

/**
 * Get current date as YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Add or subtract days from YYYY-MM-DD string
 */
export function addDays(gDateStr: string, days: number): string {
  const d = new Date(gDateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get current Jalali month start and end (or today) in Gregorian YYYY-MM-DD
 */
export function getCurrentJalaliMonthRange(
  referenceGDate: string = getTodayString(),
): {
  startGDate: string;
  endGDate: string;
  todayGDate: string;
  monthName: string;
  year: number;
} {
  const parts = referenceGDate.split("-").map(Number);
  const { jy, jm, jd } = gregorianToJalali(parts[0], parts[1], parts[2]);
  const monthName = MONTHS_FA[jm - 1];

  // Jalali month start (Day 1)
  const { gy: sGy, gm: sGm, gd: sGd } = jalaliToGregorian(jy, jm, 1);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const startGDate = `${sGy}-${pad(sGm)}-${pad(sGd)}`;

  // Jalali month end: month 1-6 have 31 days, 7-11 have 30 days, 12 has 29 (or 30 in leap year)
  let daysInMonth = 30;
  if (jm <= 6) daysInMonth = 31;
  else if (jm === 12) {
    // Check leap year for Jalali
    const leapCheck = ((jy + 38) * 31) % 128 < 31;
    daysInMonth = leapCheck ? 30 : 29;
  }

  const { gy: eGy, gm: eGm, gd: eGd } = jalaliToGregorian(jy, jm, daysInMonth);
  const endGDate = `${eGy}-${pad(eGm)}-${pad(eGd)}`;

  return {
    startGDate,
    endGDate,
    todayGDate: referenceGDate,
    monthName,
    year: jy,
  };
}

/**
 * Given a Gregorian date string, get its Persian weekday name
 */
export function getPersianWeekdayFromDate(gDateStr: string): string {
  if (!gDateStr) return "";
  const parts = gDateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const jsDay = d.getDay();
    const persianWeekdayIndex = (jsDay + 1) % 7;
    return WEEKDAYS_FA[persianWeekdayIndex];
  }
  const d = new Date(gDateStr);
  if (isNaN(d.getTime())) return "";
  const jsDay = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const persianWeekdayIndex = (jsDay + 1) % 7;
  return WEEKDAYS_FA[persianWeekdayIndex];
}

/**
 * Get all dates between startDate and endDate matching a set of Persian weekdays
 */
export function getDatesForWeekdaysInRange(
  startGDate: string,
  endGDate: string,
  targetWeekdays: string[],
): string[] {
  const dates: string[] = [];
  let curr = startGDate;
  while (curr <= endGDate) {
    const wDay = getPersianWeekdayFromDate(curr);
    if (targetWeekdays.includes(wDay)) {
      dates.push(curr);
    }
    curr = addDays(curr, 1);
  }
  return dates;
}

/**
 * Get current Jalali week range (Saturday to Friday) in Gregorian YYYY-MM-DD
 */
export function getCurrentJalaliWeekRange(
  referenceGDate: string = getTodayString(),
): {
  startGDate: string;
  endGDate: string;
} {
  const d = new Date(referenceGDate);
  const jsDay = d.getDay(); // 0 is Sunday, 6 is Saturday
  // Days since Saturday (Persian week start)
  const daysSinceSaturday = (jsDay + 1) % 7;
  const startGDate = addDays(referenceGDate, -daysSinceSaturday);
  const endGDate = addDays(startGDate, 6);
  return { startGDate, endGDate };
}

/**
 * Calculate remaining sessions in semester based on registration date, semester end date, and weekdays
 */
export function calculateRemainingSessionsInSemester(
  regGDate: string,
  semEndGDate: string,
  weekdays: string[],
): number {
  if (!regGDate || !semEndGDate || !weekdays || weekdays.length === 0)
    return 10;
  if (regGDate > semEndGDate) return 1;
  const dates = getDatesForWeekdaysInRange(regGDate, semEndGDate, weekdays);
  return Math.max(1, dates.length);
}

export type PersianSeason = "spring" | "summer" | "autumn" | "winter";

export interface SeasonInfo {
  id: PersianSeason;
  nameFa: string;
  englishName: string;
  paletteDescription: string;
  themeAttribute: string;
  accentColorName: string;
}

/**
 * Get current Persian season based on Jalali month
 */
export function getCurrentPersianSeason(
  referenceGDate: string = getTodayString(),
): SeasonInfo {
  const parts = referenceGDate.split("-").map(Number);
  const { jm } = gregorianToJalali(parts[0], parts[1], parts[2]);

  if (jm >= 1 && jm <= 3) {
    return {
      id: "spring",
      nameFa: "بهار",
      englishName: "Spring",
      paletteDescription: "پوسته بهاره (سبز باطراوت، مریم‌گلی و خنک)",
      themeAttribute: "seasonal-spring",
      accentColorName: "سبز بهاره",
    };
  } else if (jm >= 4 && jm <= 6) {
    return {
      id: "summer",
      nameFa: "تابستان",
      englishName: "Summer",
      paletteDescription: "پوسته تابستانه (کهربایی، آفتابی و شن‌های گرم)",
      themeAttribute: "seasonal-summer",
      accentColorName: "کهربایی گرم",
    };
  } else if (jm >= 7 && jm <= 9) {
    return {
      id: "autumn",
      nameFa: "پاییز",
      englishName: "Autumn",
      paletteDescription: "پوسته پاییزه (مسی، اخرایی، برنز و بلوطی)",
      themeAttribute: "seasonal-autumn",
      accentColorName: "مسی و نارنجی پاییزی",
    };
  } else {
    return {
      id: "winter",
      nameFa: "زمستان",
      englishName: "Winter",
      paletteDescription: "پوسته زمستانه (سرمه‌ای یخی، کریستالی و نیلی)",
      themeAttribute: "seasonal-winter",
      accentColorName: "سرمه‌ای یخی",
    };
  }
}
