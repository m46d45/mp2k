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
import { formatNum } from "@/lib/mp2k/ops-science";

/**
 * Feature B — Costs & Schedules based Production Strategies (konseptual).
 * Angka given, bukan hasil Run DES. Tiga paket produk+proses untuk trade-off.
 */

export type StrategyId = "tradisional" | "hibrid" | "industri";

export type ProductionStrategy = {
  id: StrategyId;
  label: string;
  short: string;
  /** Product + process framing */
  product: string;
  process: string;
  moda: string;
  /** Schedule — hari lab struktur (given) */
  duration: number;
  /** Cost index, Dasar tradisional = 100 */
  cost: number;
  /** Peak WIP (given, unit job) */
  peakWip: number;
  note: string;
  color: string;
};

/** Angka given untuk perbandingan — bukan output engine. */
export const CASE_STRATEGIES: ProductionStrategy[] = [
  {
    id: "tradisional",
    label: "Tradisional",
    short: "M-dominan",
    product: "Hampir semua elemen dicor di lokasi",
    process: "Sekuensial per zona; sedikit prerabrikasi",
    moda: "M >> N, F",
    duration: 28,
    cost: 100,
    peakWip: 18,
    note: "Schedule lebih panjang; biaya material relatif rendah, tenaga site dan CT tinggi.",
    color: "#64748b",
  },
  {
    id: "hibrid",
    label: "Hibrid",
    short: "M + N + F",
    product: "Kolom site · balok near-site · panel far-supply",
    process: "Gelombang zona; tiga moda harus match di workface",
    moda: "M · N · F",
    duration: 18,
    cost: 112,
    peakWip: 12,
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
    duration: 12,
    cost: 130,
    peakWip: 8,
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
          Tiga paket <strong className="text-fg">produk + proses</strong> (given) — bukan hasil Run
          DES. Owner melihat cost & schedule; builder memilih sistem produksi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-elevated px-3 py-2 text-[11px] text-muted leading-relaxed">
          Angka konseptual untuk pembelajaran (indeks biaya: Tradisional = 100). Tidak dihitung dari
          engine lab. Strategi <strong className="text-fg">Hibrid</strong> ≈ framing kasus Simulasi.
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
                  {s.duration} hari · biaya {s.cost}
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
            <Metric k="Durasi" v={`${formatNum(sc.duration)} hari`} />
            <Metric k="Biaya" v={formatNum(sc.cost)} />
            <Metric k="WIP puncak" v={formatNum(sc.peakWip)} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
            Cost vs Schedule
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            X = durasi (hari) · Y = indeks biaya. Tidak ada satu titik terbaik — ada trade-off.
          </p>
          <div className="mt-2 h-[240px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Durasi"
                  domain={[8, 32]}
                  tick={{ fill: MUTED, fontSize: 11 }}
                  label={{
                    value: "Durasi (hari)",
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
                  domain={[90, 140]}
                  tick={{ fill: MUTED, fontSize: 11 }}
                  label={{
                    value: "Biaya (indeks)",
                    angle: -90,
                    position: "insideLeft",
                    fill: MUTED,
                    fontSize: 11,
                  }}
                />
                <ZAxis range={[120, 120]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active: tipOn, payload }) => {
                    if (!tipOn || !payload?.length) return null;
                    const d = payload[0].payload as (typeof scatter)[0];
                    return (
                      <div className="rounded border border-border bg-surface px-2.5 py-1.5 text-xs shadow-sm">
                        <p className="font-medium text-fg">{d.name}</p>
                        <p className="text-muted">
                          Durasi {formatNum(d.duration)} hari · Biaya {formatNum(d.cost)} · WIP{" "}
                          {formatNum(d.peakWip)}
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
            Bandingkan tiga metrik
          </p>
          <div className="mt-2 h-[200px] w-full sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} width={32} />
                <Tooltip formatter={(v: number, name: string) => [formatNum(v), name]} />
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
            Schedule yang lebih pendek biasanya menggeser biaya (material, logistik, prerabrikasi) —
            bukan gratis.
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
