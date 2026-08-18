import { useState } from "react";
import {
  INTRO_CURVES,
  LITTLE_SCENARIOS,
  KINGMAN_SCENARIOS,
  INV_SCENARIOS,
  CONTROL_SCENARIOS,
  LITTLE_BASE,
  KINGMAN_BASE,
  DEMO_SYSTEM,
  DEMO_COLORS,
  formatNum,
  formatPct,
  type IntroCurve,
} from "@/lib/mp2k/intro-lessons";
import { ControlLesson } from "@/components/mp2k/control-lesson";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

type Props = { onOpenLab: () => void };

export function IntroPanel({ onOpenLab }: Props) {
  const [curve, setCurve] = useState<IntroCurve>("little");
  const [done, setDone] = useState<Record<IntroCurve, string[]>>({
    little: [],
    kingman: [],
    inventory: [],
    control: [],
  });

  function mark(id: IntroCurve, sid: string) {
    setDone((prev) => (prev[id].includes(sid) ? prev : { ...prev, [id]: [...prev[id], sid] }));
  }

  function needFor(id: IntroCurve) {
    if (id === "little") return LITTLE_SCENARIOS;
    if (id === "kingman") return KINGMAN_SCENARIOS;
    if (id === "inventory") return INV_SCENARIOS;
    return CONTROL_SCENARIOS;
  }

  const allReady = INTRO_CURVES.every((c) => needFor(c.id).every((s) => done[c.id].includes(s.id)));
  const scenarios = needFor(curve);
  const meta = INTRO_CURVES.find((c) => c.id === curve)!;
  const lastId = done[curve][done[curve].length - 1];
  const lastSay = scenarios.find((s) => s.id === lastId)?.say;

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Pengenalan</h2>
        <p className="text-sm text-muted leading-relaxed">
          Empat modul memakai <strong className="text-fg">satu sistem demo yang sama</strong>.
          Angka oranye mengikuti dari Little → Kingman → Inventory → Control.
        </p>
        <SystemChip />
      </div>

      <nav
        aria-label="Modul pengenalan"
        className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1 sm:grid-cols-4"
      >
        {INTRO_CURVES.map((c) => {
          const ready = needFor(c.id).every((s) => done[c.id].includes(s.id));
          const active = curve === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurve(c.id)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-1 py-2",
                active ? "bg-primary text-primary-fg" : "text-muted hover:bg-subtle/80 hover:text-fg",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                  active ? "bg-primary-fg/15 text-primary-fg" : "bg-border/80 text-fg",
                )}
              >
                {ready ? <Check className="size-3.5" strokeWidth={2.25} /> : c.n}
              </span>
              <span className="text-xs font-medium text-center leading-snug sm:text-sm">{c.label}</span>
            </button>
          );
        })}
      </nav>

      {curve === "control" ? (
        <ControlLesson seen={done.control} onSee={(id) => mark("control", id)} />
      ) : (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-faint">{meta.label}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">{meta.question}</h3>
          </div>
          <BridgeNote curve={curve} />
          <div className="grid gap-2 sm:grid-cols-3">
            {scenarios.map((s) => {
              const on = lastId === s.id;
              const was = done[curve].includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => mark(curve, s.id)}
                  className={cn(
                    "flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] border px-3 text-center text-sm font-medium leading-snug",
                    on ? "border-fg bg-primary text-primary-fg" : "border-border bg-elevated text-fg hover:bg-subtle",
                  )}
                >
                  {was && !on ? <Check className="mr-1.5 size-3.5 shrink-0 text-muted" strokeWidth={2} /> : null}
                  {s.label}
                </button>
              );
            })}
          </div>
          {lastSay ? (
            <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-sm leading-relaxed text-fg">
              {lastSay}
            </p>
          ) : (
            <p className="text-sm text-muted">
              Pilih satu if-then. Grafik interaktif penuh tab 1–3 sedang dipulihkan; tab Control sudah lengkap.
            </p>
          )}
          {needFor(curve).every((s) => done[curve].includes(s.id)) ? (
            <button
              type="button"
              onClick={() => {
                const order: IntroCurve[] = ["little", "kingman", "inventory", "control"];
                const i = order.indexOf(curve);
                if (i >= 0 && i < order.length - 1) setCurve(order[i + 1]);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              Lanjut
              <ArrowRight className="size-4" />
            </button>
          ) : null}
        </div>
      )}

      {allReady ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Menuju kasus Gedung</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">Kurva yang sama, objek berganti</h3>
          <button
            type="button"
            onClick={onOpenLab}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Lanjut ke kasus
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-faint">Jelajahi semua skenario di empat tab agar jembatan muncul.</p>
      )}
    </div>
  );
}

function SystemChip() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-sm)] border px-3 py-2 text-xs font-mono"
      style={{
        borderColor: DEMO_COLORS.operating,
        background: "color-mix(in srgb, " + DEMO_COLORS.operating + " 8%, transparent)",
      }}
    >
      <span className="inline-flex items-center gap-1.5 font-sans font-medium" style={{ color: DEMO_COLORS.operating }}>
        <span className="inline-block size-2.5 rounded-full" style={{ background: DEMO_COLORS.operating }} />
        Sistem demo
      </span>
      <span className="text-muted">T0={DEMO_SYSTEM.T0}</span>
      <span className="text-muted">rb={DEMO_SYSTEM.rb}</span>
      <span className="text-fg font-semibold">W0={DEMO_SYSTEM.W0}</span>
      <span className="text-muted">V={formatNum(DEMO_SYSTEM.V)}</span>
      <span className="text-fg font-semibold">Wopt≈{DEMO_SYSTEM.Wopt}</span>
      <span className="text-muted">
        Little: WIP={LITTLE_BASE.wip}·TH={LITTLE_BASE.th}·CT={LITTLE_BASE.ct}
      </span>
    </div>
  );
}

function BridgeNote({ curve }: { curve: IntroCurve }) {
  if (curve === "little") {
    return (
      <p className="text-xs text-muted leading-relaxed rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
        Titik acuan <span className="font-mono text-fg">WIP={LITTLE_BASE.wip}, TH={LITTLE_BASE.th}, CT={LITTLE_BASE.ct}</span> =
        best-case di <strong className="text-fg">W0={DEMO_SYSTEM.W0}</strong>.
      </p>
    );
  }
  if (curve === "kingman") {
    return (
      <p className="text-xs text-muted leading-relaxed rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
        Bottleneck rb={DEMO_SYSTEM.rb}. Base{" "}
        <span className="font-mono text-fg">ū={formatPct(KINGMAN_BASE.u)}, V={formatNum(KINGMAN_BASE.v)}</span>.
      </p>
    );
  }
  if (curve === "inventory") {
    return (
      <p className="text-xs text-muted leading-relaxed rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
        Demand rate = TH Little = <span className="font-mono text-fg">2</span>.
      </p>
    );
  }
  return null;
}
