import { useEffect, useState } from "react";
import { DES_PRESETS } from "@/lib/mp2k/des/presets";
import { PRESET_EXPECTED } from "@/lib/mp2k/des/expected-ranges";
import {
  EMPTY_WORKSHEET,
  loadWorksheet,
  saveWorksheet,
  type WorksheetAnswers,
} from "@/lib/mp2k/persist";
import { copyText } from "@/lib/mp2k/export-lab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, RotateCcw } from "lucide-react";

type Props = {
  onOpenSim: (presetId?: string) => void;
  onBack: () => void;
};

export function WorksheetPanel({ onOpenSim, onBack }: Props) {
  const [w, setW] = useState<WorksheetAnswers>(() =>
    typeof window === "undefined" ? EMPTY_WORKSHEET : loadWorksheet(),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveWorksheet(w);
  }, [w]);

  function patch(p: Partial<WorksheetAnswers>) {
    setW((prev) => ({ ...prev, ...p }));
  }

  function setPresetNote(id: string, text: string) {
    setW((prev) => ({
      ...prev,
      presetNotes: { ...prev.presetNotes, [id]: text },
    }));
  }

  function buildPlain(): string {
    const lines = [
      "MP2K — Lembar kerja mahasiswa",
      `Nama: ${w.nama || "—"}`,
      `Kelompok: ${w.kelompok || "—"}`,
      `Diperbarui: ${w.updatedAt || new Date().toISOString()}`,
      "",
      "=== Catatan per preset (seed 42, Run all) ===",
    ];
    for (const p of DES_PRESETS) {
      lines.push(`\n[${p.label}] ${p.question}`);
      lines.push(w.presetNotes[p.id]?.trim() || "(belum diisi)");
    }
    lines.push("\n=== Mengapa Δ DES vs teori bisa besar? (5–7 kalimat) ===");
    lines.push(w.deltaExplain.trim() || "(belum diisi)");
    return lines.join("\n");
  }

  async function onCopy() {
    const ok = await copyText(buildPlain());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Lembar kerja</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Tugas lab MP2K</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Isi setelah menjalankan preset di Simulasi. Jawaban tersimpan di peramban ini; salin teks
            untuk dikumpulkan ke LMS / email dosen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium hover:bg-elevated"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={() => {
              setW(EMPTY_WORKSHEET);
              saveWorksheet(EMPTY_WORKSHEET);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium hover:bg-elevated"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => void onCopy()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-3 text-sm font-medium text-primary-fg"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Tersalin" : "Salin jawaban"}
          </button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identitas</CardTitle>
          <CardDescription>Tidak dikirim ke server — hanya di perangkat Anda</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-faint">Nama</span>
            <input
              className="min-h-10 rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-fg outline-none focus:border-fg"
              value={w.nama}
              onChange={(e) => patch({ nama: e.target.value })}
              placeholder="Nama lengkap"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-faint">Kelompok</span>
            <input
              className="min-h-10 rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-fg outline-none focus:border-fg"
              value={w.kelompok}
              onChange={(e) => patch({ kelompok: e.target.value })}
              placeholder="mis. Kelompok 3 / Kelas A"
            />
          </label>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {DES_PRESETS.map((p) => {
          const hint = PRESET_EXPECTED[p.id];
          return (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{p.label}</CardTitle>
                    <CardDescription className="mt-1">{p.question}</CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSim(p.id)}
                    className="inline-flex min-h-9 shrink-0 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-xs font-medium hover:bg-elevated"
                  >
                    Buka preset
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[11px] text-faint leading-relaxed">
                  Petunjuk dosen (rentang tipikal seed 42): TH {hint.th[0]}–{hint.th[1]}, CT{" "}
                  {hint.ct[0]}–{hint.ct[1]}, WIP {hint.wip[0]}–{hint.wip[1]}, FR{" "}
                  {(hint.fr[0] * 100).toFixed(0)}–{(hint.fr[1] * 100).toFixed(0)}%. {hint.note}
                </p>
                <textarea
                  className="min-h-24 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-fg"
                  placeholder="Catat TH, CT, WIP, FR, ū dan observasi Anda…"
                  value={w.presetNotes[p.id] ?? ""}
                  onChange={(e) => setPresetNote(p.id, e.target.value)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-fg/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sinkronisasi teori</CardTitle>
          <CardDescription>
            Setelah Isi dari DES → Mulai perhitungan di Analitik: jelaskan dalam 5–7 kalimat mengapa
            titik oranye tidak selalu menempel prediksi tertutup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-36 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-fg"
            placeholder="Multi-moda, bottleneck vs CT sistem, fase transient, buffer diskrit…"
            value={w.deltaExplain}
            onChange={(e) => patch({ deltaExplain: e.target.value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
