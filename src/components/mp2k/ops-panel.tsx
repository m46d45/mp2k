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
  KINGMAN_V_LEVELS,
} from "@/lib/mp2k/ops-science";
import { DES_METRIC_COLORS } from "@/lib/mp2k/des/operating-point";
import { DesOperatingStrip, useDesOperatingPoint } from "@/components/mp2k/des-operating-strip";
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

type CalcTab = "little" | "kingman" | "inventory" | "operating";
const CALC_TABS: { id: CalcTab; label: string }[] = [
  { id: "little", label: "Little's Law" },
  { id: "kingman", label: "Kingman" },
  { id: "inventory", label: "Inventory / FR" },
  { id: "operating", label: "Kurva gabungan & CONWIP" },
];
const GRID = "#e5e7eb";
const MUTED = "#6b7280";

export function OpsPanel() {
  const desPoint = useDesOperatingPoint();
  const [ops, setOps] = useState<OpParams[]>(() => DEFAULT_OPS.map((o) => ({ ...o })));
  const [opId, setOpId] = useState<OpId>("system");
  const [calcTab, setCalcTab] = useState<CalcTab>("little");
  const [solveFor] = useState<SolveFor>("wip");
  const [littleOverride, setLittleOverride] = useState({ wip: "", th: "", ct: "" });
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
  function seedFromDes() {
    if (!desPoint.ready) return;
    const p = desPoint.params;
    setOps((prev) =>
      prev.map((o) =>
        o.id === "system"
          ? {
              ...o,
              te: desPoint.teBot,
              th: Math.max(desPoint.th, 0.01),
              m: desPoint.mBot,
              stations: 3,
              ca: p.ca,
              ce: p.ce,
              demandCv: Math.max(p.ca, p.ce, 0.2),
              leadTime: p.panelLeadTime,
              conwip: p.conwip,
              serviceLevel: 0.95,
            }
          : o,
      ),
    );
    setOpId("system");
    setLittleOverride({
      wip: String(Number(desPoint.wip.toFixed(3))),
      th: String(Number(desPoint.th.toFixed(3))),
      ct: String(Number(desPoint.ct.toFixed(3))),
    });
    setDirty(true);
  }

  return (
    <div className="space-y-5">
      <DesOperatingStrip variant="full" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Hitung sistem produksi</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted leading-relaxed">
            Alur: Run DES → <strong className="text-fg">Isi dari DES</strong> →{" "}
            <strong className="text-fg">Mulai perhitungan</strong>. Marker oranye = posisi DES.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resetOps}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={seedFromDes} disabled={!desPoint.ready}>
            Isi dari DES
          </Button>
          <Button size="lg" onClick={startCalculation} className="min-w-[11rem]">
            <Play className="size-4" /> Mulai perhitungan
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
              opId === o.id ? "border-fg bg-primary text-primary-fg" : "border-border bg-surface text-muted hover:text-fg",
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
            {dirty ? <Badge variant="warn">belum dihitung</Badge> : <Badge variant="success">sudah dihitung</Badge>}
          </div>
          <CardDescription>te · stations · TH · m · ca/ce · CONWIP — selaraskan dengan DES</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <NumField label="te bottleneck" unit="TH_max=m/te" value={op.te} min={0.01} step={0.05} onChange={(v) => updateOp({ te: v })} />
            <NumField label="stations" unit="T0=te×stations" value={op.stations} min={1} step={1} integer onChange={(v) => updateOp({ stations: v })} />
            <NumField label="TH demand" unit="unit/hari" value={op.th} min={0} step={0.05} onChange={(v) => updateOp({ th: v })} />
            <NumField label="m resource" unit="paralel" value={op.m} min={1} step={1} integer onChange={(v) => updateOp({ m: v })} />
            <NumField label="CONWIP" unit="0=auto W_opt" value={op.conwip} min={0} step={0.5} onChange={(v) => updateOp({ conwip: v })} />
            <NumField label="ca" unit="CV kedatangan" value={op.ca} min={0} step={0.05} onChange={(v) => updateOp({ ca: v })} />
            <NumField label="ce" unit="CV proses" value={op.ce} min={0} step={0.05} onChange={(v) => updateOp({ ce: v })} />
            <NumField label="CV demand" unit="inventory" value={op.demandCv} min={0} step={0.05} onChange={(v) => updateOp({ demandCv: v })} />
            <NumField label="Lead time L" unit="hari" value={op.leadTime} min={0.1} step={0.5} onChange={(v) => updateOp({ leadTime: v })} />
            <NumField label="Service level" unit="Type I" value={op.serviceLevel} min={0.5} max={0.999} step={0.01} onChange={(v) => updateOp({ serviceLevel: v })} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button size="lg" className="min-w-[14rem]" onClick={startCalculation}>
          <Play className="size-4" /> Mulai perhitungan
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
          {calcTab === "little" && <LittleChart snap={snapshot} desPoint={desPoint} />}
          {calcTab === "kingman" && <KingmanChart snap={snapshot} desPoint={desPoint} />}
          {calcTab === "inventory" && <InventoryChart snap={snapshot} desPoint={desPoint} />}
          {calcTab === "operating" && <OperatingConwipChart snap={snapshot} desPoint={desPoint} />}
        </div>
      )}
      {!snapshot && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="max-w-md text-sm text-muted leading-relaxed">
              Tekan <strong className="text-fg">Mulai perhitungan</strong> untuk empat grafik (termasuk Kurva gabungan & CONWIP).
            </p>
            <Button size="lg" onClick={startCalculation}>
              <Play className="size-4" /> Mulai perhitungan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type DesPt = ReturnType<typeof useDesOperatingPoint>;

function LittleChart({ snap, desPoint }: { snap: CalcSnapshot; desPoint: DesPt }) {
  const { little, wipThCt } = snap;
  const { meta, point, series, note } = wipThCt;
  return (
    <div className="space-y-3">
      <p className="rounded-[var(--radius-sm)] border border-border bg-elevated/60 px-3 py-2 text-sm text-muted">{note}</p>
      <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs">
        <div>WIP={formatNum(little.wip)}</div>
        <div>TH={formatNum(little.th)}</div>
        <div>CT={formatNum(little.ct)}</div>
      </div>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={series} margin={{ top: 20, right: 40, left: 10, bottom: 24 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="wip" type="number" domain={[0, meta.wipMax]} tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "WIP", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 12 }} />
            <YAxis yAxisId="th" tick={{ fill: DES_METRIC_COLORS.th, fontSize: 11 }} domain={[0, "auto"]} />
            <YAxis yAxisId="ct" orientation="right" tick={{ fill: DES_METRIC_COLORS.ct, fontSize: 11 }} domain={[0, "auto"]} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="th" x={meta.W_min} stroke="#16a34a" strokeWidth={1.5} />
            <ReferenceLine yAxisId="th" x={meta.W_opt} stroke="#ca8a04" strokeDasharray="4 3" />
            <ReferenceLine yAxisId="th" x={meta.CONWIP} stroke={DES_METRIC_COLORS.wip} strokeWidth={2} />
            <Line yAxisId="th" type="monotone" dataKey="thBest" name="TH batas" stroke="#93c5fd" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="th" type="monotone" dataKey="thVar" name="TH aktual" stroke={DES_METRIC_COLORS.th} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctBest" name="CT batas" stroke="#fca5a5" strokeWidth={1.75} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctVar" name="CT aktual" stroke={DES_METRIC_COLORS.ct} strokeWidth={2.5} strokeDasharray="7 4" dot={false} isAnimationActive={false} />
            <ReferenceDot yAxisId="th" x={point.wip} y={point.th} r={6} fill={DES_METRIC_COLORS.th} stroke="#fff" strokeWidth={2} />
            <ReferenceDot yAxisId="ct" x={point.wip} y={point.ct} r={6} fill={DES_METRIC_COLORS.ct} stroke="#fff" strokeWidth={2} />
            {desPoint.ready ? (
              <>
                <ReferenceDot yAxisId="th" x={Math.min(meta.wipMax, Math.max(0, desPoint.wip))} y={desPoint.th} r={7} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
                <ReferenceDot yAxisId="ct" x={Math.min(meta.wipMax, Math.max(0, desPoint.wip))} y={desPoint.ct} r={7} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
              </>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KingmanChart({ snap, desPoint }: { snap: CalcSnapshot; desPoint: DesPt }) {
  const { kingman, kingmanChart, op } = snap;
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-muted">
        {op.name}: te={formatNum(op.te)} · ū={formatPct(kingman.u)} · V={formatNum(kingmanChart.Vop)}
      </p>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={kingmanChart.series} margin={{ top: 20, right: 20, left: 10, bottom: 24 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="u" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "ū", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 12 }} />
            <YAxis domain={[0, kingmanChart.yMax]} tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "CT/te", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: 11 }} />
            {KINGMAN_V_LEVELS.map((lv) => (
              <Line key={lv.key} type="monotone" dataKey={lv.key} name={lv.label} stroke={lv.color} strokeWidth={lv.v === 0 ? 1.5 : 2.25} strokeDasharray={lv.v === 0 ? "6 4" : undefined} dot={false} connectNulls={false} isAnimationActive={false} />
            ))}
            <ReferenceDot x={kingmanChart.point.u} y={kingmanChart.point.ctRatio} r={7} fill="#111" stroke="#fff" strokeWidth={2} />
            {desPoint.ready ? (
              <ReferenceDot x={Math.min(0.99, Math.max(0.01, desPoint.utilBot))} y={Math.min(kingmanChart.yMax, Math.max(1, desPoint.ctRatioBot))} r={7} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InventoryChart({ snap, desPoint }: { snap: CalcSnapshot; desPoint: DesPt }) {
  const { inv, invChart } = snap;
  const plotData = invChart.series.filter((p) => p.fr >= 70);
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-muted">FR teori={formatPct(inv.fillRate)} · Ī={formatNum(inv.avgInventory)}</p>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={plotData} margin={{ top: 20, right: 20, left: 10, bottom: 24 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="fr" type="number" domain={[70, 105]} tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "Fill rate (%)", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 12 }} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "Inventory", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="inv" name="Kurva teori" stroke={DES_METRIC_COLORS.fr} fill="#0f766e22" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <ReferenceDot x={Math.min(104, Math.max(70, invChart.point.fr))} y={invChart.point.inv} r={7} fill="#111" stroke="#fff" strokeWidth={2} />
            {desPoint.ready ? (
              <ReferenceDot x={Math.min(104, Math.max(70, desPoint.fillRate * 100))} y={desPoint.invProxy} r={7} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OperatingConwipChart({ snap, desPoint }: { snap: CalcSnapshot; desPoint: DesPt }) {
  const { wipThCt } = snap;
  const { meta, point, series, note } = wipThCt;
  const desConwip = desPoint.ready ? desPoint.params.conwip : meta.CONWIP;
  const zone =
    desPoint.ready && desPoint.wip < meta.W_min * 0.85
      ? "Di bawah W0 — sistem lapar; naikkan CONWIP."
      : desPoint.ready && desPoint.wip > meta.W_opt * 1.25
        ? "Jauh di atas Wopt — CONWIP longgar, CT membengkak."
        : "Zona seimbang (W0 … Wopt).";
  return (
    <div className="space-y-3">
      <p className="rounded-[var(--radius-sm)] border border-border bg-elevated/60 px-3 py-2 text-sm text-muted leading-relaxed">
        <strong className="text-fg">Kurva gabungan</strong> dari hasil run: X=WIP, Y kiri=TH, Y kanan=CT.
        Garis ungu = CONWIP. Titik oranye = DES empiris.{note ? ` ${note}` : ""}
      </p>
      <div className="grid gap-2 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[10px] uppercase text-faint">W0</p>
          <p className="text-base font-semibold">{formatNum(meta.W_min)}</p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[10px] uppercase text-faint">Wopt</p>
          <p className="text-base font-semibold">{formatNum(meta.W_opt)}</p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[10px] uppercase text-faint">CONWIP param</p>
          <p className="text-base font-semibold">{formatNum(meta.CONWIP)}</p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[10px] uppercase text-faint">CONWIP DES</p>
          <p className="text-base font-semibold">{formatNum(desConwip)}</p>
        </div>
      </div>
      {!desPoint.ready ? (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-elevated/40 px-3 py-2 text-sm text-muted">
          Belum ada run DES. Jalankan <strong className="text-fg">Simulasi → Run all</strong>, lalu{" "}
          <strong className="text-fg">Isi dari DES</strong> + <strong className="text-fg">Mulai perhitungan</strong>.
        </p>
      ) : null}
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={series} margin={{ top: 20, right: 40, left: 10, bottom: 24 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="wip" type="number" domain={[0, meta.wipMax]} tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "WIP", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 12 }} />
            <YAxis yAxisId="th" tick={{ fill: DES_METRIC_COLORS.th, fontSize: 11 }} domain={[0, "auto"]} label={{ value: "TH", angle: -90, position: "insideLeft", fill: DES_METRIC_COLORS.th, fontSize: 11 }} />
            <YAxis yAxisId="ct" orientation="right" tick={{ fill: DES_METRIC_COLORS.ct, fontSize: 11 }} domain={[0, "auto"]} label={{ value: "CT", angle: 90, position: "insideRight", fill: DES_METRIC_COLORS.ct, fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="th" x={meta.W_min} stroke="#16a34a" strokeWidth={1.5} label={{ value: "W0", position: "top", fill: "#16a34a", fontSize: 11 }} />
            <ReferenceLine yAxisId="th" x={meta.W_opt} stroke="#ca8a04" strokeDasharray="4 3" label={{ value: "Wopt", position: "insideTopRight", fill: "#ca8a04", fontSize: 10 }} />
            <ReferenceLine yAxisId="th" x={meta.CONWIP} stroke={DES_METRIC_COLORS.wip} strokeWidth={2} label={{ value: "CONWIP", position: "insideTopLeft", fill: DES_METRIC_COLORS.wip, fontSize: 11 }} />
            <Line yAxisId="th" type="monotone" dataKey="thBest" name="TH batas" stroke="#93c5fd" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="th" type="monotone" dataKey="thVar" name="TH aktual" stroke={DES_METRIC_COLORS.th} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctBest" name="CT batas" stroke="#fca5a5" strokeWidth={1.75} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctVar" name="CT aktual" stroke={DES_METRIC_COLORS.ct} strokeWidth={2.5} strokeDasharray="7 4" dot={false} isAnimationActive={false} />
            <ReferenceDot yAxisId="th" x={point.wip} y={point.th} r={6} fill={DES_METRIC_COLORS.th} stroke="#fff" strokeWidth={2} />
            <ReferenceDot yAxisId="ct" x={point.wip} y={point.ct} r={6} fill={DES_METRIC_COLORS.ct} stroke="#fff" strokeWidth={2} />
            {desPoint.ready ? (
              <>
                <ReferenceDot yAxisId="th" x={Math.min(meta.wipMax, Math.max(0, desPoint.wip))} y={desPoint.th} r={8} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
                <ReferenceDot yAxisId="ct" x={Math.min(meta.wipMax, Math.max(0, desPoint.wip))} y={desPoint.ct} r={8} fill={DES_METRIC_COLORS.des} stroke="#fff" strokeWidth={2} />
              </>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {desPoint.ready ? (
        <p className="text-[11px] leading-relaxed" style={{ color: DES_METRIC_COLORS.des }}>
          Titik oranye DES: WIP={formatNum(desPoint.wip)}, TH={formatNum(desPoint.th)}, CT={formatNum(desPoint.ct)},
          CONWIP={formatNum(desConwip)}. {zone}
        </p>
      ) : null}
      <p className="text-xs text-muted leading-relaxed">
        <strong className="text-fg">Control</strong>: CONWIP membatasi WIP di DES. Bandingkan titik empiris vs W0/Wopt,
        lalu ubah CONWIP di tuas Inventory Simulasi dan hitung ulang.
      </p>
    </div>
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
