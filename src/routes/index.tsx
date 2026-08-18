import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuildingView } from "@/components/mp2k/building-view";
import { SimControls } from "@/components/mp2k/sim-controls";
import { MetricsPanel } from "@/components/mp2k/metrics-panel";
import { DesLeversPanel } from "@/components/mp2k/des-levers";
import { OpsPanel } from "@/components/mp2k/ops-panel";
import { CasePanel } from "@/components/mp2k/case-panel";
import { GlossaryPanel } from "@/components/mp2k/glossary-panel";
import { ManualPanel } from "@/components/mp2k/manual-panel";
import { StatsPanel, StatsTracker, StatsStrip } from "@/components/mp2k/stats-panel";
import { IntroPanel } from "@/components/mp2k/intro-panel";
import { Mp2kLogo } from "@/components/mp2k/logo";
import { cn } from "@/lib/utils";
import { BookOpen, Box, Calculator, ArrowRight, ScrollText, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Mp2kApp,
});

type Door = "intro" | "lab";
type StepId = "case" | "sim" | "analytics" | "manual" | "stats";

const STEPS: {
  id: StepId;
  n: string;
  label: string;
  short: string;
  icon: typeof BookOpen;
}[] = [
  { id: "case", n: "1", label: "Kasus", short: "Desain produk & proses", icon: BookOpen },
  { id: "sim", n: "2", label: "Simulasi", short: "DES · 3 tuas", icon: Box },
  { id: "analytics", n: "3", label: "Analitik", short: "Kurva + CONWIP", icon: Calculator },
];

function goTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Mp2kApp() {
  const [door, setDoor] = useState<Door>("intro");
  const [step, setStep] = useState<StepId>("case");

  function go(next: StepId) {
    setStep(next);
    goTop();
  }

  function openIntro() {
    setDoor("intro");
    setStep("case");
    goTop();
  }

  function openLab(id: StepId = "case") {
    setDoor("lab");
    setStep(id);
    goTop();
  }

  const onUtility = step === "manual" || step === "stats";
  const showLabNav = door === "lab" && !onUtility;

  return (
    <div className="min-h-[calc(100dvh-var(--grok-banner-h,0px))] bg-bg text-fg">
      <StatsTracker />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Mp2kLogo />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  MP2K — Multi-Moda Produksi Proyek Konstruksi
                </h1>
                <p className="mt-0.5 text-sm text-muted">
                  Lab interaktif: tiga kurva + DES + Control/CONWIP
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("manual");
                  goTop();
                }}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-sm font-medium",
                  step === "manual"
                    ? "border-fg/30 bg-elevated text-fg"
                    : "border-border bg-surface text-muted hover:text-fg",
                )}
              >
                <ScrollText className="size-3.5" />
                Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("stats");
                  goTop();
                }}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-sm font-medium",
                  step === "stats"
                    ? "border-fg/30 bg-elevated text-fg"
                    : "border-border bg-surface text-muted hover:text-fg",
                )}
              >
                <BarChart3 className="size-3.5" />
                Stats
              </button>
            </div>
          </div>

          <nav
            aria-label="Putaran"
            className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1"
          >
            {(
              [
                { id: "intro" as const, label: "Pengenalan" },
                { id: "lab" as const, label: "Penerapan" },
              ] as const
            ).map((d) => {
              const active = !onUtility && door === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => (d.id === "intro" ? openIntro() : openLab("case"))}
                  className={cn(
                    "flex min-h-12 items-center justify-center rounded-[calc(var(--radius-md)-2px)] px-3 py-2",
                    active
                      ? "bg-primary text-primary-fg"
                      : "text-muted hover:bg-subtle/80 hover:text-fg",
                  )}
                >
                  <span className="text-sm font-medium text-center">{d.label}</span>
                </button>
              );
            })}
          </nav>

          {showLabNav ? (
            <nav
              aria-label="Alur kasus"
              className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1"
            >
              {STEPS.map(({ id, n, label, short, icon: Icon }) => {
                const active = step === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id)}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-1 py-2 sm:flex-row sm:gap-2 sm:px-3",
                      active
                        ? "bg-primary text-primary-fg"
                        : "text-muted hover:bg-subtle/80 hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                        active ? "bg-primary-fg/15 text-primary-fg" : "bg-border/80 text-fg",
                      )}
                    >
                      {n}
                    </span>
                    <span className="flex flex-col items-center sm:items-start">
                      <span className="text-xs font-medium sm:text-sm">{label}</span>
                      <span
                        className={cn(
                          "hidden text-[10px] sm:inline",
                          active ? "text-primary-fg/70" : "text-faint",
                        )}
                      >
                        {short}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {step === "manual" ? (
          <ManualPanel />
        ) : step === "stats" ? (
          <StatsPanel />
        ) : door === "intro" ? (
          <IntroPanel onOpenLab={() => openLab("case")} />
        ) : step === "case" ? (
          <CasePanel onNext={() => go("sim")} />
        ) : step === "sim" ? (
          <div className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-wider text-faint">
                Langkah 2 · Simulasi
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">DES multi-moda</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Atur Capacity · Variability · Inventory, jalankan, lalu bandingkan titik operasi ke
                kurva di Analitik.
              </p>
            </div>
            <DesLeversPanel />
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <BuildingView live />
              <div className="space-y-4">
                <SimControls />
                <MetricsPanel />
                <StatsStrip />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => go("analytics")}
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
              >
                Lanjut ke Analitik
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-wider text-faint">
                Langkah 3 · Analitik
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Kurva teori + titik DES
              </h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Little · Kingman · Inventory/FR · Kurva gabungan & CONWIP — titik oranye dari
                simulasi.
              </p>
            </div>
            <OpsPanel />
            <GlossaryPanel />
          </div>
        )}
      </main>
    </div>
  );
}
