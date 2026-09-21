import { useState } from "react";
import { useMp2k } from "@/lib/mp2k/store";
import {
  buildLabExport,
  copyText,
  downloadTextFile,
  exportToCsvString,
  exportToJsonString,
  exportToPlainText,
} from "@/lib/mp2k/export-lab";
import { loadCohortLabel } from "@/lib/mp2k/persist";
import { Copy, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LabExportBar({ className }: { className?: string }) {
  const desParams = useMp2k((s) => s.desParams);
  const des = useMp2k((s) => s.desMetrics);
  const desComplete = useMp2k((s) => s.desComplete);
  const simTime = useMp2k((s) => s.simTime);
  const [copied, setCopied] = useState(false);

  function payload() {
    return buildLabExport({
      desParams,
      des,
      desComplete,
      simTime,
      cohort: loadCohortLabel(),
    });
  }

  function stamp() {
    const p = payload().preset ?? "custom";
    const t = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return `mp2k-${p}-${t}`;
  }

  async function onCopy() {
    const ok = await copyText(exportToPlainText(payload()));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated/60 px-3 py-2.5",
        className,
      )}
    >
      <p className="mr-auto text-xs text-muted leading-snug">
        Ekspor hasil run untuk dikumpulkan (CSV / JSON / salin teks).
      </p>
      <button
        type="button"
        disabled={!des || des.completed <= 0}
        onClick={onCopy}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-xs font-medium text-fg hover:bg-subtle disabled:opacity-40"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
      <button
        type="button"
        disabled={!des || des.completed <= 0}
        onClick={() =>
          downloadTextFile(`${stamp()}.csv`, exportToCsvString(payload()), "text/csv;charset=utf-8")
        }
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-xs font-medium text-fg hover:bg-subtle disabled:opacity-40"
      >
        <Download className="size-3.5" />
        CSV
      </button>
      <button
        type="button"
        disabled={!des || des.completed <= 0}
        onClick={() =>
          downloadTextFile(
            `${stamp()}.json`,
            exportToJsonString(payload()),
            "application/json;charset=utf-8",
          )
        }
        className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-xs font-medium text-fg hover:bg-subtle disabled:opacity-40"
      >
        <Download className="size-3.5" />
        JSON
      </button>
    </div>
  );
}
