import { useState } from "react";
import {
  INTRO_CURVES,
  LITTLE_SCENARIOS,
  KINGMAN_SCENARIOS,
  CTWIP_SCENARIOS,
  INV_SCENARIOS,
  CONTROL_SCENARIOS,
  LITTLE_BASE,
  DEMO_SYSTEM,
  DEMO_COLORS,
  formatNum,
  type IntroCurve,
} from "@/lib/mp2k/intro-lessons";
import { LittleLesson } from "@/components/mp2k/little-lesson";
import { KingmanLesson } from "@/components/mp2k/kingman-lesson";
import { InventoryLesson } from "@/components/mp2k/inventory-lesson";
import { ControlLesson } from "@/components/mp2k/control-lesson";
import { BridgeCard } from "@/components/mp2k/intro-shared";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = { onOpenLab: () => void };

export function IntroPanel({ onOpenLab }: Props) {
  const [curve, setCurve] = useState<IntroCurve>("little");
  const [done, setDone] = useState<Record<IntroCurve, string[]>>({
    little: [],
    kingman: [],
    ctwip: [],
    inventory: [],
    control: [],
  });

  function mark(id: IntroCurve, sid: string) {
    setDone((prev) => {
      const list = prev[id] ?? [];
      return list.includes(sid) ? prev : { ...prev, [id]: [...list, sid] };
    });
  }

  function needFor(id: IntroCurve) {
    if (id === "little") return LITTLE_SCENARIOS;
    if (id === "kingman") return KINGMAN_SCENARIOS;
    if (id === "ctwip") return CTWIP_SCENARIOS;
    if (id === "inventory") return INV_SCENARIOS;
    return CONTROL_SCENARIOS;
  }

  // Chart CT vs WIP belum ada — jangan blok jembatan lab
  const allReady = INTRO_CURVES.filter((c) => c.id !== "ctwip").every((c) => {
    const seen = done[c.id] ?? [];
    return needFor(c.id).every((s) => seen.includes(s.id));
  });

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Pengenalan</h2>

        <p className="text-sm text-muted leading-relaxed">
          Apa yang mengalir di proyek? Empat verb produksi:{" "}
          <strong className="text-fg">Design</strong>,{" "}
          <strong className="text-fg">Make</strong>,{" "}
          <strong className="text-fg">Transport</strong>, dan{" "}
          <strong className="text-fg">Build</strong>.
          Dari desain ke fabrikasi, pengiriman, hingga pemasangan di workface — semuanya adalah aliran yang harus diatur.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          {(
            [
              ["Design", "Merancang produk & proses"],
              ["Make", "Membuat di pabrik / yard"],
              ["Transport", "Mengirim ke lokasi"],
              ["Build", "Memasang di workface"],
            ] as const
          ).map(([v, d]) => (
            <div
              key={v}
              className="rounded-[var(--radius-sm)] border border-border bg-elevated px-2.5 py-2 text-center"
            >
              <p className="font-semibold text-fg">{v}</p>
              <p className="mt-0.5 text-muted leading-snug">{d}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted leading-relaxed">
          Di Project Production Management (PPM), kinerja aliran diatur lewat lima tuas:{" "}
          <strong className="text-fg">Product Design</strong>,{" "}
          <strong className="text-fg">Process Design</strong>,{" "}
          <strong className="text-fg">Capacity</strong>,{" "}
          <strong className="text-fg">Inventory</strong>, dan{" "}
          <strong className="text-fg">Variability</strong>.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-fg">Product Design</strong> dan{" "}
          <strong className="text-fg">Process Design</strong> datang lebih dulu.
          Pilihan moda (manual, near-site, far-supply), bentuk elemen struktur, dan urutan kerja
          menentukan seberapa besar variabilitas yang masuk ke sistem, seberapa ketat kapasitas yang tersedia,
          dan seberapa banyak inventory yang harus disediakan. Kedua tuas desain ini tidak berdiri di luar kurva —
          justru harus diarahkan dengan mempertimbangkan hubungan kuantitatif yang terbaca di kurva.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Setelah desain ditetapkan, tiga tuas operasional terbaca di tiga kurva:{" "}
          <strong className="text-fg">Little's Law</strong> mengikat Inventory (WIP) dengan Throughput dan Cycle Time;{" "}
          <strong className="text-fg">Kingman</strong> menunjukkan bagaimana Capacity (utilisasi) dan Variability
          membuat CT meledak dekat kapasitas;{" "}
          <strong className="text-fg">Inventory & Fill Rate</strong> menjelaskan berapa buffer stok yang dibutuhkan
          agar permintaan tetap terpenuhi saat lead time dan permintaan tidak pasti.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Variability memaksa sistem punya <strong className="text-fg">buffer</strong> —
          perlindungan yang bisa berbentuk{" "}
          <strong className="text-fg">capacity</strong> (utilisasi di bawah 100%),{" "}
          <strong className="text-fg">time</strong> (slack jadwal / padding lead time), atau{" "}
          <strong className="text-fg">stock</strong> (WIP, safety stock).
          Ketiga kurva menunjukkan harga masing-masing pilihan:
          Little mengikat inventory buffer (WIP) dengan CT;
          Kingman menunjukkan betapa mahalnya CT bila capacity buffer dikurangi dekat utilisasi penuh;
          Fill Rate menjelaskan berapa stock buffer yang dibutuhkan agar layanan tetap terjaga.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Setelah memahami tiga kurva, langkah berikutnya adalah{" "}
          <strong className="text-fg">Control</strong>: kebijakan yang mengatur berapa WIP yang boleh hidup di sistem.
          Tab <strong className="text-fg">Control & CONWIP</strong> menjelaskan cara memilih batas itu dari kurva
          operating WIP–TH–CT.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Modul memakai <strong className="text-fg">satu sistem demo yang sama</strong>.
          Angka dan warna oranye mengikuti dari Little → Kingman → CT vs WIP → Inventory → Control.
        </p>
        <SystemChip />
      </div>

      <nav
        aria-label="Modul pengenalan"
        className="grid grid-cols-2 gap-1 rounded-[var(--radius-md)] border border-border bg-elevated p-1 sm:grid-cols-3 lg:grid-cols-5"
      >
        {INTRO_CURVES.map((c) => {
          const seen = done[c.id] ?? [];
          const ready =
            c.id === "ctwip" ? false : needFor(c.id).every((s) => seen.includes(s.id));
          const active = curve === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurve(c.id)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[calc(var(--radius-md)-2px)] px-1 py-2",
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
              <span className="text-xs font-medium text-center leading-snug sm:text-sm">{c.label}</span>
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
          onNext={() => setCurve("ctwip")}
        />
      )}
      {curve === "ctwip" && (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Grafik CT vs WIP</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            Bagaimana CT berubah saat WIP naik — dan di mana W0 / Wopt?
          </h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Modul chart (kurva ketiga PPI) akan ditambahkan di langkah berikutnya. Data dan skenario sudah
            disiapkan dengan sistem demo yang sama (W0={DEMO_SYSTEM.W0}, Wopt≈{DEMO_SYSTEM.Wopt}).
          </p>
          <button
            type="button"
            onClick={() => setCurve("inventory")}
            className="mt-4 min-h-11 rounded-[var(--radius-sm)] border border-border bg-elevated px-4 text-sm font-medium text-fg hover:bg-subtle"
          >
            Lanjut ke Inventory & Fill Rate →
          </button>
        </div>
      )}
      {curve === "inventory" && (
        <InventoryLesson
          seen={done.inventory}
          onSee={(id) => mark("inventory", id)}
          onNext={() => setCurve("control")}
        />
      )}
      {curve === "control" && (
        <ControlLesson seen={done.control} onSee={(id) => mark("control", id)} />
      )}

      {allReady ? (
        <BridgeCard onOpenLab={onOpenLab} />
      ) : (
        <p className="text-xs text-faint">
          Setelah skenario Little · Kingman · Inventory · Control dijelajahi, jembatan ke kasus muncul di sini.
        </p>
      )}
    </div>
  );
}

function SystemChip() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-sm)] border px-3 py-2 text-xs font-mono"
      style={{
        borderColor: DEMO_COLORS.operating,
        background: "color-mix(in srgb, " + DEMO_COLORS.operating + " 8%, transparent)",
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 font-sans font-medium"
        style={{ color: DEMO_COLORS.operating }}
      >
        <span className="inline-block size-2.5 rounded-full" style={{ background: DEMO_COLORS.operating }} />
        Sistem demo
      </span>
      <span className="text-muted">T0={DEMO_SYSTEM.T0}</span>
      <span className="text-muted">rb={DEMO_SYSTEM.rb}</span>
      <span className="text-fg font-semibold">W0={DEMO_SYSTEM.W0}</span>
      <span className="text-muted">V={formatNum(DEMO_SYSTEM.V)}</span>
      <span className="text-fg font-semibold">Wopt≈{DEMO_SYSTEM.Wopt}</span>
      <span className="text-muted">
        Little: WIP={LITTLE_BASE.wip}·TH={LITTLE_BASE.th}·CT={LITTLE_BASE.ct}
      </span>
    </div>
  );
}
