import { useState } from "react";
import {
  DEFAULT_OPS,
  type OpId,
  type OpParams,
  type SolveFor,
  type CalcSnapshot,
  runCalculation,
} from "@/lib/mp2k/ops-science";
import { DesOperatingStrip, useDesOperatingPoint } from "@/components/mp2k/des-operating-strip";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { LittleSection, KingmanSection, InventorySection } from "@/components/mp2k/ops-charts";

type CalcTab = "little" | "kingman" | "inventory";

const CALC_TABS: { id: CalcTab; label: string }[] = [
  { id: "little", label: "Little's Law" },
  { id: "kingman", label: "Kingman" },
  { id: "inventory", label: "Inventory / FR" },
];

export function OpsPanel() {
  const desPoint = useDesOperatingPoint();
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
            Strip di atas = <strong className="font-medium text-fg">titik operasi empiris DES</strong>{" "}
            (notasi &amp; warna sama dengan kurva). Alur ajar: (1) Run DES di Simulasi → (2) klik{" "}
            <strong className="font-medium text-fg">Isi dari DES</strong> agar parameter Analitik
            selaras dengan bottleneck &amp; variability empiris → (3){" "}
            <strong className="font-medium text-fg">Mulai perhitungan</strong>. Marker oranye di
            setiap kurva = posisi DES; titik biru/merah/hitam = prediksi dari parameter yang Anda
            set. Bandingkan keduanya untuk memahami selisih multi-moda vs rumus tertutup.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resetOps}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={seedFromDes} disabled={!desPoint.ready}>
            Isi dari DES
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
            te bottleneck · stations · TH · m · ca/ce · CONWIP — selaraskan dengan DES lewat tombol di
            atas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <NumField label="te bottleneck" unit="TH_max=m/te" value={op.te} min={0.01} step={0.05} onChange={(v) => updateOp({ te: v })} />
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
              desPoint={desPoint}
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
          {calcTab === "kingman" && <KingmanSection snap={snapshot} desPoint={desPoint} />}
          {calcTab === "inventory" && <InventorySection snap={snapshot} desPoint={desPoint} />}
        </div>
      )}

      {!snapshot && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="max-w-md text-sm text-muted leading-relaxed">
              Setelah strip DES terisi (atau setelah mengisi parameter manual), tekan{" "}
              <strong className="text-fg">Mulai perhitungan</strong> untuk menampilkan tiga grafik
              Operations Science. Marker oranye = titik operasi empiris dari DES; bandingkan dengan
              titik prediksi teori untuk diskusi selisih multi-moda, gate tangga, dan transient.
            </p>
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
