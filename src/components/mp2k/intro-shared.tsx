import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { formatNum } from "@/lib/mp2k/intro-lessons";

export function LessonShell({
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
      <div className="space-y-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Rumus</p>
        <div className="font-mono text-sm text-fg leading-relaxed">{formula}</div>
        <p className="text-sm text-muted">{reverse}</p>
      </div>
      {children}
      {ready && onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
        >
          {nextLabel ?? "Lanjut"}
          <ArrowRight className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export function ScenarioButtons({
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
              on ? "border-fg bg-primary text-primary-fg" : "border-border bg-elevated text-fg hover:bg-subtle",
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

export function IdentityRow({ items }: { items: [string, number | string][] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-fg">
            {typeof v === "number" ? formatNum(v) : v}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Say({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-sm leading-relaxed text-fg">
      {children}
    </p>
  );
}

export function BridgeCard({ onOpenLab }: { onOpenLab: () => void }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-faint">Menuju kasus Gedung</p>
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
        <li>
          <strong className="text-fg">CONWIP</strong> — batas WIP dari kurva Control (W0=8, Wopt≈14).
        </li>
      </ol>
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

export function InvalidX(props: { cx?: number; cy?: number; size?: number }) {
  const { cx = 0, cy = 0, size = 8 } = props;
  const s = size;
  return (
    <g>
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} stroke="#ef4444" strokeWidth={2.5} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} stroke="#ef4444" strokeWidth={2.5} />
    </g>
  );
}
