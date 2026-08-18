import { useMemo, useState, type ReactNode } from "react";
import {
  INTRO_CURVES,
  INV_SCENARIOS,
  INV_Z_STEPS,
  INV_BASE,
  KINGMAN_BASE,
  KINGMAN_SCENARIOS,
  KINGMAN_V_LEVELS,
  KINGMAN_Y_MAX,
  LITTLE_ATTEMPT,
  LITTLE_BASE,
  LITTLE_SCENARIOS,
  formatKingman,
  formatNum,
  formatPct,
  formatTriple,
  invCurve,
  invPoint,
  invFixedStockPoint,
  kingmanFrom,
  littleLine,
  type IntroCurve,
  type InvApply,
  type KingmanPoint,
  type LittlePoint,
} from "@/lib/mp2k/intro-lessons";
import { buildKingmanChart } from "@/lib/mp2k/ops-science";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
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
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const POINT = "#141414";

type Props = {
  onOpenLab: () => void;
};

export function IntroPanel({ onOpenLab }: Props) {
  const [curve, setCurve] = useState<IntroCurve>("little");
  const [done, setDone] = useState<Record<IntroCurve, string[]>>({
    little: [],
    kingman: [],
    inventory: [],
  });

  function mark(id: IntroCurve, sid: string) {
    setDone((prev) =>
      prev[id].includes(sid) ? prev : { ...prev, [id]: [...prev[id], sid] },
    );
  }

  const allFormulas = INTRO_CURVES.every((c) => formulaReady(c.id, done[c.id]));

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          Putaran 1 · Pengenalan
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Tiga kurva</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Rumus ditampilkan dari awal agar kaitan if–then dengan persamaan jelas.
          Ramalkan arah sebelum menekan tombol. Belum ada denah — itu putaran berikutnya.
        </p>
      </div>

      <nav
        aria-label="Tiga kurva"
        className="grid grid-cols-3 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1"
      >
        {INTRO_CURVES.map((c) => {
          const ready = formulaReady(c.id, done[c.id]);
          const active = curve === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurve(c.id)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-1 py-2 sm:flex-row sm:gap-2 sm:px-3",
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
              <span className="text-sm font-medium">{c.label}</span>
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
        />
      )}

      {allFormulas ? (
        <BridgeCard onOpenLab={onOpenLab} />
      ) : (
        <p className="text-xs text-faint">
          Setelah ketiga skenario dijelajahi, jembatan ke kasus muncul di sini.
        </p>
      )}
    </div>
  );
}

function formulaReady(id: IntroCurve, seen: string[]): boolean {
  const need =
    id === "little" ? LITTLE_SCENARIOS : id === "kingman" ? KINGMAN_SCENARIOS : INV_SCENARIOS;
  return need.every((s) => seen.includes(s.id));
}

function LittleLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = LITTLE_SCENARIOS.find((s) => s.id === active);
  const point: LittlePoint = sc?.apply ?? LITTLE_BASE;
  const broken = sc ? !sc.valid : false;
  const line = useMemo(() => littleLine(point.th), [point.th]);
  const baseLine = useMemo(() => littleLine(LITTLE_BASE.th), []);
  const ready = formulaReady("little", seen);

  return (
    <LessonShell
      kicker="Little"
      question={INTRO_CURVES[0].question}
      ready={ready}
      formula={
        <>
          <p>WIP = TH × CT</p>
          <p className="text-muted">TH = WIP / CT · CT = WIP / TH — susunan yang sama.</p>
        </>
      }
      reverse="Kalau lawannya: WIP turun (TH tetap) — CT harus turun."
      onNext={onNext}
      nextLabel="Lanjut ke Kingman"
    >
      <IdentityRow
        items={[
          ["WIP", point.wip],
          ["TH", point.th],
          ["CT", point.ct],
        ]}
        product={`${formatNum(point.th)} × ${formatNum(point.ct)} = ${formatNum(point.th * point.ct)}`}
        broken={broken}
      />

      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={line} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="wip"
              type="number"
              domain={[0, 20]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "WIP", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "CT", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip formatter={(v: number) => formatNum(v)} />
            <Line
              data={baseLine}
              type="linear"
              dataKey="ct"
              name="TH = 2"
              stroke="#c4c4c4"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="ct"
              name={`TH = ${formatNum(point.th)}`}
              stroke={POINT}
              strokeWidth={2.25}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot x={point.wip} y={point.ct} r={7} fill={POINT} stroke="#fff" strokeWidth={2} />
            {broken ? (
              <ReferenceDot
                x={LITTLE_ATTEMPT.wip}
                y={LITTLE_ATTEMPT.ct}
                r={6}
                fill="transparent"
                stroke={POINT}
                strokeDasharray="3 2"
                strokeWidth={1.5}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ScenarioButtons
        items={LITTLE_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
        active={active}
        seen={seen}
        onPick={(id) => {
          setActive(id);
          onSee(id);
        }}
      />
      {sc ? (
        <Say valid={sc.valid}>
          {sc.say}{" "}
          <span className="font-mono text-fg">
            {broken ? `${formatTriple(LITTLE_BASE)}  ≠  WIP ${formatNum(LITTLE_ATTEMPT.wip)}` : formatTriple(point)}
          </span>
        </Say>
      ) : (
        <p className="text-sm text-muted">Titik awal: {formatTriple(LITTLE_BASE)}. Pilih satu if–then.</p>
      )}
    </LessonShell>
  );
}

function KingmanLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = KINGMAN_SCENARIOS.find((s) => s.id === active);
  const start: KingmanPoint = !sc
    ? KINGMAN_BASE
    : sc.id === "K2"
      ? { u: 0.8, v: 0.25 }
      : sc.id === "K3"
        ? { u: 0.7, v: 0 }
        : { u: 0.7, v: 0.5 };
  const end: KingmanPoint = sc?.apply ?? KINGMAN_BASE;
  const from = kingmanFrom(start);
  const to = kingmanFrom(end);
  const ready = formulaReady("kingman", seen);

  const chart = useMemo(
    () =>
      buildKingmanChart({
        te: 1,
        m: 1,
        ca: Math.sqrt(Math.max(end.v, 0)),
        ce: Math.sqrt(Math.max(end.v, 0)),
        th: end.u,
      }),
    [end.u, end.v],
  );

  return (
    <LessonShell
      kicker="Kingman"
      question={INTRO_CURVES[1].question}
      ready={ready}
      formula={
        <>
          <p>CT/te ≈ 1 + V · ū / (1 − ū)</p>
          <p className="text-muted">V ≈ (ca² + ce²) / 2 · suku ū/(1−ū) adalah pengganda dekat kapasitas.</p>
        </>
      }
      reverse="Kalau lawannya: V turun, atau ū mundur dari 1 — CT/te mereda."
      onNext={onNext}
      nextLabel="Lanjut ke Inventory / FR"
    >
      <IdentityRow
        items={[
          ["ū", end.u, true],
          ["V", end.v],
          ["CT/te", to.ratio],
        ]}
      />

      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart.series} margin={{ top: 12, right: 12, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="u"
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "ū", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              domain={[0, KINGMAN_Y_MAX]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "CT/te", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
            {KINGMAN_V_LEVELS.map((lv) => (
              <Line
                key={lv.key}
                type="monotone"
                dataKey={lv.key}
                name={lv.label}
                stroke={lv.color}
                strokeWidth={Math.abs(lv.v - end.v) < 0.02 ? 2.6 : 1.4}
                strokeDasharray={lv.v === 0 ? "6 4" : undefined}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
            {sc ? (
              <ReferenceDot x={from.u} y={from.ratio} r={5} fill="#fff" stroke={POINT} strokeWidth={1.5} />
            ) : null}
            <ReferenceDot x={to.u} y={to.ratio} r={7} fill={POINT} stroke="#fff" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ScenarioButtons
        items={KINGMAN_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
        active={active}
        seen={seen}
        onPick={(id) => {
          setActive(id);
          onSee(id);
        }}
      />
      {sc ? (
        <Say valid>
          {sc.say}{" "}
          <span className="font-mono text-fg">
            {sc.id === "K1" || sc.id === "K3"
              ? `${formatKingman(start)}  →  ${formatKingman(end)}`
              : formatKingman(end)}
          </span>
        </Say>
      ) : (
        <p className="text-sm text-muted">Titik awal: {formatKingman(KINGMAN_BASE)}. Pilih satu if–then.</p>
      )}
    </LessonShell>
  );
}

function InventoryLesson({
  seen,
  onSee,
}: {
  seen: string[];
  onSee: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = INV_SCENARIOS.find((s) => s.id === active);
  const apply: InvApply = sc?.apply ?? { leadTime: INV_BASE.leadTime, demandCv: INV_BASE.demandCv, z: INV_BASE.z };
  const ready = formulaReady("inventory", seen);
  const sameStock = sc?.id === "I2" || sc?.id === "I3";

  const curveNow = useMemo(
    () => invCurve(apply.leadTime, apply.demandCv),
    [apply.leadTime, apply.demandCv],
  );
  const curveBase = useMemo(
    () => invCurve(INV_BASE.leadTime, INV_BASE.demandCv),
    [],
  );

  const pt = sameStock
    ? invFixedStockPoint(apply.leadTime, apply.demandCv)
    : invPoint(apply.leadTime, apply.demandCv, apply.z);
  const basePt = invPoint(INV_BASE.leadTime, INV_BASE.demandCv, INV_BASE.z);

  const steps = INV_Z_STEPS.map((z) => invPoint(INV_BASE.leadTime, INV_BASE.demandCv, z));

  return (
    <LessonShell
      kicker="Inventory / FR"
      question={INTRO_CURVES[2].question}
      ready={ready}
      formula={
        <>
          <p>FR naik jika S / (σ√L) naik</p>
          <p className="text-muted">Stok efektif vs ketidakpastian selama lead time. Target contoh FR = 0,95.</p>
        </>
      }
      reverse="Kalau lawannya: buffer turun — FR jatuh, lebih dulu di ekor kiri."
    >
      <IdentityRow
        items={[
          ["Ī", pt.inv],
          ["FR", pt.fr / 100, true],
        ]}
      />

      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="inv"
              type="number"
              domain={[0, "auto"]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "Inventory", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              dataKey="fr"
              type="number"
              domain={[50, 100]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "FR (%)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip formatter={(v: number) => formatNum(v)} />
            {sameStock ? (
              <Line
                data={curveBase}
                type="monotone"
                dataKey="fr"
                name="semula"
                stroke="#c4c4c4"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ) : null}
            <Line
              data={curveNow}
              type="monotone"
              dataKey="fr"
              name="kurva"
              stroke={POINT}
              strokeWidth={2.25}
              dot={false}
              isAnimationActive={false}
            />
            {sc?.id === "I1"
              ? steps.map((s, i) => (
                  <ReferenceDot
                    key={INV_Z_STEPS[i]}
                    x={s.inv}
                    y={s.fr}
                    r={i === steps.length - 1 ? 7 : 5}
                    fill={i === steps.length - 1 ? POINT : "#fff"}
                    stroke={POINT}
                    strokeWidth={2}
                  />
                ))
              : (
                <>
                  {sc ? (
                    <ReferenceDot x={basePt.inv} y={basePt.fr} r={5} fill="#fff" stroke={POINT} strokeWidth={1.5} />
                  ) : null}
                  <ReferenceDot x={pt.inv} y={pt.fr} r={7} fill={POINT} stroke="#fff" strokeWidth={2} />
                  {sameStock ? (
                    <ReferenceLine x={pt.inv} stroke="#a3a3a3" strokeDasharray="4 3" />
                  ) : null}
                </>
              )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {sc?.id === "I1" ? (
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          {steps.map((s, i) => (
            <div key={INV_Z_STEPS[i]} className="rounded-[var(--radius-sm)] border border-border bg-elevated px-2 py-2">
              <p className="text-faint">{i + 1}×</p>
              <p className="text-fg">FR {formatPct(s.fr / 100)}</p>
            </div>
          ))}
        </div>
      ) : null}

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
        <Say valid>
          {sc.say}{" "}
          <span className="font-mono text-fg">
            FR {formatPct(pt.fr / 100)}
            {sameStock ? ` · stok S tetap ≈ ${formatNum(pt.baseStock)}` : ""}
          </span>
        </Say>
      ) : (
        <p className="text-sm text-muted">Pilih satu if–then. Sumbu X = inventory, Y = fill rate.</p>
      )}
    </LessonShell>
  );
}

function LessonShell({
  kicker,
  question,
  children,
  ready,
  formula,
  reverse,
  onNext,
  nextLabel,
}: {
  kicker: string;
  question: string;
  children: ReactNode;
  ready: boolean;
  formula: ReactNode;
  reverse: string;
  onNext?: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-faint">{kicker}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">{question}</h3>
      </div>
      {children}
      <div className="space-y-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Rumus</p>
        <div className="font-mono text-sm text-fg leading-relaxed">{formula}</div>
        <p className="text-sm text-muted">{reverse}</p>
        {ready && onNext && nextLabel ? (
          <button
            type="button"
            onClick={onNext}
            className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ScenarioButtons({
  items,
  active,
  seen,
  onPick,
}: {
  items: { id: string; label: string }[];
  active: string | null;
  seen: string[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((s) => {
        const on = active === s.id;
        const was = seen.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            className={cn(
              "flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] border px-3 text-center text-sm font-medium leading-snug",
              on
                ? "border-fg bg-primary text-primary-fg"
                : "border-border bg-elevated text-fg hover:bg-subtle",
            )}
          >
            {was && !on ? <Check className="mr-1.5 size-3.5 shrink-0 text-muted" strokeWidth={2} /> : null}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function IdentityRow({
  items,
  product,
  broken,
}: {
  items: [string, number, boolean?][];
  product?: string;
  broken?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className={cn("grid gap-2", items.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {items.map(([k, v, pct]) => (
          <div key={k} className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</p>
            <p className="font-mono text-xl font-semibold tabular-nums text-fg">
              {pct ? formatPct(v) : formatNum(v)}
            </p>
          </div>
        ))}
      </div>
      {product ? (
        <p className={cn("font-mono text-xs", broken ? "text-fg" : "text-muted")}>
          {broken ? "Identitas retak — titik tidak pindah. " : ""}
          {product}
        </p>
      ) : null}
    </div>
  );
}

function Say({ children, valid }: { children: ReactNode; valid: boolean }) {
  return (
    <p
      className={cn(
        "rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm leading-relaxed",
        valid ? "border-border bg-elevated text-fg" : "border-fg bg-elevated text-fg",
      )}
    >
      {children}
    </p>
  );
}

function BridgeCard({ onOpenLab }: { onOpenLab: () => void }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">Menuju putaran 2</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">Kurva yang sama, objek berganti</h3>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted leading-relaxed">
        <li>
          <strong className="text-fg">Little</strong> — aliran di workface (kolom → balok → panel).
        </li>
        <li>
          <strong className="text-fg">Kingman</strong> — ū resource tersibuk dan V kedatangan/pengerjaan.
        </li>
        <li>
          <strong className="text-fg">FR</strong> — buffer panel vs lead time F.
        </li>
      </ol>
      <p className="mt-3 text-sm text-muted leading-relaxed">
        Berikutnya: kasus kerangka beton, DES preset Dasar, lalu tempel titik oranye di Analitik.
        If–then tidak diulang kecuali Anda kembali ke pengenalan.
      </p>
      <button
        type="button"
        onClick={onOpenLab}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
      >
        Lanjut ke kasus
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
