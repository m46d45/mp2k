import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuildingView } from "@/components/mp2k/building-view";
import { SimControls } from "@/components/mp2k/sim-controls";
import { MetricsPanel } from "@/components/mp2k/metrics-panel";
import { DesLeversPanel } from "@/components/mp2k/des-levers";
import { OpsPanel } from "@/components/mp2k/ops-panel";
import { CasePanel } from "@/components/mp2k/case-panel";
import { CaseCurvesPanel } from "@/components/mp2k/case-curves";
import { CaseConwipPanel } from "@/components/mp2k/case-conwip";
import { GlossaryPanel } from "@/components/mp2k/glossary-panel";
import { ManualPanel } from "@/components/mp2k/manual-panel";
import { StatsPanel, StatsTracker, StatsStrip } from "@/components/mp2k/stats-panel";
import { IntroPanel } from "@/components/mp2k/intro-panel";
import { Mp2kLogo } from "@/components/mp2k/logo";
import { cn } from "@/lib/utils";
import { BookOpen, Box, Calculator, ArrowRight, ScrollText, BarChart3, GitBranch, Gauge } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Mp2kApp,
});

type Door = "intro" | "lab";
type StepId = "case" | "sim" | "analytics" | "curves" | "conwip" | "manual" | "stats";

const STEPS: {
  id: StepId;
  n: string;
  label: string;
  short: string;
  icon: typeof BookOpen;
}[] = [
  { id: "case", n: "1", label: "Kasus", short: "Desain produk & proses", icon: BookOpen },
  { id: "sim", n: "2", label: "Simulasi", short: "DES · 3 tuas", icon: Box },
  { id: "analytics", n: "3", label: "Analitik", short: "Tiga kurva", icon: Calculator },
  { id: "curves", n: "4", label: "Kurva gabungan", short: "WIP–TH–CT", icon: GitBranch },
  { id: "conwip", n: "5", label: "CONWIP", short: "Batas WIP", icon: Gauge },
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
              <div className="min-w-0 border-l border-border pl-3">
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Multi-Moda Produksi Proyek Konstruksi
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted leading-relaxed">
                  Laboratorium Virtual Pengelolaan Produksi di Proyek Konstruksi dan Sains Operasi.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => go("stats")}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-sm font-medium",
                  step === "stats"
                    ? "border-fg bg-primary text-primary-fg"
                    : "border-border bg-surface text-fg hover:bg-elevated",
                )}
              >
                <BarChart3 className="size-3.5" strokeWidth={1.75} />
                Statistik
              </button>
              <button
                type="button"
                onClick={() => go("manual")}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-sm font-medium",
                  step === "manual"
                    ? "border-fg bg-primary text-primary-fg"
                    : "border-border bg-surface text-fg hover:bg-elevated",
                )}
              >
                <ScrollText className="size-3.5" strokeWidth={1.75} />
                Manual
              </button>
            </div>
          </div>

          <nav
            aria-label="Putaran"
            className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1"
          >
            {(
              [
                { id: "intro" as const, label: "Pengenalan Tiga Kurva" },
                { id: "lab" as const, label: "Penerapan di kasus Gedung" },
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
              className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1 sm:grid-cols-5"
            >
              {STEPS.map(({ id, n, label, short, icon: Icon }) => {
                const active = step === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id)}
                    className={cn(
                      "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-1 py-2 text-center transition-colors sm:px-2",
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
                    <span className="min-w-0">
                      <span className="flex items-center justify-center gap-1 text-xs font-medium sm:text-sm">
                        <Icon className="hidden size-3.5 lg:inline" strokeWidth={1.75} />
                        {label}
                      </span>
                      <span
                        className={cn(
                          "hidden text-[10px] sm:block",
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {step === "stats" && <StatsPanel />}
        {step === "manual" && (
          <ManualPanel onBack={() => (door === "intro" ? openIntro() : openLab("case"))} />
        )}
        {step !== "stats" && step !== "manual" && door === "intro" && (
          <IntroPanel onOpenLab={() => openLab("case")} />
        )}
        {step !== "stats" && step !== "manual" && door === "lab" && step === "case" && (
          <CasePanel onNext={() => go("sim")} />
        )}
        {step !== "stats" && step !== "manual" && door === "lab" && step === "sim" && (
          <SimStep onNext={() => go("analytics")} />
        )}
        {step !== "stats" && step !== "manual" && door === "lab" && step === "analytics" && (
          <AnalyticsStep onOpenIntro={openIntro} onNext={() => go("curves")} />
        )}
        {step !== "stats" && step !== "manual" && door === "lab" && step === "curves" && (
          <CaseCurvesPanel onNext={() => go("conwip")} />
        )}
        {step !== "stats" && step !== "manual" && door === "lab" && step === "conwip" && (
          <CaseConwipPanel />
        )}
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
          <Mp2kMarkFooter />
          <p className="text-xs text-faint">
            MP2K · Capacity · Variability · Inventory · Little · Kingman · FR · CONWIP
          </p>
          <StatsStrip onOpen={() => go("stats")} />
          <button
            type="button"
            onClick={() => go("manual")}
            className="text-xs font-medium text-muted underline underline-offset-2 hover:text-fg"
          >
            Manual
          </button>
        </div>
      </footer>
    </div>
  );
}

function Mp2kMarkFooter() {
  return (
    <div className="flex items-center gap-2 text-muted">
      <Mp2kLogo showWordmark={false} className="opacity-90" />
      <span className="font-mono text-xs font-semibold tracking-wide text-fg">MP2K</span>
    </div>
  );
}

function SimStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Langkah 2 · Simulasi DES</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Simulasi DES · tiga tuas produksi</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Product design dan Process design sudah ditetapkan. Ubah{" "}
            <strong className="text-fg">Capacity</strong>,{" "}
            <strong className="text-fg">Variability</strong>, dan{" "}
            <strong className="text-fg">Inventory</strong> — mesin event menggerakkan denah dan
            menghitung TH, CT, WIP, utilisasi, serta fill rate.
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium text-fg hover:bg-elevated"
        >
          Lanjut ke Analitik
          <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <BuildingView />
          <DesLeversPanel />
          <GlossaryPanel />
        </section>
        <section className="space-y-4">
          <MetricsPanel />
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Kendali DES</h2>
            <SimControls />
          </div>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Bandingkan ke kurva Analitik
            <ArrowRight className="size-4" />
          </button>
        </section>
      </div>
    </div>
  );
}

function AnalyticsStep({
  onOpenIntro,
  onNext,
}: {
  onOpenIntro: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Langkah 3 · Analitik</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Tiga kurva sains operasi</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Kurva yang sama dengan Pengenalan. Titik oranye = run DES.
            Little (WIP–TH–CT), Kingman (variability × utilisasi), fill rate vs inventory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenIntro}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium text-fg hover:bg-elevated"
          >
            Kembali ke pengenalan
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Kurva gabungan
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <GlossaryPanel />
      <OpsPanel />
    </div>
  );
}
