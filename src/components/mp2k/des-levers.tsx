import { useMp2k } from "@/lib/mp2k/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DES_PRESETS,
  matchPresetId,
  type DesPresetId,
} from "@/lib/mp2k/des/presets";

/**
 * Three live PPM levers for DES:
 * Capacity · Variability · Inventory
 * (Product & Process design fixed in Kasus)
 *
 * Priority 2: guided experiment presets + one question each.
 */
export function DesLeversPanel() {
  const p = useMp2k((s) => s.desParams);
  const setDesParams = useMp2k((s) => s.setDesParams);
  const desComplete = useMp2k((s) => s.desComplete);
  const activeId = matchPresetId(p);
  const active = DES_PRESETS.find((x) => x.id === activeId) ?? null;

  function applyPreset(id: DesPresetId) {
    const preset = DES_PRESETS.find((x) => x.id === id);
    if (!preset) return;
    setDesParams({ ...preset.params });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight">3 tuas DES</h2>
        <Badge variant="default">Capacity</Badge>
        <Badge variant="default">Variability</Badge>
        <Badge variant="default">Inventory</Badge>
        {desComplete && <Badge variant="success">run selesai</Badge>}
      </div>
      <p className="text-xs text-muted leading-relaxed">
        Product design dan Process design sudah ditetapkan di Kasus. Pilih{" "}
        <strong className="text-fg">preset</strong>, atau ubah parameter sendiri — DES diulang dari
        awal dengan tuas yang baru.
      </p>

      {/* Guided presets */}
      <Card className="border-fg/20 bg-elevated/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Eksperimen berpemandu</CardTitle>
          <CardDescription>
            Empat skenario · pilih → Run all → bandingkan ke Dasar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DES_PRESETS.map((preset) => {
              const on = activeId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    "min-h-11 rounded-[var(--radius-sm)] border px-2.5 py-2 text-left transition-colors",
                    on
                      ? "border-fg bg-primary text-primary-fg"
                      : "border-border bg-surface text-fg hover:bg-subtle",
                  )}
                >
                  <span className="block text-xs font-semibold leading-tight">{preset.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[10px] leading-snug",
                      on ? "text-primary-fg/75" : "text-faint",
                    )}
                  >
                    {preset.short}
                  </span>
                </button>
              );
            })}
          </div>

          {active ? (
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
                Pertanyaan · {active.label}
              </p>
              <p className="mt-1 text-sm font-medium text-fg leading-snug">{active.question}</p>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{active.hint}</p>
            </div>
          ) : (
            <div className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-2.5">
              <p className="text-xs text-muted leading-relaxed">
                Parameter diubah sendiri (bukan preset). Pilih salah satu skenario di atas, atau
                lanjutkan dengan pengaturan bebas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Capacity</CardTitle>
            <CardDescription>Resource paralel (m) & process time te</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Num label="m kolom" value={p.mColumn} min={1} max={6} step={1} onChange={(v) => setDesParams({ mColumn: v })} />
            <Num label="m balok" value={p.mBeam} min={1} max={6} step={1} onChange={(v) => setDesParams({ mBeam: v })} />
            <Num label="m panel" value={p.mPanel} min={1} max={4} step={1} onChange={(v) => setDesParams({ mPanel: v })} />
            <Num label="m tangga" value={p.mStair} min={1} max={3} step={1} onChange={(v) => setDesParams({ mStair: v })} />
            <Num label="te kolom" value={p.teColumn} min={0.05} step={0.05} onChange={(v) => setDesParams({ teColumn: v })} />
            <Num label="te balok" value={p.teBeam} min={0.05} step={0.05} onChange={(v) => setDesParams({ teBeam: v })} />
            <Num label="te panel" value={p.tePanel} min={0.05} step={0.05} onChange={(v) => setDesParams({ tePanel: v })} />
            <Num label="te tangga" value={p.teStair} min={0.5} step={0.5} onChange={(v) => setDesParams({ teStair: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variability</CardTitle>
            <CardDescription>ca (aliran) · ce (proses) · seed RNG</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            <Num label="ca" value={p.ca} min={0} max={2} step={0.05} onChange={(v) => setDesParams({ ca: v })} />
            <Num label="ce" value={p.ce} min={0} max={2} step={0.05} onChange={(v) => setDesParams({ ce: v })} />
            <Num label="seed" value={p.seed} min={1} step={1} integer onChange={(v) => setDesParams({ seed: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inventory</CardTitle>
            <CardDescription>CONWIP · lead time panel · buffer awal staging</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            <Num label="CONWIP" value={p.conwip} min={1} max={40} step={1} onChange={(v) => setDesParams({ conwip: v })} />
            <Num label="L panel" value={p.panelLeadTime} min={0.1} step={0.5} onChange={(v) => setDesParams({ panelLeadTime: v })} />
            <Num label="buffer awal" value={p.panelBufferInitial} min={0} max={20} step={1} onChange={(v) => setDesParams({ panelBufferInitial: v })} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  min,
  max,
  step,
  integer,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</span>
      <input
        type="number"
        className={cn(
          "h-9 rounded-[var(--radius-sm)] border border-border bg-bg px-2 font-mono text-sm text-fg tabular-nums outline-none focus:border-fg",
        )}
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
    </label>
  );
}
