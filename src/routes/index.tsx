import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AcademyApp = lazy(() =>
  import("../components/AcademyApp").then((m) => ({ default: m.default })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سامانه مدیریت آموزشگاه موسیقی شاهرخ" },
      {
        name: "description",
        content:
          "مدیریت هنرجویان، اساتید، حضور و غیاب، کارکرد و گزارش‌های آموزشگاه موسیقی در یک سامانه یکپارچه.",
      },
      { property: "og:title", content: "سامانه مدیریت آموزشگاه موسیقی شاهرخ" },
      {
        property: "og:description",
        content:
          "مدیریت هنرجویان، اساتید، حضور و غیاب، کارکرد و گزارش‌های آموزشگاه موسیقی در یک سامانه یکپارچه.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <ClientOnly fallback={<div className="h-screen w-screen bg-[var(--bg-primary)]" />}>
        <Suspense fallback={<div className="h-screen w-screen bg-[var(--bg-primary)]" />}>
          <AcademyApp />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

