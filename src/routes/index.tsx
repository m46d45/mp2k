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
import { Mp2kLogo } from "@/components/mp2k/logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Box, Calculator, ArrowRight, ScrollText } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Mp2kApp,
});

type StepId = "case" | "sim" | "analytics" | "manual";

const STEPS: {
  id: Exclude<StepId, "manual">;
  n: number;
  label: string;
  short: string;
  icon: typeof BookOpen;
}[] = [
  { id: "case", n: 1, label: "Kasus", short: "Product & process fixed", icon: BookOpen },
  { id: "sim", n: 2, label: "Simulasi", short: "DES · 3 tuas", icon: Box },
  { id: "analytics", n: 3, label: "Analitik", short: "Tiga kurva OS", icon: Calculator },
];

function Mp2kApp() {
  const [step, setStep] = useState<StepId>("case");

  return (
    <div className="min-h-[calc(100dvh-var(--grok-banner-h,0px))] bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Mp2kLogo />
              <div className="min-w-0 border-l border-border pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Edukasi PPM</Badge>
                  <Badge variant="default">model didaktik</Badge>
                </div>
                <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                  Multi-Moda Produksi Proyek Konstruksi
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted leading-relaxed">
                  Kasus (design fixed) → DES Capacity/Variability/Inventory → analitik 3 kurva.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="hidden text-right text-xs text-faint sm:block">
                <p>Frame beton · grid 3×5 · 2 lantai</p>
                <p className="mt-0.5">Bukan digital twin · DES seedable</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("manual")}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-xs font-medium",
                  step === "manual"
                    ? "border-fg bg-primary text-primary-fg"
                    : "border-border bg-surface text-fg hover:bg-elevated",
                )}
              >
                <ScrollText className="size-3.5" strokeWidth={1.75} />
                Manual lab
              </button>
            </div>
          </div>

          <nav aria-label="Alur belajar" className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1">
            {STEPS.map(({ id, n, label, short, icon: Icon }, i) => {
              const active = step === id;
              const done = STEPS.findIndex((s) => s.id === step) > i;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStep(id)}
                  className={cn(
                    "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-2 py-2 text-center transition-colors sm:flex-row sm:gap-2 sm:px-3",
                    active
                      ? "bg-primary text-primary-fg"
                      : done
                        ? "bg-subtle text-fg hover:bg-subtle"
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
                    <span className="flex items-center justify-center gap-1.5 text-sm font-medium">
                      <Icon className="hidden size-3.5 sm:inline" strokeWidth={1.75} />
                      {label}
                    </span>
                    <span className={cn("hidden text-[11px] sm:block", active ? "text-primary-fg/70" : "text-faint")}>
                      {short}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {step === "case" && <CasePanel onNext={() => setStep("sim")} />}
        {step === "sim" && <SimStep onNext={() => setStep("analytics")} />}
        {step === "analytics" && <AnalyticsStep />}
        {step === "manual" && <ManualPanel onBack={() => setStep("case")} />}
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
          <Mp2kMarkFooter />
          <p className="text-xs text-faint">
            MP2K · model didaktik · DES: Capacity · Variability · Inventory · Analitik: Little ·
            Kingman · FR
          </p>
          <button
            type="button"
            onClick={() => setStep("manual")}
            className="text-xs font-medium text-muted underline underline-offset-2 hover:text-fg"
          >
            Buka manual lab
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
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Discrete event · tiga tuas produksi
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Product & process design fixed. Putar <strong className="text-fg">Capacity</strong>,{" "}
            <strong className="text-fg">Variability</strong>, dan{" "}
            <strong className="text-fg">Inventory</strong> — engine event menggerakkan denah dan
            menghitung TH, CT, WIP, utilisasi, fill rate.
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

function AnalyticsStep() {
  return (
    <div className="space-y-4">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">Langkah 3 · Analitik</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Tiga kurva Operations Science</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Hukum di balik hasil DES: <strong className="text-fg">WIP–TH–CT</strong> (capacity/inventory),{" "}
          <strong className="text-fg">Kingman</strong> (variability × utilisasi),{" "}
          <strong className="text-fg">fill rate vs inventory</strong>.
        </p>
      </div>
      <GlossaryPanel />
      <OpsPanel />
    </div>
  );
}
