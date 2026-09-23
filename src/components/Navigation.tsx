import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  GraduationCap,
  Calculator,
  StickyNote,
  History,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { useAcademy } from "../context/AcademyContext";
import { toPersianDigits } from "../utils/persianDate";
import { NavTabId } from "../types";

export type { NavTabId };

interface NavigationProps {
  activeTab?: NavTabId;
  setActiveTab?: (tab: NavTabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    db,
    getAttendanceForDate,
    selectedDate,
    currentTab: contextTab,
    setCurrentTab: contextSetTab,
  } = useAcademy();

  const currentActiveTab = activeTab || contextTab;
  const handleTabChange = (tab: NavTabId) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      contextSetTab(tab);
    }
  };

  const todayRecords = getAttendanceForDate(selectedDate);
  const pendingRollCalls = todayRecords.length;
  const overdueStudentsCount = db.students.filter(
    (s) => s.paymentStatus === "overdue",
  ).length;
  const activeStudentsCount = db.students.filter(
    (s) => s.status === "active",
  ).length;
  const activeTeachersCount = db.teachers.filter(
    (t) => t.status === "active",
  ).length;
  const totalNotes = db.notes.length;

  const navItems: Array<{
    id: NavTabId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: "dashboard",
      label: "داشبورد",
      icon: LayoutDashboard,
    },
    {
      id: "attendance",
      label: "حضور و غیاب",
      icon: CalendarCheck,
      badge:
        pendingRollCalls > 0 ? toPersianDigits(pendingRollCalls) : undefined,
    },
    {
      id: "students",
      label: "مدیریت هنرجویان",
      icon: Users,
      badge: toPersianDigits(activeStudentsCount),
    },
    {
      id: "teachers",
      label: "مدیریت اساتید",
      icon: GraduationCap,
      badge: toPersianDigits(activeTeachersCount),
    },
    {
      id: "payroll",
      label: "امور مالی",
      icon: Calculator,
    },
    {
      id: "reports",
      label: "تنظیمات",
      icon: Settings,
    },
  ];

  return (
    <aside
      id="desktop-sidebar-nav"
      className="w-64 bg-[var(--bg-sidebar)] text-[var(--text-sidebar)] border-l border-[var(--border-sidebar)] flex flex-col justify-between py-5 shrink-0 select-none transition-colors duration-200 z-20 relative"
    >
      <div className="flex flex-col mb-4">
        <div className="flex flex-row items-center gap-3 px-4 pb-4 mx-2 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md border border-[var(--border-color)] shrink-0">
            {db.settings.logoUrl ? (
              <img
                src={db.settings.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <AppLogo className="w-8 h-8 text-[#2563eb]" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h1 className="text-sm font-extrabold tracking-tight text-[var(--text-sidebar)] truncate">
              {db.settings.academyName}
            </h1>
            <p className="text-[9px] font-medium mt-1 leading-relaxed opacity-70 text-[var(--text-sidebar)]">
              سیستم مدیریت کلاس‌ها
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActiveTab === item.id;
          return (
            <div key={item.id} className="relative w-full">
              {isActive ? (
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className="relative flex items-center justify-between py-3 mr-2.5 pl-6 pr-4 rounded-r-2xl text-xs font-medium group overflow-visible font-semibold z-20 text-[var(--text-primary)]"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    left: "-2px",
                    width: "calc(100% - 10px)",
                  }}
                >
                  {/* Top Curve - Seamlessly dissolved into main canvas */}
                  <svg
                    className="absolute -top-[20px] left-0 w-[22px] h-[20px] pointer-events-none"
                    viewBox="-2 0 22 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0,0 A20,20 0 0,0 20,20 L-2,20 L-2,0 Z"
                      fill="var(--bg-primary)"
                    />
                  </svg>
                  {/* Bottom Curve - Seamlessly dissolved into main canvas */}
                  <svg
                    className="absolute -bottom-[20px] left-0 w-[22px] h-[20px] pointer-events-none"
                    viewBox="-2 0 22 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20,0 A20,20 0 0,0 0,20 L-2,20 L-2,0 Z"
                      fill="var(--bg-primary)"
                    />
                  </svg>

                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className="w-5 h-5 text-[var(--accent-primary)] drop-shadow-sm" />
                    <span className="text-sm font-bold tracking-tight">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/20 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className="relative w-[calc(100%-24px)] flex items-center justify-between px-4 py-3 mx-3 rounded-xl text-xs font-medium group text-[var(--text-sidebar)] hover:bg-white/10 opacity-80 hover:opacity-100"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--text-sidebar)]/10 text-[var(--text-sidebar)] opacity-90 ring-1 ring-[var(--text-sidebar)]/30 shadow-sm backdrop-blur-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="flex justify-center p-2 mt-4">
        <span className="text-[10px] font-mono opacity-50 text-[var(--text-sidebar)]">
          نسخه ۲.۴.۰
        </span>
      </div>
    </aside>
  );
};
