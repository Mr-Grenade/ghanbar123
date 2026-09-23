import React from "react";
interface AppLogoProps {
  className?: string;
}
export const AppLogo: React.FC<AppLogoProps> = ({ className = "w-7 h-7" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Grand Piano Top / Book Body */}
      <path
        d="M24 73C20 73 14 69 14 62V28C14 18 22 10 32 10C42 10 49 14 55 22C60 29 65 37 71 43C74 46 76 48 76 52V73H24Z"
        fill="var(--accent-primary)"
      />
      {/* Piano Smooth S-Curve Body Refinement */}
      <path
        d="M28 10C18 10 14 19 14 29V67C14 71.5 17.5 73 21 73H76V51.5C76 48 73.5 45.5 69.5 42C64.5 37.5 59.5 29.5 54.5 22C48.5 13 40 10 28 10Z"
        fill="var(--secondary-primary)"
      />
      {/* White Book Pages Gap */}
      <path
        d="M21 73C17 73 14 76 14 80C14 84 17 87 21 87H76V79H25C22.8 79 21.5 77.8 21.5 76.5C21.5 75.2 22.8 74 25 74H76V73H21Z"
        fill="#ffffff"
      />
      {/* Book Bottom Cover Spine & Edge */}
      <path
        d="M14 74C14 83 20 87 28 87H76V82H28C23 82 19 80 19 75V74H14Z"
        fill="var(--accent-primary)"
      />
      {/* Right Book Cover L-Bracket */}
      <path d="M80 50V87H74V87L74 50H80Z" fill="var(--accent-primary)" />
      <path d="M74 81H80V87H30V81H74Z" fill="var(--accent-primary)" />
      {/* Bookmark Ribbon */}
      <polygon
        points="26,77 35,77 35,95 30.5,90.5 26,95"
        fill="var(--warning)"
      />
    </svg>
  );
};
