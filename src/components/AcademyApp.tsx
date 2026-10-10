import React, { useState, useEffect, useRef, useCallback } from "react";
import { AcademyProvider, useAcademy } from "../context/AcademyContext";
import { DesktopHeader } from "./DesktopHeader";
import { Navigation } from "./Navigation";
import { DashboardOverview } from "./DashboardOverview";
import { AttendanceManager } from "./AttendanceManager";
import { StudentsManager } from "./StudentsManager";
import { TeachersManager } from "./TeachersManager";
import { PayrollManager } from "./PayrollManager";
import { NotesManager } from "./NotesManager";
import { HistoricalRecall } from "./HistoricalRecall";
import { ReportsExportManager } from "./ReportsExportManager";
import { LoadingScreen } from "./LoadingScreen";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const MainAppContent: React.FC = () => {
  const { currentTab, setCurrentTab, toastMessage, db } = useAcademy();

  // Loading screen on initial load: stays on until click or button press
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  // Screensaver state
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const screensaverTimeoutMinutes = db.settings.screensaverTimeoutMinutes ?? 0;

  // Reset screensaver idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    // Only set timer if timeout is configured (> 0) and initial loader has finished
    if (screensaverTimeoutMinutes > 0 && !showInitialLoader) {
      const ms = screensaverTimeoutMinutes * 60 * 1000;
      idleTimerRef.current = setTimeout(() => {
        setIsScreensaverActive(true);
      }, ms);
    }
  }, [screensaverTimeoutMinutes, showInitialLoader]);

  // Track user activity (mouse move, mousedown, keydown, touch, scroll) to reset idle timer
  useEffect(() => {
    if (screensaverTimeoutMinutes <= 0 || showInitialLoader) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    // Start timer
    resetIdleTimer();

    const handleUserActivity = () => {
      // If screensaver is NOT active, reset idle countdown
      if (!isScreensaverActive) {
        resetIdleTimer();
      }
    };

    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("mousedown", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });
    window.addEventListener("scroll", handleUserActivity, { passive: true });

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, [screensaverTimeoutMinutes, showInitialLoader, isScreensaverActive, resetIdleTimer]);

  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={setCurrentTab} />;
      case "attendance":
        return <AttendanceManager />;
      case "students":
        return <StudentsManager />;
      case "teachers":
        return <TeachersManager />;
      case "payroll":
        return <PayrollManager />;
      case "notes":
        return <NotesManager />;
      case "recall":
        return <HistoricalRecall />;
      case "reports":
        return <ReportsExportManager />;
      default:
        return <DashboardOverview onNavigate={setCurrentTab} />;
    }
  };

  const appContent = (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] select-none relative">
      {/* Sidebar Navigation taking full height */}
      <Navigation activeTab={currentTab} setActiveTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <DesktopHeader onOpenBackupModal={() => setCurrentTab("reports")} />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--bg-primary)] transition-all">
          <div className="max-w-7xl mx-auto pb-12">{renderActiveView()}</div>
        </main>
      </div>

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 left-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in backdrop-blur-md ${
            toastMessage.type === "success"
              ? "bg-success-soft/90 border-success-border/50 text-success-strong shadow-success-soft/20"
              : toastMessage.type === "warning"
                ? "bg-warning-soft/90 border-warning-border/50 text-warning-strong shadow-warning-soft/20"
                : toastMessage.type === "error"
                  ? "bg-danger-soft/90 border-danger-border/50 text-danger-strong shadow-danger-soft/20"
                  : "bg-surface-2/90 border-line text-ink-muted"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-success-strong" />
          ) : toastMessage.type === "warning" ? (
            <AlertTriangle className="w-4 h-4 text-warning-strong" />
          ) : toastMessage.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-danger-strong" />
          ) : (
            <Info className="w-4 h-4 text-accent-strong" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Initial Loading Screen: Stays on until click or button press */}
      <AnimatePresence>
        {showInitialLoader && (
          <motion.div
            key="app-initial-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-auto"
          >
            <LoadingScreen
              dismissOnMouseMove={false}
              hintText="CLICK OR PRESS ANY KEY TO ENTER"
              onDismiss={() => {
                setShowInitialLoader(false);
                resetIdleTimer();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screensaver Loading Screen: Activated on idle (5, 10, 15, 30 min), exits on mouse move, click, or button press */}
      <AnimatePresence>
        {!showInitialLoader && isScreensaverActive && (
          <motion.div
            key="app-screensaver"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] pointer-events-auto"
          >
            <LoadingScreen
              dismissOnMouseMove={true}
              hintText="SCREENSAVER ACTIVE • MOVE MOUSE, CLICK, OR PRESS ANY KEY TO RESUME"
              onDismiss={() => {
                setIsScreensaverActive(false);
                resetIdleTimer();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (db.settings.force169Ratio) {
    return (
      <div className="h-screen w-screen bg-neutral-900 flex items-center justify-center overflow-hidden">
        <div className="aspect-video w-full max-h-screen max-w-[calc(100vh*1.7778)] flex flex-col relative overflow-hidden shadow-2xl bg-[var(--bg-primary)]">
          {appContent}
        </div>
      </div>
    );
  }

  return <div className="h-screen w-screen overflow-hidden">{appContent}</div>;
};

export default function App() {
  return (
    <AcademyProvider>
      <MainAppContent />
    </AcademyProvider>
  );
}
