import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMp2k } from "@/lib/mp2k/store";
import { Pause, Play, RotateCcw, SkipForward, FastForward } from "lucide-react";
import { cn } from "@/lib/utils";

export function SimControls() {
  const playing = useMp2k((s) => s.playing);
  const speed = useMp2k((s) => s.speed);
  const phase = useMp2k((s) => s.phase);
  const lastMessage = useMp2k((s) => s.lastMessage);
  const stepCount = useMp2k((s) => s.stepCount);
  const log = useMp2k((s) => s.log);
  const simTime = useMp2k((s) => s.simTime);
  const desComplete = useMp2k((s) => s.desComplete);
  const step = useMp2k((s) => s.step);
  const reset = useMp2k((s) => s.reset);
  const runAll = useMp2k((s) => s.runAll);
  const setPlaying = useMp2k((s) => s.setPlaying);
  const setSpeed = useMp2k((s) => s.setSpeed);

  useEffect(() => {
    if (!playing || desComplete || phase === "complete") return;
    if (speed === "manual") return;
    const ms = speed === "slow" ? 900 : speed === "normal" ? 350 : 80;
    const id = window.setInterval(() => {
      useMp2k.getState().step();
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, speed, phase, desComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={playing ? "secondary" : "default"}
          onClick={() => setPlaying(!playing)}
          disabled={desComplete || speed === "manual"}
          aria-label={playing ? "Jeda" : "Putar DES"}
        >
          {playing ? <Pause /> : <Play />}
          {playing ? "Jeda" : "Jalankan DES"}
        </Button>
        <Button variant="secondary" onClick={() => step()} disabled={desComplete} aria-label="Event berikutnya">
          <SkipForward />
          Step event
        </Button>
        <Button variant="secondary" onClick={() => runAll()} disabled={desComplete} aria-label="Jalankan sampai selesai">
          <FastForward />
          Run all
        </Button>
        <Button variant="outline" onClick={() => reset()} aria-label="Reset DES">
          <RotateCcw />
          Reset
        </Button>
        <div className="ml-auto flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-elevated p-1">
          {(["manual", "slow", "normal", "fast"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSpeed(s);
                if (s === "manual") setPlaying(false);
              }}
              className={cn(
                "min-h-9 rounded-[calc(var(--radius-sm)-2px)] px-2.5 py-1.5 text-xs font-medium",
                speed === s ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
              )}
            >
              {s === "manual" ? "Manual" : s === "slow" ? "Lambat" : s === "normal" ? "Normal" : "Cepat"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-border bg-elevated px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant={desComplete ? "success" : "default"}>
            t = {simTime.toFixed(2)} hari
          </Badge>
          <Badge variant="default">langkah #{stepCount}</Badge>
          <span className="text-xs text-faint uppercase tracking-wide">DES</span>
        </div>
        <p className="text-sm leading-relaxed text-fg">{lastMessage}</p>
      </div>

      <div className="max-h-40 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-bg/50 p-3 font-mono text-[11px] leading-relaxed text-muted">
        {log.length === 0 ? (
          <p>Log event kosong.</p>
        ) : (
          <ul className="space-y-1">
            {log.map((line, i) => (
              <li key={`${i}-${line.slice(0, 16)}`} className="border-b border-border/50 pb-1 last:border-0">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
