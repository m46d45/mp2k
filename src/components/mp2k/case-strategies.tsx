import { useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  BarChart,
  Bar,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Feature B — Costs & Schedules based Production Strategies (konseptual).
 * Semua metrik = indeks 1–5 (given), bukan hari/biaya absolut atau output DES.
 */

export type StrategyId = "tradisional" | "hibrid" | "industri";

export type ProductionStrategy = {
  id: StrategyId;
  label: string;
  short: string;
  product: string;
  process: string;
  moda: string;
  /** Indeks schedule 1=cepat … 5=lama */
  duration: number;
  /** Indeks biaya 1=rendah … 5=tinggi */
  cost: number;
  /** Indeks WIP puncak 1=rendah … 5=tinggi */
  peakWip: number;
  note: string;
  color: string;
};

/** Indeks given 1–5 — perbandingan relatif, bukan satuan lab. */
export const CASE_STRATEGIES: ProductionStrategy[] = [
  {
    id: "tradisional",
    label: "Tradisional",
    short: "M-dominan",
    product: "Hampir semua elemen dicor di lokasi",
    process: "Sekuensial per zona; sedikit prerabrikasi",
    moda: "M >> N, F",
    duration: 5,
    cost: 2,
    peakWip: 5,
    note: "Schedule paling panjang; biaya material relatif rendah, tenaga site dan CT tinggi.",
    color: "#64748b",
  },
  {
    id: "hibrid",
    label: "Hibrid",
    short: "M + N + F",
    product: "Kolom site · balok near-site · panel far-supply",
    process: "Gelombang zona; tiga moda harus match di workface",
    moda: "M · N · F",
    duration: 3,
    cost: 3,
    peakWip: 3,
    note: "Framing kasus lab saat ini. Titik tengah cost–schedule; inventory & CONWIP menjadi kritis.",
    color: "#f97316",
  },
  {
    id: "industri",
    label: "Industri",
    short: "Lebih F",
    product: "Panel dan elemen prerabrikasi lebih agresif",
    process: "Assembly-dominated; lead time supply lebih panjang",
    moda: "F >> M, N",
    duration: 2,
    cost: 5,
    peakWip: 2,
    note: "Schedule lebih pendek; biaya bergeser ke material/logistik. WIP puncak lebih terkendali jika pasokan stabil.",
    color: "#0f766e",
  },
];

const GRID = "#e5e7eb";
const MUTED = "#6b7280";

export function CaseStrategies() {
  const [active, setActive] = useState<StrategyId>("hibrid");
  const sc = CASE_STRATEGIES.find((s) => s.id === active) ?? CASE_STRATEGIES[1];

  const scatter = CASE_STRATEGIES.map((s) => ({
    id: s.id,
    name: s.label,
    duration: s.duration,
    cost: s.cost,
    peakWip: s.peakWip,
    fill: s.color,
  }));

  const bars = CASE_STRATEGIES.map((s) => ({
    name: s.label,
    Durasi: s.duration,
    Biaya: s.cost,
    "WIP puncak": s.peakWip,
    fill: s.color,
  }));

  return (
    <Card className="border-fg/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Strategi produksi · cost & schedule</CardTitle>
        <CardDescription>
          Tiga paket <strong className="text-fg">produk + proses</strong> — metrik indeks 1–5
          (konseptual), bukan hasil Run DES.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-elevated px-3 py-2 text-[11px] text-muted leading-relaxed">
          Skala <strong className="text-fg">1–5</strong>: Durasi 1=cepat · 5=lama; Biaya 1=rendah ·
          5=tinggi; WIP puncak 1=rendah · 5=tinggi. Bukan hari atau rupiah absolut. Strategi{" "}
          <strong className="text-fg">Hibrid</strong> ≈ framing kasus Simulasi.
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          {CASE_STRATEGIES.map((s) => {
            const on = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={cn(
                  "min-h-11 rounded-[var(--radius-sm)] border px-3 py-2 text-left transition-colors",
                  on
                    ? "border-fg bg-primary text-primary-fg"
                    : "border-border bg-surface text-fg hover:bg-subtle",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold leading-tight">{s.label}</span>
                  <Badge variant="default" className={cn("text-[10px]", on ? "border-primary-fg/30" : "")}>
                    {s.short}
                  </Badge>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10px] leading-snug",
                    on ? "text-primary-fg/75" : "text-faint",
                  )}
                >
                  D{s.duration} · B{s.cost} · W{s.peakWip}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
            {sc.label} · produk & proses
          </p>
          <p className="mt-1 text-sm text-fg leading-snug">
            <strong>Produk:</strong> {sc.product}
          </p>
          <p className="mt-0.5 text-sm text-fg leading-snug">
            <strong>Proses:</strong> {sc.process}
          </p>
          <p className="mt-1 text-xs text-muted leading-relaxed">{sc.note}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Metric k="Durasi" v={`${sc.duration} / 5`} />
            <Metric k="Biaya" v={`${sc.cost} / 5`} />
            <Metric k="WIP puncak" v={`${sc.peakWip} / 5`} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
            Cost vs Schedule
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            X = indeks durasi (1 cepat → 5 lama) · Y = indeks biaya (1 rendah → 5 tinggi).
          </p>
          <div className="mt-2 h-[240px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Durasi"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: MUTED, fontSize: 11 }}
                  label={{
                    value: "Durasi (indeks 1–5)",
                    position: "insideBottom",
                    offset: -6,
                    fill: MUTED,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="cost"
                  name="Biaya"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: MUTED, fontSize: 11 }}
                  label={{
                    value: "Biaya (indeks 1–5)",
                    angle: -90,
                    position: "insideLeft",
                    fill: MUTED,
                    fontSize: 11,
                  }}
                />
                <ZAxis range={[140, 140]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active: tipOn, payload }) => {
                    if (!tipOn || !payload?.length) return null;
                    const d = payload[0].payload as (typeof scatter)[0];
                    return (
                      <div className="rounded border border-border bg-surface px-2.5 py-1.5 text-xs shadow-sm">
                        <p className="font-medium text-fg">{d.name}</p>
                        <p className="text-muted">
                          Durasi {d.duration}/5 · Biaya {d.cost}/5 · WIP {d.peakWip}/5
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Strategi" data={scatter} isAnimationActive={false}>
                  {scatter.map((p) => (
                    <Cell
                      key={p.id}
                      fill={p.fill}
                      fillOpacity={p.id === active ? 1 : 0.45}
                      stroke={p.id === active ? "#141414" : p.fill}
                      strokeWidth={p.id === active ? 2 : 1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted">
            {CASE_STRATEGIES.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
            Bandingkan tiga indeks (1–5)
          </p>
          <div className="mt-2 h-[200px] w-full sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: MUTED, fontSize: 11 }} width={28} />
                <Tooltip formatter={(v: number, name: string) => [`${v} / 5`, name]} />
                <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Durasi" fill="#64748b" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="Durasi" position="top" fill={MUTED} fontSize={10} />
                </Bar>
                <Bar dataKey="Biaya" fill="#f97316" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  <LabelList dataKey="Biaya" position="top" fill={MUTED} fontSize={10} />
                </Bar>
                <Bar
                  dataKey="WIP puncak"
                  fill="#7c3aed"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList dataKey="WIP puncak" position="top" fill={MUTED} fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ul className="list-disc space-y-1 pl-4 text-[11px] text-muted leading-relaxed">
          <li>
            Indeks relatif: schedule lebih pendek biasanya menaikkan indeks biaya — trade-off, bukan
            ranking tunggal.
          </li>
          <li>
            Memilih strategi = memilih <strong className="text-fg">produk + proses</strong> (tuas 1–2).
            Capacity · Inventory · Variability (tuas 3–5) diuji di Simulasi pada framing Hibrid.
          </li>
          <li>
            Tidak ada strategi universal terbaik: tergantung target owner (cost vs schedule) dan
            kemampuan supply chain.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-border/60 bg-elevated px-2 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-wide text-faint">{k}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-fg">{v}</p>
    </div>
  );
}
