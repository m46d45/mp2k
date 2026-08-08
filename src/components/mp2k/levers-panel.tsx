import { LEVERS, type LeverId } from "@/lib/mp2k/model";
import { useMp2k } from "@/lib/mp2k/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Boxes, GitBranch, Gauge, Layers, Shuffle } from "lucide-react";

const ICONS: Record<LeverId, typeof Boxes> = {
  product: Layers,
  process: GitBranch,
  capacity: Gauge,
  inventory: Boxes,
  variability: Shuffle,
};

const SETTING_KEY: Record<
  LeverId,
  { key: keyof ReturnType<typeof useMp2k.getState>["leverSettings"]; label: string; on: string; off: string }
> = {
  product: {
    key: "productStandard",
    label: "Standardisasi interface",
    on: "Interface standar — rework balok jarang",
    off: "Non-standar — risiko rework di yard naik",
  },
  process: {
    key: "processPull",
    label: "Pull system",
    on: "Pull: material hanya lepas saat predecessor ready",
    off: "Push: material bisa menumpuk di depan",
  },
  capacity: {
    key: "capacityBoost",
    label: "Capacity buffer",
    on: "Crew/crane ekstra — cycle lebih cepat",
    off: "Capacity baseline",
  },
  inventory: {
    key: "inventoryCap",
    label: "WIP cap",
    on: "Cap yard & staging aktif",
    off: "Tanpa cap — WIP bisa membengkak (terutama push)",
  },
  variability: {
    key: "variabilityControl",
    label: "Kendali variability",
    on: "Delay acak ditekan",
    off: "Delay multi-moda bisa muncul tiap langkah",
  },
};

export function LeversPanel() {
  const activeLever = useMp2k((s) => s.activeLever);
  const setActiveLever = useMp2k((s) => s.setActiveLever);
  const leverSettings = useMp2k((s) => s.leverSettings);
  const toggleLeverSetting = useMp2k((s) => s.toggleLeverSetting);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Lima tuas PPM</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted leading-relaxed">
          Project Production Management mengatur sistem lewat lima lever Production System Optimization.
          Toggle di bawah memengaruhi perilaku simulasi multi-moda.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {LEVERS.map((lev, i) => {
          const Icon = ICONS[lev.id];
          const active = activeLever === lev.id;
          return (
            <button
              key={lev.id}
              type="button"
              onClick={() => setActiveLever(active ? null : lev.id)}
              className={cn(
                "flex min-h-11 flex-col items-start gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-colors",
                active
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border bg-elevated text-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon className="size-4" strokeWidth={1.75} />
                <span className="font-mono text-[10px] text-faint">{i + 1}</span>
              </span>
              <span className="text-xs font-semibold leading-snug text-fg">{lev.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {LEVERS.map((lev) => {
          const setting = SETTING_KEY[lev.id];
          const on = leverSettings[setting.key];
          const expanded = activeLever === lev.id || activeLever === null;
          if (activeLever && activeLever !== lev.id) return null;
          return (
            <Card key={lev.id} className={cn(!expanded && "hidden")}>
              <CardHeader>
                <CardTitle className="text-base">
                  {lev.name}{" "}
                  <span className="font-normal text-muted">· {lev.nameEn}</span>
                </CardTitle>
                <CardDescription>{lev.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[var(--radius-sm)] border border-border bg-elevated/80 p-3 text-sm text-muted leading-relaxed">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">
                    Terapan di MP2K
                  </p>
                  {lev.mp2k}
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-border p-3 hover:bg-elevated/50">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-[var(--color-accent)]"
                    checked={on}
                    onChange={() => toggleLeverSetting(setting.key)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-fg">{setting.label}</span>
                    <span className="block text-xs text-muted">{on ? setting.on : setting.off}</span>
                  </span>
                </label>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeLever && (
        <button
          type="button"
          className="text-sm text-muted underline-offset-2 hover:text-fg hover:underline"
          onClick={() => setActiveLever(null)}
        >
          Tampilkan semua tuas
        </button>
      )}
    </div>
  );
}
