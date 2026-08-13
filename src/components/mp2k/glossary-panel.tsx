import { useState } from "react";
import { GLOSSARY, GLOSSARY_GROUPS } from "@/lib/mp2k/glossary";
import { cn } from "@/lib/utils";
import { BookMarked, ChevronDown } from "lucide-react";

/** Priority 4 — glossarium singkat + satuan. */
export function GlossaryPanel({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-11 items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-fg">
          <BookMarked className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
          Glossarium PPM / Operations Science
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          strokeWidth={1.75}
        />
      </button>

      {open ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-muted leading-relaxed">
            Istilah yang dipakai di Simulasi & Analitik. Model ini <strong className="text-fg">didaktik</strong>{\" \"}
            (frame 2 lantai) — bukan digital twin proyek nyata.
          </p>
          <div className="space-y-4">
            {GLOSSARY_GROUPS.map((g) => {
              const items = GLOSSARY.filter((e) => e.group === g.id);
              if (!items.length) return null;
              return (
                <div key={g.id}>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-faint">
                    {g.label}
                  </p>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {items.map((e) => (
                      <div
                        key={e.term}
                        className="rounded-[var(--radius-sm)] border border-border/80 bg-elevated/40 px-2.5 py-2"
                      >
                        <dt className="flex flex-wrap items-baseline gap-1.5">
                          <span className="font-mono text-xs font-semibold text-fg">{e.term}</span>
                          {e.unit ? (
                            <span className="font-mono text-[10px] text-faint">{e.unit}</span>
                          ) : null}
                        </dt>
                        <dd className="mt-0.5 text-[11px] text-muted leading-snug">{e.def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
