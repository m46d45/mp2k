import { useState } from "react";
import {
  INTRO_CURVES,
  LITTLE_SCENARIOS,
  KINGMAN_SCENARIOS,
  INV_SCENARIOS,
  CONTROL_SCENARIOS,
  LITTLE_BASE,
  DEMO_SYSTEM,
  DEMO_COLORS,
  formatNum,
  type IntroCurve,
} from "@/lib/mp2k/intro-lessons";
import { LittleLesson } from "@/components/mp2k/little-lesson";
import { KingmanLesson } from "@/components/mp2k/kingman-lesson";
import { InventoryLesson } from "@/components/mp2k/inventory-lesson";
import { ControlLesson } from "@/components/mp2k/control-lesson";
import { BridgeCard } from "@/components/mp2k/intro-shared";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Pengenalan</h2>
        <p className="text-sm text-muted leading-relaxed">
          Empat modul memakai <strong className="text-fg">satu sistem demo yang sama</strong>.
          Angka dan warna oranye mengikuti dari Little → Kingman → Inventory → Control.
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

      {curve === "little" && (
        <LittleLesson
          seen={done.little}
          onSee={(id) => mark("little", id)}
          onNext={() => setCurve("kingman")}
        />
      )}
      {curve === "kingman" && (
        <KingmanLesson
          seen={done.kingman}
          onSee={(id) => mark("kingman", id)}
          onNext={() => setCurve("inventory")}
        />
      )}
      {curve === "inventory" && (
        <InventoryLesson
          seen={done.inventory}
          onSee={(id) => mark("inventory", id)}
          onNext={() => setCurve("control")}
        />
      )}
      {curve === "control" && (
        <ControlLesson seen={done.control} onSee={(id) => mark("control", id)} />
      )}

      {allReady ? (
        <BridgeCard onOpenLab={onOpenLab} />
      ) : (
        <p className="text-xs text-faint">
          Setelah semua skenario dijelajahi (tiga kurva + Control), jembatan ke kasus muncul di sini.
        </p>
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
      <span
        className="inline-flex items-center gap-1.5 font-sans font-medium"
        style={{ color: DEMO_COLORS.operating }}
      >
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
