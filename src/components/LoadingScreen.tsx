import React, { useState, useEffect, useRef, useCallback } from "react";

interface LoadingScreenProps {
  className?: string;
  onDismiss?: () => void;
  /**
   * If true, moving the mouse (after screensaver starts) also dismisses the screen.
   * Useful for screensaver mode where any mouse move, click, or key press exits.
   */
  dismissOnMouseMove?: boolean;
  /**
   * Custom hint text shown at bottom.
   */
  hintText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  className = "",
  onDismiss,
  dismissOnMouseMove = false,
  hintText,
}) => {
  // Exit choreography phase: "idle" -> "priming" -> "reveal"
  const [exitPhase, setExitPhase] = useState<"idle" | "priming" | "reveal">("idle");
  const isExitingRef = useRef(false);

  // Canvas ref for interactive ambient particles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger choreographed exit sequence
  const triggerExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    // Step 1: Priming phase (glow flares, particles accelerate outward)
    setExitPhase("priming");

    // Step 2: Reveal phase (scale up, soft blur & opacity dissolve)
    setTimeout(() => {
      setExitPhase("reveal");

      // Step 3: Complete dismissal into the app
      setTimeout(() => {
        onDismiss?.();
      }, 550);
    }, 450);
  }, [onDismiss]);

  // Listen to keydown / button presses globally so pressing ANY key or button dismisses
  useEffect(() => {
    const handleKeyDown = () => {
      triggerExit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerExit]);

  // If dismissOnMouseMove is enabled (e.g. in screensaver mode), exit upon cursor movement
  useEffect(() => {
    if (!dismissOnMouseMove) return;

    let initialMouseMoved = false;
    let initialX: number | null = null;
    let initialY: number | null = null;

    // Small threshold so tiny micro-jitters or sensor noise don't immediately abort screensaver on mount
    const handleMouseMove = (e: MouseEvent) => {
      if (initialX === null || initialY === null) {
        initialX = e.clientX;
        initialY = e.clientY;
        return;
      }
      const distance = Math.hypot(e.clientX - initialX, e.clientY - initialY);
      if (distance > 12) {
        initialMouseMoved = true;
        triggerExit();
      }
    };

    const handleTouch = () => {
      triggerExit();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [dismissOnMouseMove, triggerExit]);

  // Interactive Ambient Particle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle pool: 48 drifting stardust specks
    const numParticles = 48;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      speed: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7 - 0.15,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.6 + 0.25,
        baseAlpha: Math.random() * 0.45 + 0.2,
        speed: Math.random() * 0.025 + 0.015,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        mouseActive = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const isPriming = isExitingRef.current;

      particles.forEach((p) => {
        // If in exit priming phase, gently accelerate particles outward
        if (isPriming) {
          const dx = p.x - width / 2;
          const dy = p.y - height / 2;
          p.vx += dx * 0.001;
          p.vy += dy * 0.001;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interactive dispersion / magnetism on cursor hover or touch
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            p.x -= (dx / dist) * 1.6;
            p.y -= (dy / dist) * 1.6;
            p.alpha = Math.min(0.95, p.baseAlpha + 0.45);
          } else {
            p.alpha = p.baseAlpha + Math.sin(tick * p.speed) * 0.15;
          }
        } else {
          p.alpha = p.baseAlpha + Math.sin(tick * p.speed) * 0.15;
        }

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.08, p.alpha)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(56, 189, 248, 0.7)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const defaultHint = dismissOnMouseMove
    ? "SCREENSAVER ACTIVE • MOVE MOUSE, CLICK, OR PRESS ANY KEY TO RESUME"
    : "CLICK OR PRESS ANY KEY TO ENTER";

  return (
    <div
      id="app-loading-screen"
      onClick={triggerExit}
      role="button"
      tabIndex={0}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-primary)] select-none overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
        exitPhase === "reveal" ? "opacity-0 pointer-events-none" : "opacity-100"
      } ${className}`}
      dir="ltr"
      aria-label="ON : TIME screen. Click or press any key to enter."
    >
      {/* Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
          exitPhase === "reveal" ? "opacity-20" : "opacity-100"
        }`}
      />

      {/* Ambient Radial Aura (Breathing at rest, expanding & flaring during exit) */}
      <div
        className={`absolute w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full pointer-events-none transition-all duration-700 ease-out ${
          exitPhase === "reveal"
            ? "scale-150 opacity-90"
            : exitPhase === "priming"
            ? "scale-125 opacity-70"
            : "animate-ambient-aura"
        }`}
        style={{
          background:
            "radial-gradient(circle, var(--accent-primary) 0%, transparent 68%)",
          filter: "blur(95px)",
        }}
        aria-hidden="true"
      />

      {/* Main Centered Typography with Option 3 Exit Choreography */}
      <div
        className={`relative z-10 transition-all duration-500 ease-out ${
          exitPhase === "priming"
            ? "scale-102 filter drop-shadow-[0_0_30px_var(--accent-primary)]"
            : exitPhase === "reveal"
            ? "scale-110 blur-[3px] -translate-y-2 opacity-10"
            : "scale-100 opacity-100"
        }`}
      >
        <div className="relative z-10 flex items-baseline justify-center font-clock leading-none text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[var(--text-primary)]">
          {/* "ON" in authentic Android logo font with stroke drawing and fill motion */}
          <div
            className="self-baseline inline-flex items-center justify-center relative mr-1 sm:mr-2 select-none"
            style={{ height: "0.715em" }}
            aria-label="ON"
          >
            <svg
              viewBox="0 10.75 150 78.5"
              className="h-full w-auto block overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Letter 'O' in Android typeface */}
              <path
                d="M 34,12
                   C 53,12 68,29 68,50
                   C 68,71 53,88 34,88
                   C 15,88 0,71 0,50
                   C 0,29 15,12 34,12
                   Z
                   M 34,26
                   C 45,26 54,37 54,50
                   C 54,63 45,74 34,74
                   C 23,74 14,63 14,50
                   C 14,37 23,26 34,26
                   Z"
                fillRule="evenodd"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="animate-android-stroke-fill text-[var(--text-primary)]"
                style={{ animationDelay: "0.05s" }}
              />

              {/* Letter 'N' in Android typeface */}
              <path
                d="M 84,88
                   L 84,46
                   A 33,34 0 0,1 150,46
                   L 150,88
                   L 135,88
                   L 135,46
                   A 18,19 0 0,0 99,46
                   L 99,88
                   Z"
                fillRule="evenodd"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="animate-android-stroke-fill text-[var(--text-primary)]"
                style={{ animationDelay: "0.2s" }}
              />
            </svg>
          </div>

          {/* Colon Divider: Centered vertically heightwise with soft rhythmic clock pulse */}
          <div
            className="animate-clock-blink text-[var(--accent-primary)] mx-2 sm:mx-3 md:mx-4 lg:mx-5 self-baseline inline-flex items-center justify-center select-none origin-center"
            style={{ height: "0.715em" }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 20 72"
              className="h-full w-auto block overflow-visible"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top dot: centered at y=21, exactly 15 units from middle (y=36) */}
              <circle cx="10" cy="21" r="5" />
              {/* Bottom dot: centered at y=51, exactly 15 units from middle (y=36) */}
              <circle cx="10" cy="51" r="5" />
            </svg>
          </div>
          <span className="sr-only">:</span>

          {/* "TIME" - Exact cap-height and baseline match to "ON" */}
          <span className="self-baseline font-black tracking-tight text-[var(--text-primary)] drop-shadow-sm ml-1 select-none">
            TIME
          </span>
        </div>
      </div>

      {/* Subtle indicator hint */}
      <div
        className={`absolute bottom-8 z-20 flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] opacity-60 transition-opacity duration-300 pointer-events-none ${
          exitPhase !== "idle" ? "opacity-0" : "opacity-60"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
        <span>{hintText || defaultHint}</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
