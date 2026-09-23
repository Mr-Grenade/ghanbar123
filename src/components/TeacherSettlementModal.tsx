import React, { useState, useEffect } from "react";
import { useAcademy } from "../context/AcademyContext";
import { Teacher } from "../types";
import {
  toPersianDigits,
  toEnglishDigits,
  formatToman,
  getTodayString,
  toJalaliDateString,
} from "../utils/persianDate";
import { ShamsiDatePicker } from "./ShamsiDatePicker";
import { CustomSelect } from "./ui/custom-select";
import {
  Wallet,
  CheckCircle,
  Receipt,
  X,
  Sparkles,
} from "lucide-react";

interface TeacherSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  initialAmount?: number;
  currentNetDebt?: number;
  onSettlementSuccess?: () => void;
}

export const TeacherSettlementModal: React.FC<TeacherSettlementModalProps> = ({
  isOpen,
  onClose,
  teacher,
  initialAmount,
  currentNetDebt = 0,
  onSettlementSuccess,
}) => {
  const { addTransaction, showToast } = useAcademy();

  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<
    "card_transfer" | "cash" | "pos" | "cheque"
  >("card_transfer");
  const [receiptNumber, setReceiptNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (isOpen && teacher) {
      const defaultAmt =
        initialAmount !== undefined
          ? initialAmount
          : currentNetDebt > 0
            ? currentNetDebt
            : 0;
      setAmount(defaultAmt);
      setPaymentDate(getTodayString());
      setPaymentMethod("card_transfer");
      setReceiptNumber("");
      setDescription(
        defaultAmt === currentNetDebt && currentNetDebt > 0
          ? `تسویه حساب کامل بستانکاری تا تاریخ ${toJalaliDateString(getTodayString())}`
          : `پرداخت حق‌التدریس به استاد ${teacher.name}`,
      );
    }
  }, [isOpen, teacher, initialAmount, currentNetDebt]);

  if (!isOpen || !teacher) return null;

  const isFullSettlement = currentNetDebt > 0 && amount === currentNetDebt;

  const handleApplyFullSettlement = () => {
    if (currentNetDebt > 0) {
      setAmount(currentNetDebt);
      setDescription(
        `تسویه کامل بدهی و تسویه حساب حق‌التدریس تا تاریخ ${toJalaliDateString(paymentDate || getTodayString())}`,
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast("لطفاً مبلغ معتبری برای پرداخت وارد نمایید.", "warning");
      return;
    }

    addTransaction({
      date: paymentDate || getTodayString(),
      type: "teacher_payout",
      amount,
      teacherId: teacher.id,
      paymentMethod,
      receiptNumber: receiptNumber.trim() || undefined,
      description:
        description.trim() ||
        `پرداخت حق‌التدریس استاد ${teacher.name} (${toJalaliDateString(paymentDate)})`,
    });

    const isZeroed = amount === currentNetDebt;
    showToast(
      isZeroed
        ? `تسویه حساب انجام شد و مانده بدهی استاد ${teacher.name} صفر گردید.`
        : `پرداخت مبلغ ${formatToman(amount)} به استاد ${teacher.name} با موفقیت ثبت شد.`,
      "success",
    );

    if (onSettlementSuccess) {
      onSettlementSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[var(--bg-secondary)] rounded-2xl p-5 sm:p-6 shadow-2xl border border-[var(--border-color)] space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-success-soft text-success-strong flex items-center justify-center border border-success-border">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                ثبت پرداخت حق‌التدریس
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                استاد: {teacher.name} | سازها: {(teacher.instruments || []).join("، ") || "عمومی"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="بستن پنجره"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Teacher Debt Overview & Full Settlement Action Card */}
        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">
                وضعیت فعلی حساب استاد:
              </span>
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {currentNetDebt > 0 ? (
                  <span className="text-danger-strong">
                    {formatToman(currentNetDebt)} (مانده بدهی آموزشگاه)
                  </span>
                ) : currentNetDebt === 0 ? (
                  <span className="text-success-strong">
                    تسویه کامل ✓ (بدون بدهی جاری)
                  </span>
                ) : (
                  <span className="text-accent-strong">
                    {formatToman(Math.abs(currentNetDebt))} (مساعده مازاد پرداخت‌شده)
                  </span>
                )}
              </span>
            </div>

            {currentNetDebt > 0 && (
              <button
                type="button"
                onClick={handleApplyFullSettlement}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                  isFullSettlement
                    ? "bg-success text-on-solid ring-2 ring-success/40"
                    : "bg-success hover:bg-success/90 text-on-solid hover:shadow-sm"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>تسویه کامل بدهی (صفر کردن حساب)</span>
              </button>
            )}
          </div>

          {currentNetDebt <= 0 && (
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 pt-2.5 mt-2.5 border-t border-[var(--border-color)]">
              <Sparkles className="w-3.5 h-3.5 text-accent-strong shrink-0" />
              <span>
                در حال حاضر آموزشگاه به این استاد بدهی ندارد. در صورت نیاز می‌توانید مبلغی را به عنوان «مساعده» یا «پیش‌پرداخت» ثبت نمایید.
              </span>
            </div>
          )}
        </div>

        {/* Settlement Form */}
        <form
          id="teacherSettlementForm"
          onSubmit={handleSubmit}
          className="space-y-4 text-xs"
        >
          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--text-primary)]">
                مبلغ پرداختی (تومان):
              </label>
              {amount > 0 && (
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {formatToman(amount)}
                </span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={
                amount === 0
                  ? "0"
                  : new Intl.NumberFormat("fa-IR").format(amount)
              }
              onChange={(e) => {
                const engDigits = toEnglishDigits(e.target.value);
                const val = engDigits.replace(/\D/g, "");
                setAmount(val ? parseInt(val, 10) : 0);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-success/50 transition-all"
              required
            />
            {/* Real-time Debt Remainder feedback */}
            {amount > 0 && currentNetDebt > 0 && (
              <div className="text-[11px] pt-0.5">
                {amount === currentNetDebt ? (
                  <span className="text-success-strong font-semibold">
                    ✓ مانده بدهی پس از این پرداخت: ۰ تومان (تسویه کامل)
                  </span>
                ) : amount < currentNetDebt ? (
                  <span className="text-[var(--text-secondary)]">
                    مانده بدهی آموزشگاه پس از این پرداخت:{" "}
                    <strong className="text-danger-strong font-mono">
                      {formatToman(currentNetDebt - amount)}
                    </strong>
                  </span>
                ) : (
                  <span className="text-accent-strong">
                    مبلغ مازاد پرداختی (مساعده):{" "}
                    <strong className="font-mono font-bold">
                      +{formatToman(amount - currentNetDebt)}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Method Selector */}
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                روش پرداخت:
              </label>
              <CustomSelect
                value={paymentMethod}
                onChange={(e: any) =>
                  setPaymentMethod(
                    e.target.value as "card_transfer" | "cash" | "pos" | "cheque",
                  )
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold"
              >
                <option value="card_transfer">کارت به کارت / انتقال شبا</option>
                <option value="cash">نقدی</option>
                <option value="pos">کارتخوان (POS)</option>
                <option value="cheque">چک بانکی</option>
              </CustomSelect>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                تاریخ پرداخت (شمسی):
              </label>
              <ShamsiDatePicker
                value={paymentDate}
                onChange={(d) => setPaymentDate(d)}
                placeholder="انتخاب تاریخ پرداخت"
              />
            </div>
          </div>

          {/* Tracking / Receipt Number */}
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
              شماره پیگیری / شماره ارجاع / فیش واریزی:
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="مثال: TRF-98234 یا شماره چک / ارجاع بانکی"
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-left focus:outline-hidden focus:ring-1 focus:ring-success"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
              بابت / شرح سند پرداخت:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="شرح سند، بابت حق‌التدریس ماه‌های معین، مساعده یا تسویه کامل..."
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] resize-none focus:outline-hidden focus:ring-1 focus:ring-success"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs hover:bg-[var(--border-color)] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-success text-on-solid font-bold hover:bg-success/90 text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ثبت پرداخت</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
