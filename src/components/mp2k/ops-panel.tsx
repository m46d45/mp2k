import { useState } from "react";
import {
  DEFAULT_OPS,
  type OpId,
  type OpParams,
  type SolveFor,
  type CalcSnapshot,
  formatNum,
  formatPct,
  runCalculation,
  zFromServiceLevel,
  KINGMAN_V_LEVELS,
} from "@/lib/mp2k/ops-science";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  Legend,
  Area,
} from "recharts";

type CalcTab = "little" | "kingman" | "inventory";

const CALC_TABS: { id: CalcTab; label: string }[] = [
  { id: "little", label: "Little's Law" },
  { id: "kingman", label: "Kingman" },
  { id: "inventory", label: "Inventory / FR" },
];

const GRID = "#e5e7eb";
const MUTED = "#6b7280";

export function OpsPanel() {
  const [ops, setOps] = useState<OpParams[]>(() => DEFAULT_OPS.map((o) => ({ ...o })));
  const [opId, setOpId] = useState<OpId>("system");
  const [calcTab, setCalcTab] = useState<CalcTab>("little");
  const [solveFor, setSolveFor] = useState<SolveFor>("wip");
  const [littleOverride, setLittleOverride] = useState<{ wip: string; th: string; ct: string }>({
    wip: "",
    th: "",
    ct: "",
  });
  const [snapshot, setSnapshot] = useState<CalcSnapshot | null>(null);
  const [dirty, setDirty] = useState(true);

  const op = ops.find((o) => o.id === opId) ?? ops[0];

  function markDirty() {
    setDirty(true);
  }
  function updateOp(patch: Partial<OpParams>) {
    setOps((prev) => prev.map((o) => (o.id === opId ? { ...o, ...patch } : o)));
    markDirty();
  }
  function resetOps() {
    setOps(DEFAULT_OPS.map((o) => ({ ...o })));
    setLittleOverride({ wip: "", th: "", ct: "" });
    setSnapshot(null);
    setDirty(true);
  }
  function startCalculation() {
    setSnapshot(runCalculation(op, solveFor, littleOverride));
    setDirty(false);
    requestAnimationFrame(() => {
      document.getElementById("ops-charts")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Hitung sistem produksi</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted leading-relaxed">
            Parameter dulu → <strong className="font-medium text-fg">Mulai perhitungan</strong>. Tiga
            grafik gaya Parade: WIP–TH–CT, Kingman multi-V, fill rate vs inventory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resetOps}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button size="lg" onClick={startCalculation} className="min-w-[11rem]">
            <Play className="size-4" />
            Mulai perhitungan
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-4 py-3 text-sm text-muted">
          Parameter berubah atau belum dihitung.{" "}
          <button type="button" className="font-medium text-fg underline underline-offset-2" onClick={startCalculation}>
            Mulai perhitungan
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ops.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setOpId(o.id);
              markDirty();
            }}
            className={cn(
              "min-h-11 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-xs sm:text-sm",
              opId === o.id
                ? "border-fg bg-primary text-primary-fg"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            <span className="font-mono text-[10px] opacity-70">{o.mode}</span>
            <span className="mt-0.5 block font-medium">{o.name}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Parameter operasi</CardTitle>
            <Badge variant="default">{op.mode}</Badge>
            {dirty ? <Badge variant="warn">belum dihitung</Badge> : <Badge variant="success">snapshot aktif</Badge>}
          </div>
          <CardDescription>
            te bottleneck · stations (T0=te×stations) · TH · m · ca/ce · CONWIP · CV demand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <NumField label="te bottleneck" unit="→ TH_max=m/te" value={op.te} min={0.01} step={0.05} onChange={(v) => updateOp({ te: v })} />
            <NumField label="stations" unit="T0=te×stations" value={op.stations} min={1} step={1} integer onChange={(v) => updateOp({ stations: v })} />
            <NumField label="TH demand" unit="unit/hari" value={op.th} min={0} step={0.05} onChange={(v) => updateOp({ th: v })} />
            <NumField label="m resource" unit="paralel" value={op.m} min={1} step={1} integer onChange={(v) => updateOp({ m: v })} />
            <NumField label="CONWIP" unit="0=auto W_opt" value={op.conwip} min={0} step={0.5} onChange={(v) => updateOp({ conwip: v })} />
            <NumField label="ca" unit="CV arrival" value={op.ca} min={0} step={0.05} onChange={(v) => updateOp({ ca: v })} />
            <NumField label="ce" unit="CV process" value={op.ce} min={0} step={0.05} onChange={(v) => updateOp({ ce: v })} />
            <NumField label="CV demand" unit="inventory" value={op.demandCv} min={0} step={0.05} onChange={(v) => updateOp({ demandCv: v })} />
            <NumField label="Lead time L" unit="hari" value={op.leadTime} min={0.1} step={0.5} onChange={(v) => updateOp({ leadTime: v })} />
            <NumField label="Service level" unit="Type I" value={op.serviceLevel} min={0.5} max={0.999} step={0.01} onChange={(v) => updateOp({ serviceLevel: v })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" className="min-w-[14rem]" onClick={startCalculation}>
          <Play className="size-4" />
          Mulai perhitungan
        </Button>
      </div>

      {snapshot && (
        <div id="ops-charts" className="space-y-4">
          <div className="border-b border-border">
            <div className="flex gap-0 overflow-x-auto">
              {CALC_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCalcTab(t.id)}
                  className={cn(
                    "min-h-11 shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium",
                    calcTab === t.id ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {calcTab === "little" && (
            <LittleSection
              snap={snapshot}
              solveFor={solveFor}
              setSolveFor={(s) => {
                setSolveFor(s);
                markDirty();
              }}
              override={littleOverride}
              setOverride={(o) => {
                setLittleOverride(o);
                markDirty();
              }}
            />
          )}
          {calcTab === "kingman" && <KingmanSection snap={snapshot} />}
          {calcTab === "inventory" && <InventorySection snap={snapshot} />}
        </div>
      )}

      {!snapshot && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="max-w-md text-sm text-muted">Tekan mulai untuk menampilkan tiga grafik PPM.</p>
            <Button size="lg" onClick={startCalculation}>
              <Play className="size-4" />
              Mulai perhitungan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LittleSection({
  snap,
  solveFor,
  setSolveFor,
  override,
  setOverride,
}: {
  snap: CalcSnapshot;
  solveFor: SolveFor;
  setSolveFor: (s: SolveFor) => void;
  override: { wip: string; th: string; ct: string };
  setOverride: (o: { wip: string; th: string; ct: string }) => void;
}) {
  const { little, wipThCt } = snap;
  const { meta, point, series, note } = wipThCt;

  return (
    <div className="space-y-4">
      <p className="rounded-[var(--radius-sm)] border border-border bg-elevated/60 px-3 py-2 text-sm text-muted leading-relaxed">
        {note}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Little's Law · WIP–TH–CT</CardTitle>
            <CardDescription>
              X=WIP · kiri=TH · kanan=CT · vertikal W_min / W_opt / CONWIP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["wip", "WIP"],
                  ["th", "TH"],
                  ["ct", "CT"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSolveFor(id)}
                  className={cn(
                    "min-h-10 rounded-[var(--radius-sm)] border px-3 text-sm font-medium",
                    solveFor === id
                      ? "border-fg bg-primary text-primary-fg"
                      : "border-border text-muted hover:text-fg",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <OverrideField label="WIP" value={override.wip} placeholder={solveFor === "wip" ? "dihitung" : formatNum(little.wip)} disabled={solveFor === "wip"} onChange={(v) => setOverride({ ...override, wip: v })} />
              <OverrideField label="TH" value={override.th} placeholder={solveFor === "th" ? "dihitung" : formatNum(snap.op.th)} disabled={solveFor === "th"} onChange={(v) => setOverride({ ...override, th: v })} />
              <OverrideField label="CT" value={override.ct} placeholder={solveFor === "ct" ? "dihitung" : formatNum(little.ct)} disabled={solveFor === "ct"} onChange={(v) => setOverride({ ...override, ct: v })} />
            </div>
            <dl className="grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-3">
              <Meta label="TH_max" value={formatNum(meta.TH_max)} />
              <Meta label="T0" value={formatNum(meta.T0)} />
              <Meta label="W_min" value={formatNum(meta.W_min)} />
              <Meta label="W_opt" value={formatNum(meta.W_opt)} />
              <Meta label="CONWIP" value={formatNum(meta.CONWIP)} />
              <Meta label="V" value={formatNum(meta.V)} />
            </dl>
          </CardContent>
        </Card>
        <ResultCard
          title="Hasil Little's Law"
          ok={little.valid}
          rows={[
            { label: "WIP", value: formatNum(little.wip), unit: "unit" },
            { label: "TH", value: formatNum(little.th), unit: "unit/hari" },
            { label: "CT", value: formatNum(little.ct), unit: "hari" },
          ]}
          note={little.note}
          formula="WIP = TH × CT"
        />
      </div>

      <ChartCard
        title={`WIP–TH–CT · W_min=${formatNum(meta.W_min)} · W_opt=${formatNum(meta.W_opt)} · CONWIP=${formatNum(meta.CONWIP)} · operasi WIP=${formatNum(point.wip)}`}
        subtitle="Biru muda TH batas · biru TH aktual · merah muda CT batas · merah putus CT aktual · ungu W_min/W_opt/CONWIP"
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={series} margin={{ top: 28, right: 52, left: 16, bottom: 28 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="wip"
                type="number"
                domain={[0, meta.wipMax]}
                tick={{ fill: MUTED, fontSize: 11 }}
                label={{ value: "WIP (zona)", position: "insideBottom", offset: -12, fill: MUTED, fontSize: 12 }}
              />
              <YAxis
                yAxisId="th"
                tick={{ fill: "#2563eb", fontSize: 11 }}
                domain={[0, "auto"]}
                label={{ value: "Throughput TH", angle: -90, position: "insideLeft", fill: "#2563eb", fontSize: 11 }}
              />
              <YAxis
                yAxisId="ct"
                orientation="right"
                tick={{ fill: "#dc2626", fontSize: 11 }}
                domain={[0, "auto"]}
                label={{ value: "Cycle time CT", angle: 90, position: "insideRight", fill: "#dc2626", fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [formatNum(v), n]} />
              <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: 11 }} />

              <ReferenceLine yAxisId="th" x={meta.W_min} stroke="#16a34a" strokeWidth={1.5} label={{ value: `W_min=${formatNum(meta.W_min)}`, fill: "#16a34a", fontSize: 10, position: "insideTopLeft" }} />
              <ReferenceLine yAxisId="th" x={meta.W_opt} stroke="#ca8a04" strokeDasharray="4 3" strokeWidth={1.25} label={{ value: `W_opt=${formatNum(meta.W_opt)}`, fill: "#ca8a04", fontSize: 10, position: "insideTopLeft" }} />
              <ReferenceLine yAxisId="th" x={meta.CONWIP} stroke="#7c3aed" strokeWidth={2} label={{ value: `CONWIP=${formatNum(meta.CONWIP)}`, fill: "#7c3aed", fontSize: 10, position: "insideTopRight" }} />

              <Line yAxisId="th" type="monotone" dataKey="thBest" name={`TH batas (no var, TH_max=${formatNum(meta.TH_max)})`} stroke="#93c5fd" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="th" type="monotone" dataKey="thVar" name="TH aktual (var)" stroke="#2563eb" strokeWidth={2.75} dot={false} isAnimationActive={false} />
              <Line yAxisId="ct" type="monotone" dataKey="ctBest" name={`CT batas (T0=${formatNum(meta.T0)})`} stroke="#fca5a5" strokeWidth={1.75} dot={false} isAnimationActive={false} />
              <Line yAxisId="ct" type="monotone" dataKey="ctVar" name="CT aktual (var)" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="7 4" dot={false} isAnimationActive={false} />

              <ReferenceDot yAxisId="th" x={point.wip} y={point.th} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
              <ReferenceDot yAxisId="ct" x={point.wip} y={point.ct} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 font-mono text-[11px] text-faint">
          W_min=TH_max×T0={formatNum(meta.W_min)} · W_opt={formatNum(meta.W_opt)} · CONWIP={formatNum(meta.CONWIP)} ·
          TH_max={formatNum(meta.TH_max)} · T0={formatNum(meta.T0)} · stations={meta.stations} · V={formatNum(meta.V)}
        </p>
      </ChartCard>
    </div>
  );
}

function KingmanSection({ snap }: { snap: CalcSnapshot }) {
  const { kingman, kingmanChart, op } = snap;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kingman · CT vs utilisasi (VUT)</CardTitle>
            <CardDescription>V = 0 · 0,125 · 0,25 · 0,5 · 1,0 — hockey-stick Parade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 font-mono text-xs text-muted">
            <p className="text-fg">
              {op.name}: te={formatNum(op.te)} · TH={formatNum(op.th)} · m={op.m}
            </p>
            <p>
              V operasi={formatNum(kingmanChart.Vop)} · ū={formatPct(kingman.u)}
            </p>
            <p>CT/te = 1 + V · ū/(1−ū)</p>
          </CardContent>
        </Card>
        <ResultCard
          title="Hasil Kingman"
          ok={kingman.valid}
          warn={kingman.bottleneck}
          rows={[
            { label: "Utilisasi ū", value: formatPct(kingman.u), unit: "" },
            { label: "V", value: formatNum(kingman.v), unit: "" },
            { label: "CTq", value: formatNum(kingman.ctq), unit: "hari" },
            { label: "CT", value: formatNum(kingman.ct), unit: "hari" },
            { label: "CT / te", value: formatNum(kingmanChart.point.ctRatio), unit: "×" },
            { label: "WIP", value: formatNum(kingman.wip), unit: "unit" },
          ]}
          note={kingman.note}
          formula="CT/te = 1 + V·ū/(1−ū)"
        />
      </div>

      <ChartCard
        title="Kingman: CT vs utilisasi (kurva VUT)"
        subtitle="V=0 datar · V lebih besar → CT naik lebih cepat · ujung kurva terputus (tidak disambung di puncak)"
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={kingmanChart.series} margin={{ top: 24, right: 24, left: 16, bottom: 28 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="u"
                type="number"
                domain={[0, 1]}
                ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                tick={{ fill: MUTED, fontSize: 11 }}
                label={{ value: "Utilisasi gabungan ū", position: "insideBottom", offset: -12, fill: MUTED, fontSize: 12 }}
              />
              <YAxis
                domain={[0, kingmanChart.yMax]}
                tick={{ fill: MUTED, fontSize: 11 }}
                label={{ value: "Cycle time Kingman (CT/te)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [formatNum(v), n]} labelFormatter={(l) => `ū=${formatNum(Number(l), 3)}`} />
              <Legend verticalAlign="top" height={44} wrapperStyle={{ fontSize: 11 }} />
              {KINGMAN_V_LEVELS.map((lv) => (
                <Line
                  key={lv.key}
                  type="monotone"
                  dataKey={lv.key}
                  name={lv.label}
                  stroke={lv.color}
                  strokeWidth={lv.v === 0 ? 1.5 : 2.25}
                  strokeDasharray={lv.v === 0 ? "6 4" : undefined}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
              <ReferenceDot x={kingmanChart.point.u} y={kingmanChart.point.ctRatio} r={7} fill="#111" stroke="#fff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] text-faint">
          Titik operasi: ū={formatPct(kingmanChart.point.u)}, V≈{formatNum(kingmanChart.Vop)}, CT/te=
          {formatNum(kingmanChart.point.ctRatio)}
        </p>
      </ChartCard>
    </div>
  );
}

function InventorySection({ snap }: { snap: CalcSnapshot }) {
  const { inv, invChart, op } = snap;
  const z = zFromServiceLevel(op.serviceLevel);
  const plotData = invChart.series.filter((p) => p.fr >= 70);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fill rate vs inventory</CardTitle>
            <CardDescription>Tradeoff service–persediaan (base-stock) · X=FR · Y=inventory</CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-xs text-muted">
            <p className="text-fg">
              z≈{formatNum(z)} · SL {formatPct(op.serviceLevel)} · CV={formatNum(op.demandCv)}
            </p>
          </CardContent>
        </Card>
        <ResultCard
          title="Hasil Inventory / FR"
          ok={inv.valid}
          rows={[
            { label: "DDLT", value: formatNum(inv.ddlt), unit: "unit" },
            { label: "Safety stock", value: formatNum(inv.safetyStock), unit: "unit" },
            { label: "Base stock S", value: formatNum(inv.baseStock), unit: "unit" },
            { label: "Fill rate", value: formatPct(inv.fillRate), unit: "Type II" },
            { label: "Avg inventory", value: formatNum(inv.avgInventory), unit: "unit" },
            { label: "Turns", value: formatNum(inv.turns), unit: "per hari" },
          ]}
          note={inv.note}
          formula="SS = z·σ√L · FR ≈ 1 − ES/DDLT"
        />
      </div>

      <ChartCard
        title="Fill rate vs inventory (tradeoff service–persediaan)"
        subtitle="Kurva teoritis base-stock · titik hitam = sistem · B1–B4 buffer scenarios"
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={plotData} margin={{ top: 24, right: 24, left: 16, bottom: 28 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="fr"
                type="number"
                domain={[70, 105]}
                tick={{ fill: MUTED, fontSize: 11 }}
                label={{ value: "Fill rate (%)", position: "insideBottom", offset: -12, fill: MUTED, fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 11 }}
                label={{ value: "Inventory / WIP buffer", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [formatNum(v), n]} labelFormatter={(l) => `FR=${formatNum(Number(l))}%`} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="inv"
                name="Kurva teoritis (base-stock)"
                stroke="#0f766e"
                fill="#0f766e22"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceDot
                x={Math.min(104, Math.max(70, invChart.point.fr))}
                y={invChart.point.inv}
                r={7}
                fill="#111"
                stroke="#fff"
                strokeWidth={2}
              />
              {invChart.buffers.map((b, i) => {
                const colors = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];
                return (
                  <ReferenceDot
                    key={b.id}
                    x={Math.min(104, Math.max(70, b.fr))}
                    y={b.inv}
                    r={5}
                    fill={colors[i]}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] text-faint">
          Sistem FR={formatPct(inv.fillRate)}, Ī={formatNum(inv.avgInventory)} · B1–B4 pada z=0.5 / 1 / 1.5 / 2.0
        </p>
      </ChartCard>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-faint">{label}</dt>
      <dd className="font-semibold text-fg">{value}</dd>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 12,
  color: "#111",
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function NumField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  integer,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-fg">{label}</span>
      <input
        type="number"
        className="h-10 rounded-[var(--radius-sm)] border border-border bg-bg px-3 font-mono text-sm text-fg tabular-nums outline-none focus:border-fg"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          if (!Number.isFinite(raw)) return;
          let v = integer ? Math.round(raw) : raw;
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }}
      />
      <span className="text-[10px] text-faint">{unit}</span>
    </label>
  );
}

function OverrideField({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-fg">{label}</span>
      <input
        type="number"
        disabled={disabled}
        className={cn(
          "h-10 rounded-[var(--radius-sm)] border border-border bg-bg px-3 font-mono text-sm tabular-nums outline-none focus:border-fg",
          disabled ? "text-faint" : "text-fg",
        )}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ResultCard({
  title,
  rows,
  note,
  formula,
  ok,
  warn,
}: {
  title: string;
  rows: { label: string; value: string; unit: string }[];
  note: string;
  formula: string;
  ok: boolean;
  warn?: boolean;
}) {
  return (
    <Card className={cn(!ok && "border-fg/40")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={ok ? (warn ? "warn" : "success") : "default"}>
            {ok ? (warn ? "u tinggi" : "OK") : "cek input"}
          </Badge>
        </div>
        <CardDescription className="font-mono text-xs">{formula}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
              <dt className="text-sm text-muted">{r.label}</dt>
              <dd className="text-right font-mono text-sm font-semibold tabular-nums text-fg">
                {r.value}
                {r.unit ? <span className="ml-1 text-xs font-normal text-faint">{r.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted leading-relaxed">{note}</p>
      </CardContent>
    </Card>
  );
}
