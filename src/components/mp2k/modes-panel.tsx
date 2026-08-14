import { MODE_META, type ProductionMode } from "@/lib/mp2k/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Factory, Truck } from "lucide-react";

const ICONS: Record<ProductionMode, typeof Hammer> = {
  M: Hammer,
  N: Factory,
  F: Truck,
};

const EXAMPLES: Record<ProductionMode, string[]> = {
  M: [
    "Kolom beton insitu",
    "Tangga hanya L1→L2 di void Z6 / C3",
    "Tidak ada tangga dari L2 ke atap",
  ],
  N: ["Balok precast di yard dekat lokasi", "Batch cetak per gelombang zona", "Angkat ke workface (pengiriman pendek)"],
  F: [
    "Panel lantai dari pabrik",
    "Z6 L1: 2 panel + void tangga",
    "Z6 L2: 3 panel penuh (penutup lantai 2)",
  ],
};

export function ModesPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tiga moda produksi</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted leading-relaxed">
          Satu sistem produksi proyek hampir selalu majemuk. Product design membedakan Z6 per lantai:
          void tangga hanya di L1; L2 tertutup penuh.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(MODE_META) as ProductionMode[]).map((id) => {
          const m = MODE_META[id];
          const Icon = ICONS[id];
          return (
            <Card key={id} className="bg-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={id === "M" ? "m" : id === "N" ? "n" : "f"}>Moda {id}</Badge>
                  <Icon className="size-4 text-muted" strokeWidth={1.75} />
                </div>
                <CardTitle className="text-base">{m.name}</CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                  Di MP2K
                </p>
                <ul className="space-y-1.5 text-sm text-muted">
                  {EXAMPLES[id].map((ex) => (
                    <li key={ex} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-border-strong" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Z6 beda per lantai</CardTitle>
          <CardDescription>
            L1: 2 panel (F) + void tangga (M, belakangan). L2: 3 panel (F) — lantai dua mengarah ke
            atap, tanpa lubang tangga ke atas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-2 font-mono text-xs sm:flex-row sm:items-center sm:justify-center sm:gap-3">
            <FlowChip label="M · Kolom" />
            <Arrow />
            <FlowChip label="N · Balok" />
            <Arrow />
            <FlowChip label="F · Panel" />
            <Arrow />
            <FlowChip label="M · Tangga L1→L2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FlowChip({ label }: { label: string }) {
  return (
    <span className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2 text-center text-fg">
      {label}
    </span>
  );
}

function Arrow() {
  return <span className="hidden text-faint sm:inline">→</span>;
}
