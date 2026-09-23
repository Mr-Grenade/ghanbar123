import {
  AcademyDatabase,
  Teacher,
  FinancialTransaction,
  AttendanceRecord,
} from "../types";
import {
  toPersianDigits,
  formatToman,
  toJalaliDateString,
} from "./persianDate";

export interface TeacherFinancialSummary {
  teacher: Teacher;
  totalPresentSessions: number;
  totalExcusedSessions: number;
  totalCancelledSessions: number;
  totalNoShowSessions: number;
  sessionPrice: number;
  percentage: number;
  sessionWage: number;
  totalEarned: number; // Total gross accrued earnings all-time (Toman)
  totalPaid: number; // Total payouts/settlements made to teacher all-time (Toman)
  netDebt: number; // positive = academy owes teacher, 0 = settled, negative = overpaid/advance
  payoutTransactions: FinancialTransaction[];
  presentRecords: AttendanceRecord[];
  lastPayout: FinancialTransaction | null;
}

/**
 * Calculates all-time financial profile for a teacher:
 * - Accrued earnings based on present attendance records
 * - Total payouts based on transactions of type 'teacher_payout'
 * - Net debt (balance) owed to the teacher
 */
export function calculateTeacherFinanceSummary(
  teacher: Teacher,
  db: AcademyDatabase,
): TeacherFinancialSummary {
  // All attendance records for this teacher
  const teacherRecords = db.attendance.filter((a) => a.teacherId === teacher.id);
  const presentRecords = teacherRecords.filter((a) => a.status === "present");
  const excusedCount = teacherRecords.filter((a) => a.status === "excused").length;
  const cancelledCount = teacherRecords.filter(
    (a) => a.status === "teacher_cancelled",
  ).length;
  const noShowCount = teacherRecords.filter((a) => a.status === "no_show").length;

  const sessionPrice = teacher.hourlyRate || 0;
  const percentage =
    teacher.percentageRate !== undefined ? teacher.percentageRate : 100;
  const sessionWage = Math.round((sessionPrice * percentage) / 100);

  // Total gross earned
  const totalEarned = presentRecords.length * sessionWage;

  // All payout transactions
  const payoutTransactions = (db.transactions || [])
    .filter((tx) => tx.type === "teacher_payout" && tx.teacherId === teacher.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPaid = payoutTransactions.reduce(
    (acc, tx) => acc + (tx.amount || 0),
    0,
  );
  const netDebt = totalEarned - totalPaid;
  const lastPayout = payoutTransactions.length > 0 ? payoutTransactions[0] : null;

  return {
    teacher,
    totalPresentSessions: presentRecords.length,
    totalExcusedSessions: excusedCount,
    totalCancelledSessions: cancelledCount,
    totalNoShowSessions: noShowCount,
    sessionPrice,
    percentage,
    sessionWage,
    totalEarned,
    totalPaid,
    netDebt,
    payoutTransactions,
    presentRecords,
    lastPayout,
  };
}

/**
 * Prints an official single payout / settlement receipt
 */
export function printTeacherPayoutReceipt(
  teacher: Teacher,
  tx: FinancialTransaction,
  db: AcademyDatabase,
  balanceAfter?: number,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const paymentMethodLabels: Record<string, string> = {
    card_transfer: "کارت به کارت / حواله بانکی",
    cash: "پرداخت نقدی",
    pos: "کارتخوان آموزشگاه",
    cheque: "چک بانکی",
  };

  const html = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>رسید پرداخت و تسویه حق‌التدریس - ${teacher.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
        body { padding: 30px; color: #0f172a; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; }
        .info-row { display: flex; justify-content: space-between; }
        .amount-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; }
        .amount-val { font-size: 20px; font-weight: bold; color: #15803d; margin-top: 5px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
        .details-table th, .details-table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: right; }
        .details-table th { background: #f1f5f9; font-weight: bold; }
        .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 30px; font-size: 13px; }
        .sig-box { text-align: center; width: 200px; border-top: 1px dashed #94a3b8; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${db.settings.academyName || "آموزشگاه موسیقی"}</h1>
        <div class="subtitle">رسید پرداخت حق‌التدریس و تسویه حساب مالی</div>
      </div>

      <div class="info-grid">
        <div class="info-row"><span><strong>نام استاد:</strong></span> <span>${teacher.name}</span></div>
        <div class="info-row"><span><strong>تاریخ پرداخت:</strong></span> <span>${toJalaliDateString(tx.date)}</span></div>
        <div class="info-row"><span><strong>سازهای تخصصی:</strong></span> <span>${(teacher.instruments || []).join("، ") || "-"}</span></div>
        <div class="info-row"><span><strong>شماره پیگیری / سند:</strong></span> <span>${tx.receiptNumber ? toPersianDigits(tx.receiptNumber) : "ثبت سیستمی"}</span></div>
        <div class="info-row"><span><strong>شماره تماس:</strong></span> <span>${toPersianDigits(teacher.phone)}</span></div>
        <div class="info-row"><span><strong>روش پرداخت:</strong></span> <span>${paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}</span></div>
      </div>

      <div class="amount-box">
        <div style="font-size: 12px; color: #166534;">مبلغ پرداختی / واریز شده:</div>
        <div class="amount-val">${formatToman(tx.amount)}</div>
      </div>

      <table class="details-table">
        <tbody>
          <tr>
            <th style="width: 25%;">بابت / شرح پرداخت:</th>
            <td>${tx.description || "تسویه حساب حق‌التدریس"}</td>
          </tr>
          ${
            balanceAfter !== undefined
              ? `
          <tr>
            <th>مانده بدهی پس از این پرداخت:</th>
            <td style="font-weight: bold; color: ${balanceAfter > 0 ? "#b91c1c" : "#15803d"};">
              ${balanceAfter === 0 ? "۰ تومان (تسویه کامل حساب)" : formatToman(balanceAfter)}
            </td>
          </tr>`
              : ""
          }
        </tbody>
      </table>

      <div class="signatures">
        <div class="sig-box">
          <div>امضای استاد مدرس</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">تایید دریافت وجه</div>
        </div>
        <div class="sig-box">
          <div>مهر و امضای مدیریت آموزشگاه</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${db.settings.managerName || "امور مالی آموزشگاه"}</div>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Prints full financial account statement of a teacher
 */
export function printTeacherFullStatement(
  summary: TeacherFinancialSummary,
  db: AcademyDatabase,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const { teacher, totalPresentSessions, sessionPrice, percentage, sessionWage, totalEarned, totalPaid, netDebt, payoutTransactions } = summary;

  const html = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>صورت‌حساب مالی جامع - ${teacher.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
        body { padding: 30px; color: #0f172a; }
        .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 18px; font-weight: bold; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; border: 1px solid #e2e8f0; text-align: center; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi-card { padding: 14px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1; background: #f8fafc; }
        .kpi-val { font-size: 16px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right; }
        th { background: #f1f5f9; font-weight: bold; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; padding: 0 40px; }
        .sig-box { text-align: center; width: 200px; border-top: 1px dashed #94a3b8; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${db.settings.academyName || "آموزشگاه موسیقی"}</h1>
        <div class="subtitle">صورت‌حساب و کارنامه مالی استاد: ${teacher.name}</div>
      </div>

      <div class="info-grid">
        <div><strong>بهای پایه جلسه:</strong><br>${formatToman(sessionPrice)}</div>
        <div><strong>سهم استاد:</strong><br>${toPersianDigits(percentage)}٪</div>
        <div><strong>دستمزد هر جلسه:</strong><br>${formatToman(sessionWage)}</div>
        <div><strong>تعداد جلسات تشکیل شده:</strong><br>${toPersianDigits(totalPresentSessions)} جلسه</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div style="font-size: 11px; color: #166534;">کل کارکرد ناخالص (بستانکاری)</div>
          <div class="kpi-val" style="color: #15803d;">${formatToman(totalEarned)}</div>
        </div>
        <div class="kpi-card" style="background: #eff6ff; border-color: #bfdbfe;">
          <div style="font-size: 11px; color: #1e40af;">مجموع پرداختی‌ها و تسویه‌ها</div>
          <div class="kpi-val" style="color: #1d4ed8;">${formatToman(totalPaid)}</div>
        </div>
        <div class="kpi-card" style="background: ${netDebt > 0 ? "#fef2f2" : "#f0fdf4"}; border-color: ${netDebt > 0 ? "#fecaca" : "#bbf7d0"};">
          <div style="font-size: 11px; color: ${netDebt > 0 ? "#991b1b" : "#166534"};">مانده بدهی آموزشگاه به استاد</div>
          <div class="kpi-val" style="color: ${netDebt > 0 ? "#dc2626" : "#15803d"};">
            ${netDebt === 0 ? "۰ تومان (تسویه شده)" : formatToman(netDebt)}
          </div>
        </div>
      </div>

      <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">تاریخچه اسناد و واریزهای تسویه حساب:</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">ردیف</th>
            <th>تاریخ پرداخت</th>
            <th>مبلغ واریزی</th>
            <th>روش پرداخت</th>
            <th>شماره پیگیری / سند</th>
            <th>شرح و بابت</th>
          </tr>
        </thead>
        <tbody>
          ${
            payoutTransactions.length === 0
              ? '<tr><td colspan="6" style="text-align: center; padding: 15px; color: #64748b;">تاکنون پرداختی برای این استاد ثبت نشده است.</td></tr>'
              : payoutTransactions
                  .map(
                    (tx, i) => `
            <tr>
              <td style="text-align: center;">${toPersianDigits(i + 1)}</td>
              <td>${toJalaliDateString(tx.date)}</td>
              <td style="font-weight: bold; color: #15803d;">${formatToman(tx.amount)}</td>
              <td>${tx.paymentMethod === "card_transfer" ? "کارت به کارت" : tx.paymentMethod === "cash" ? "نقدی" : tx.paymentMethod === "cheque" ? "چک" : "کارتخوان"}</td>
              <td>${tx.receiptNumber ? toPersianDigits(tx.receiptNumber) : "-"}</td>
              <td>${tx.description || "تسویه حساب"}</td>
            </tr>
          `,
                  )
                  .join("")
          }
        </tbody>
      </table>

      <div class="signatures">
        <div class="sig-box">
          <div>امضای استاد مدرس</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">تایید صورت‌حساب مالی</div>
        </div>
        <div class="sig-box">
          <div>مهر و امضای مدیریت آموزشگاه</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${db.settings.managerName || "امور مالی"}</div>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
