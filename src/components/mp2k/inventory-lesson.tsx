import { useMemo, useState } from "react";
import {
  INTRO_CURVES,
  INV_SCENARIOS,
  INV_BASE,
  formatNum,
  invCurve,
  invPoint,
  invFixedStockPoint,
  DEMO_COLORS,
  type InvApply,
} from "@/lib/mp2k/intro-lessons";
import {
  LessonShell,
  ScenarioButtons,
  IdentityRow,
  Say,
} from "@/components/mp2k/intro-shared";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = DEMO_COLORS.operating;

export function InventoryLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext?: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = INV_SCENARIOS.find((s) => s.id === active);
  const apply: InvApply = sc?.apply ?? {
    leadTime: INV_BASE.leadTime,
    demandCv: INV_BASE.demandCv,
    z: INV_BASE.z,
  };
  const ready = INV_SCENARIOS.every((s) => seen.includes(s.id));
  const curveData = useMemo(
    () => invCurve(apply.leadTime, apply.demandCv),
    [apply.leadTime, apply.demandCv],
  );
  const basePt = useMemo(
    () => invPoint(INV_BASE.leadTime, INV_BASE.demandCv, INV_BASE.z),
    [],
  );
  const pt = useMemo(() => {
    if (sc?.apply.multiples) return invPoint(apply.leadTime, apply.demandCv, apply.z);
    if (sc && (apply.leadTime !== INV_BASE.leadTime || apply.demandCv !== INV_BASE.demandCv))
      return invFixedStockPoint(apply.leadTime, apply.demandCv);
    return invPoint(apply.leadTime, apply.demandCv, apply.z);
  }, [sc, apply]);
  const showBase = !!sc && (pt.inv !== basePt.inv || Math.abs(pt.fr - basePt.fr) > 0.5);

  return (
    <LessonShell
      kicker="Inventory & Fill Rate"
      question={INTRO_CURVES[2].question}
      ready={ready}
      formula={
        <div className="space-y-3">
          <p className="font-mono text-base">
            <span className="font-semibold">FR</span> ≈ 1 − ES / DDLT
          </p>
          <p className="text-xs text-muted leading-relaxed">
            ES = expected shortfall, DDLT = demand during lead time.{" "}
            <span className="text-fg font-medium">Stock buffer</span> (safety stock) = z · σ√L.
            Lead time sendiri bisa berisi <span className="text-fg font-medium">time buffer</span>.
          </p>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5">
              <span className="font-semibold text-fg">Capacity buffer</span>
              <span className="text-muted"> — utilisasi di bawah 100% (lihat Kingman)</span>
            </div>
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5">
              <span className="font-semibold text-fg">Time buffer</span>
              <span className="text-muted"> — slack jadwal / padding lead time</span>
            </div>
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5">
              <span className="font-semibold text-fg">Stock buffer</span>
              <span className="text-muted"> — WIP, safety stock di staging</span>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Inventory di grafik = cycle stock + stock buffer. Target FR tinggi (mis. 95%) butuh buffer lebih besar,
            tapi dengan diminishing returns. Ketiga jenis buffer saling bisa ditukar menghadapi variability yang sama.
          </p>
        </div>
      }
      reverse="Kalau lawannya: buffer turun — FR jatuh, terutama di ekor kiri."
      onNext={onNext}
      nextLabel="Lanjut ke Control & CONWIP"
    >
      <ScenarioButtons
        items={INV_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
        active={active}
        seen={seen}
        onPick={(id) => {
          setActive(id);
          onSee(id);
        }}
      />
      {sc ? (
        <Say>
          {sc.say}{" "}
          <span className="font-mono text-fg">Inv≈{formatNum(pt.inv)} · FR={formatNum(pt.fr)}%</span>
        </Say>
      ) : (
        <p className="text-sm text-muted">
          Acuan: Inv≈{formatNum(basePt.inv)} · FR={formatNum(basePt.fr)}%. Pilih satu if-then.
        </p>
      )}
      <IdentityRow items={[["Inv", pt.inv], ["FR %", pt.fr], ["L", apply.leadTime]]} />
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curveData} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="fr"
              type="number"
              domain={[50, 100]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "Fill Rate %", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              dataKey="inv"
              type="number"
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "Inventory", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip formatter={(v: number, name: string) => [formatNum(v), name === "inv" ? "Inv" : "FR%"]} />
            <Line type="monotone" dataKey="inv" name="Inv" stroke="#2563eb" strokeWidth={2.25} dot={false} isAnimationActive={false} />
            {showBase ? (
              <ReferenceDot x={basePt.fr} y={basePt.inv} r={6} fill={DEMO_COLORS.baseFill} stroke={ORANGE} strokeWidth={2} />
            ) : null}
            <ReferenceDot
              x={Math.min(100, Math.max(50, pt.fr))}
              y={Math.max(0, pt.inv)}
              r={7}
              fill={ORANGE}
              stroke="#fff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted">
        X = Fill Rate, Y = Inventory. Titik <strong style={{ color: ORANGE }}>oranye</strong> = operating.
      </p>
    </LessonShell>
  );
}
