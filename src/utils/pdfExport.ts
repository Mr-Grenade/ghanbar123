import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AcademyDatabase, AttendanceRecord, Note } from "../types";
import {
  formatFullJalali,
  toJalaliDateString,
  toPersianDigits,
  formatToman,
} from "./persianDate";

const STATUS_LABELS: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  present: { label: "حاضر (تشکیل شده)", bg: "#dcfce7", text: "#15803d" },
  no_show: { label: "غیبت غیرموجه", bg: "#fee2e2", text: "#b91c1c" },
  excused: { label: "غیبت موجه (+۱ جبرانی)", bg: "#fef3c7", text: "#b45309" },
  teacher_cancelled: {
    label: "کنسلی توسط استاد (+۱ جبرانی)",
    bg: "#ede9fe",
    text: "#6d28d9",
  },
  unrecorded: {
    label: "ثبت‌نشده",
    bg: "#f1f5f9",
    text: "#64748b",
  },
};

/**
 * Trigger high-quality clean print/PDF view in browser
 */
export function printDailyReport(
  dateStr: string,
  records: AttendanceRecord[],
  notes: Note[],
  db: AcademyDatabase,
): void {
  const teacherMap = new Map(db.teachers.map((t) => [t.id, t.name]));
  const teacherObjMap = new Map(db.teachers.map((t) => [t.id, t]));
  const studentMap = new Map(db.students.map((s) => [s.id, s.name]));
  const studentObjMap = new Map(db.students.map((s) => [s.id, s]));

  const presentCount = records.filter((r) => r.status === "present").length;
  const excusedCount = records.filter((r) => r.status === "excused").length;
  const cancelledCount = records.filter(
    (r) => r.status === "teacher_cancelled",
  ).length;
  const noShowCount = records.filter((r) => r.status === "no_show").length;

  // Calculate teacher breakdown for today's sessions
  const teacherWageSummary: {
    teacherName: string;
    presentSessions: number;
    hourlyRate: number;
    totalPayable: number;
  }[] = [];

  const teacherIdsWithClasses = Array.from(
    new Set(records.map((r) => r.teacherId)),
  );

  let totalTeacherPayableToday = 0;
  let totalIncomeToday = 0;

  teacherIdsWithClasses.forEach((tId) => {
    const teacher = teacherObjMap.get(tId);
    const teacherRecords = records.filter((r) => r.teacherId === tId);
    const presentSessions = teacherRecords.filter(
      (r) => r.status === "present",
    ).length;
    const hourlyRate = teacher?.hourlyRate || 0;
    const teacherPercentage = teacher?.percentageRate || 100;
    const wagePerSession = Math.round((hourlyRate * teacherPercentage) / 100);
    const totalPayable = presentSessions * wagePerSession;

    totalTeacherPayableToday += totalPayable;

    if (teacher || presentSessions > 0) {
      teacherWageSummary.push({
        teacherName: teacher?.name || teacherMap.get(tId) || tId,
        presentSessions,
        hourlyRate: wagePerSession,
        totalPayable,
      });
    }
  });

  // Calculate total income from held sessions today
  records.forEach((rec) => {
    if (rec.status === "present") {
      const student = studentObjMap.get(rec.studentId);
      const sessionTuition =
        student?.sessionFeeOverride ||
        (student && student.targetSessions > 0
          ? Math.round(student.tuitionFee / student.targetSessions)
          : db.settings.defaultPricePerSession || 350000);
      totalIncomeToday += sessionTuition;
    }
  });

  const netDailyProfit = totalIncomeToday - totalTeacherPayableToday;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>گزارش مالی و حضور روزانه - ${toJalaliDateString(dateStr)}</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
        body { margin: 0; padding: 24px; color: #1e293b; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
        .academy-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .report-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .meta-box { text-align: left; font-size: 12px; color: #475569; line-height: 1.6; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc; }
        .stat-val { font-size: 18px; font-weight: 800; color: #0f172a; }
        .stat-lbl { font-size: 11px; color: #64748b; margin-top: 3px; }

        .finance-summary-card {
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          padding: 14px 18px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .finance-item { text-align: center; }
        .finance-title { font-size: 11px; color: #475569; font-weight: 600; }
        .finance-amount { font-size: 16px; font-weight: 800; margin-top: 4px; }

        .section-heading { font-size: 14px; font-weight: 700; color: #1e293b; margin: 20px 0 10px 0; border-right: 3px solid #2563eb; padding-right: 8px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #f1f5f9; color: #334155; padding: 9px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; }
        td { padding: 7px 9px; border: 1px solid #e2e8f0; text-align: right; }
        tr:nth-child(even) { background: #fafafa; }
        .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }

        .notes-section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; background: #fcfcfc; }
        .notes-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
        .note-item { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12px; }
        .note-item:last-child { border-bottom: none; }

        .footer { margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .signature-box { width: 180px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px; margin-top: 24px; }
        
        @media print {
          body { padding: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="academy-title">${db.settings.academyName}</h1>
          <div class="report-subtitle">گزارش جامع حضور و غیاب، کارکرد اساتید و درآمد روزانه</div>
          ${db.settings.address ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;"><strong>نشانی آموزشگاه:</strong> ${db.settings.address}</div>` : ""}
        </div>
        <div class="meta-box">
          <div><strong>تاریخ روز:</strong> ${formatFullJalali(dateStr)}</div>
          <div><strong>تاریخ عددی:</strong> ${toPersianDigits(toJalaliDateString(dateStr))}</div>
          <div><strong>تلفن آموزشگاه:</strong> ${toPersianDigits(db.settings.phone)}</div>
          ${db.settings.address ? `<div><strong>آدرس:</strong> ${db.settings.address}</div>` : ""}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val" style="color: #16a34a;">${toPersianDigits(presentCount)}</div>
          <div class="stat-lbl">کلاس‌های تشکیل شده (حاضر)</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #d97706;">${toPersianDigits(excusedCount)}</div>
          <div class="stat-lbl">غیبت‌های موجه (+جبرانی)</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #7c3aed;">${toPersianDigits(cancelledCount)}</div>
          <div class="stat-lbl">کنسلی‌های استاد (+جبرانی)</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #dc2626;">${toPersianDigits(noShowCount)}</div>
          <div class="stat-lbl">غیبت‌های غیرموجه</div>
        </div>
      </div>

      <!-- Financial Summary Box: Sum of All Income & Teacher Payments -->
      <div class="finance-summary-card">
        <div class="finance-item">
          <div class="finance-title">مجموع درآمد کل جلسات امروز (Sum of Income)</div>
          <div class="finance-amount" style="color: #15803d;">
            ${formatToman(totalIncomeToday)}
          </div>
        </div>
        <div class="finance-item">
          <div class="finance-title">مجموع کل دستمزد اساتید امروز</div>
          <div class="finance-amount" style="color: #2563eb;">
            ${formatToman(totalTeacherPayableToday)}
          </div>
        </div>
        <div class="finance-item">
          <div class="finance-title">مانده خالص درآمد آموزشگاه در این روز</div>
          <div class="finance-amount" style="color: #0f172a;">
            ${formatToman(netDailyProfit)}
          </div>
        </div>
      </div>

      <!-- Roster of classes today -->
      <div class="section-heading">لیست کلاس‌های روزانه و وضعیت حضور هنرجویان</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">ردیف</th>
            <th style="width: 65px; text-align: center;">ساعت</th>
            <th>نام هنرجو</th>
            <th>ساز / رشته</th>
            <th>استاد مدرس</th>
            <th>وضعیت کلاس</th>
            <th>بهای جلسه (شهریه)</th>
            <th>حق‌التدریس (سهم استاد)</th>
            <th>سهم آموزشگاه</th>
          </tr>
        </thead>
        <tbody>
          ${
            records.length === 0
              ? `<tr><td colspan="10" style="text-align: center; padding: 18px; color: #94a3b8;">رویداد کلاسی برای این روز ثبت نشده است.</td></tr>`
              : records
                  .map((rec, index) => {
                    const stInfo = (rec.status ? STATUS_LABELS[rec.status] : null) || STATUS_LABELS.unrecorded;
                    const student = studentObjMap.get(rec.studentId);
                    const teacher = teacherObjMap.get(rec.teacherId);
                    const sessionTuition =
                      student?.sessionFeeOverride ||
                      (student && student.targetSessions > 0
                        ? Math.round(
                            student.tuitionFee / student.targetSessions,
                          )
                        : db.settings.defaultPricePerSession || 350000);
                    const hourlyRate = teacher?.hourlyRate || 0;
                    const teacherPercentage = teacher?.percentageRate || 100;
                    const sessionWage = Math.round(
                      (hourlyRate * teacherPercentage) / 100,
                    );

                    return `
                    <tr>
                      <td style="text-align: center;">${toPersianDigits(index + 1)}</td>
                      <td style="text-align: center; font-weight: 700;">${toPersianDigits(rec.time)}</td>
                      <td style="font-weight: 700;">${studentMap.get(rec.studentId) || rec.studentId}</td>
                      <td>${rec.instrument}</td>
                      <td>${teacherMap.get(rec.teacherId) || rec.teacherId}</td>
                      <td>
                        <span class="badge" style="background: ${stInfo.bg}; color: ${stInfo.text};">
                          ${stInfo.label}
                        </span>
                      </td>
                      <td style="font-weight: 600; color: #166534;">
                        ${rec.status === "present" ? formatToman(sessionTuition) : "-"}
                      </td>
                      <td style="font-weight: 600; color: #1e40af;">
                        ${rec.status === "present" ? formatToman(sessionWage) : "-"}
                      </td>
                      <td style="font-weight: 600; color: #b45309;">
                        ${rec.status === "present" ? formatToman(sessionTuition - sessionWage) : "-"}
                      </td>
                    </tr>
                  `;
                  })
                  .join("")
          }
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: 700;">
            <td colspan="6" style="text-align: left; padding: 10px;">مجموع کل درآمد و پرداختی جلسات امروز:</td>
            <td style="color: #15803d; font-size: 13px;">${formatToman(totalIncomeToday)}</td>
            <td style="color: #1d4ed8; font-size: 13px;">${formatToman(totalTeacherPayableToday)}</td>
            <td style="font-size: 11px; color: #475569;">سود خالص: ${formatToman(netDailyProfit)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Teacher Payroll Breakdown for Today -->
      <div class="section-heading">تفکیک کارکرد و دستمزد پرداختی به اساتید در این روز</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">ردیف</th>
            <th>نام استاد</th>
            <th style="text-align: center;">تعداد کلاس‌های تشکیل‌شده (حاضر)</th>
            <th>نرخ مصوب هر جلسه</th>
            <th>مجموع دستمزد پرداختی به استاد</th>
          </tr>
        </thead>
        <tbody>
          ${
            teacherWageSummary.length === 0
              ? `<tr><td colspan="5" style="text-align: center; padding: 14px; color: #94a3b8;">استادی در این روز کلاسی برگزار نکرده است.</td></tr>`
              : teacherWageSummary
                  .map(
                    (tw, idx) => `
                <tr>
                  <td style="text-align: center;">${toPersianDigits(idx + 1)}</td>
                  <td style="font-weight: 700;">${tw.teacherName}</td>
                  <td style="text-align: center; font-weight: 700;">${toPersianDigits(tw.presentSessions)} جلسه</td>
                  <td>${formatToman(tw.hourlyRate)}</td>
                  <td style="font-weight: 800; color: #1d4ed8;">${formatToman(tw.totalPayable)}</td>
                </tr>
              `,
                  )
                  .join("")
          }
        </tbody>
        <tfoot>
          <tr style="background: #f8fafc; font-weight: 800;">
            <td colspan="4" style="text-align: left; padding: 10px;">جمع کل کارکرد و دستمزد قابل پرداخت به اساتید:</td>
            <td style="color: #1d4ed8; font-size: 14px;">${formatToman(totalTeacherPayableToday)}</td>
          </tr>
        </tfoot>
      </table>

      ${
        notes.length > 0
          ? `
        <div class="notes-section">
          <div class="notes-title">یادداشت‌ها و وقایع ثبت شده در این روز:</div>
          ${notes
            .map(
              (n) => `
            <div class="note-item">
              ${n.title && n.title.trim() ? `<strong>${n.title}</strong>: ` : ""}${n.content}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <div class="footer">
        <div>
          <div>سیستم مدیریت آموزشگاه موسیقی ${db.settings.academyName} | زمان چاپ: ${toPersianDigits(new Date().toLocaleTimeString("fa-IR"))}</div>
          ${db.settings.address ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">نشانی: ${db.settings.address}</div>` : ""}
        </div>
        <div class="signature-box">
          ${db.settings.signatureUrl ? `<img src="${db.settings.signatureUrl}" alt="امضا" style="max-height: 55px; max-width: 130px; display: block; margin: 0 auto 6px auto; object-fit: contain;" />` : ""}
          <div>مهر و امضای مدیریت (${db.settings.managerName || "مدیریت آموزشگاه"})</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generate PDF file directly from an HTML element using html2canvas and jsPDF
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}
