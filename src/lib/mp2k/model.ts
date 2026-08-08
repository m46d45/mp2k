/** MP2K domain: Multi-Moda Produksi Proyek Konstruksi */

export type ProductionMode = "M" | "N" | "F";
export type ElementStatus = "empty" | "queued" | "producing" | "ready" | "installed";
export type Floor = 1 | 2;
export type Phase = "columns" | "beams" | "panels" | "stair" | "closed";

export const MODE_META: Record<
  ProductionMode,
  { id: ProductionMode; name: string; short: string; desc: string; colorToken: string }
> = {
  M: {
    id: "M",
    name: "Manual / Craft",
    short: "Manual",
    desc: "Dikerjakan di site: kolom insitu dan tangga L1→L2. Variability tinggi, capacity tergantung kru.",
    colorToken: "mode-m",
  },
  N: {
    id: "N",
    name: "Near-site Offsite",
    short: "Near-site",
    desc: "Dicetak di yard dekat lokasi: balok precast. Batch terkontrol, delivery pendek ke workface.",
    colorToken: "mode-n",
  },
  F: {
    id: "F",
    name: "Far Supply-Install",
    short: "Far supply",
    desc: "Dari pabrik jauh, di site tinggal pasang: panel lantai. Throughput ditentukan logistik + crane.",
    colorToken: "mode-f",
  },
};

export const ZONE_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ZoneId = (typeof ZONE_IDS)[number];

export const WAVE_PAIRS: readonly [ZoneId, ZoneId][] = [
  [1, 5],
  [2, 6],
  [3, 7],
  [4, 8],
];

export const COL_ROWS = 3;
export const COL_COLS = 5;
export const TOTAL_COLUMNS = COL_ROWS * COL_COLS;

/** Lajur C3 = index kolom 2 (C1…C5) — sumbu struktur tangga L1→L2 */
export const STAIR_COL = 2;

export const FLOORS: Floor[] = [1, 2];

export function zoneBay(z: ZoneId): { bayRow: 0 | 1; bayCol: 0 | 1 | 2 | 3 } {
  if (z <= 4) return { bayRow: 0, bayCol: (z - 1) as 0 | 1 | 2 | 3 };
  return { bayRow: 1, bayCol: (z - 5) as 0 | 1 | 2 | 3 };
}

export function zoneLabel(z: ZoneId): string {
  return `Z${z}`;
}

export function isStairZone(z: ZoneId): boolean {
  return z === 6;
}

/**
 * Panel per zone per lantai:
 * - Normal: 3 panel
 * - Z6 L1: 2 panel + void tangga (tidak ke atap)
 * - Z6 L2: 3 panel penuh (lantai dua = penutup; tanpa void tangga ke atap)
 */
export function panelsForZone(z: ZoneId, floor: Floor = 1): number {
  if (isStairZone(z) && floor === 1) return 2;
  return 3;
}

/** Void tangga hanya di Z6 lantai 1 */
export function hasStairVoid(z: ZoneId, floor: Floor): boolean {
  return isStairZone(z) && floor === 1;
}

export function columnKey(row: number, col: number): string {
  return `c-r${row}c${col}`;
}

export function zoneColumnKeys(z: ZoneId): string[] {
  const { bayRow, bayCol } = zoneBay(z);
  return [
    columnKey(bayRow, bayCol),
    columnKey(bayRow, bayCol + 1),
    columnKey(bayRow + 1, bayCol),
    columnKey(bayRow + 1, bayCol + 1),
  ];
}

export function beamKey(floor: Floor, a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `b-L${floor}-${x}-${y}`;
}

export function zoneBeamKeys(floor: Floor, z: ZoneId): string[] {
  const { bayRow, bayCol } = zoneBay(z);
  const tl = columnKey(bayRow, bayCol);
  const tr = columnKey(bayRow, bayCol + 1);
  const bl = columnKey(bayRow + 1, bayCol);
  const br = columnKey(bayRow + 1, bayCol + 1);
  return [
    beamKey(floor, tl, tr),
    beamKey(floor, bl, br),
    beamKey(floor, tl, bl),
    beamKey(floor, tr, br),
  ];
}

export function panelKey(floor: Floor, z: ZoneId, index: number): string {
  return `p-L${floor}-Z${z}-${index}`;
}

/** Satu run tangga manual: L1 → L2 saja (tidak ke atap) */
export function stairKey(): string {
  return "stair-L1-to-L2";
}

/**
 * Syarat tangga L1→L2: kolom C3 (3 baris) s/d story 2,
 * balok di sumbu C3 pada L1 dan L2 terpasang (landing L2 siap).
 */
export function c3StructureReady(
  columnFloor: Record<string, 0 | 1 | 2>,
  beams: Record<string, ElementStatus>,
): boolean {
  for (let r = 0; r < COL_ROWS; r++) {
    if ((columnFloor[columnKey(r, STAIR_COL)] ?? 0) < 2) return false;
  }
  for (const fl of [1, 2] as Floor[]) {
    for (let r = 0; r < COL_ROWS; r++) {
      const left = beamKey(fl, columnKey(r, STAIR_COL - 1), columnKey(r, STAIR_COL));
      const right = beamKey(fl, columnKey(r, STAIR_COL), columnKey(r, STAIR_COL + 1));
      if (beams[left] !== "installed" || beams[right] !== "installed") return false;
    }
    for (let r = 0; r < COL_ROWS - 1; r++) {
      const v = beamKey(fl, columnKey(r, STAIR_COL), columnKey(r + 1, STAIR_COL));
      if (beams[v] !== "installed") return false;
    }
  }
  return true;
}

export type LeverId = "product" | "process" | "capacity" | "inventory" | "variability";

export const LEVERS: {
  id: LeverId;
  name: string;
  nameEn: string;
  summary: string;
  mp2k: string;
}[] = [
  {
    id: "product",
    name: "Product Design",
    nameEn: "Desain Produk",
    summary: "Standardisasi, modularisasi, dan mekanisme interface antar elemen.",
    mp2k:
      "Grid 3×5. Z6 L1: 2 panel + void tangga. Z6 L2: 3 panel penuh (tidak ada tangga ke atap). Tangga = craft L1→L2 di sumbu C3.",
  },
  {
    id: "process",
    name: "Process Design",
    nameEn: "Desain Proses",
    summary: "Urutan operasi, handoff, batch, dan titik kendali (pull).",
    mp2k:
      "Per gelombang: kolom (M) → balok (N) → panel (F). L1 dulu lalu L2. Tangga manual terakhir L1→L2 setelah C3 siap — tidak ada run ke atap.",
  },
  {
    id: "capacity",
    name: "Capacity",
    nameEn: "Kapasitas",
    summary: "Batas atas throughput — resource yang membatasi aliran.",
    mp2k:
      "Crew kolom, yard balok, crane panel, kru tangga L1→L2. Throughput = min di rantai multi-moda.",
  },
  {
    id: "inventory",
    name: "Inventory",
    nameEn: "Inventori / WIP",
    summary: "WIP dan stok di antara proses — buffer yang didesain, bukan sisa.",
    mp2k:
      "Cap yard & staging. Void tangga hanya L1 Z6 — L2 Z6 tidak menyisakan lubang ke atap.",
  },
  {
    id: "variability",
    name: "Variability",
    nameEn: "Variabilitas",
    summary: "Ketidaksamaan waktu/kualitas/demand; kurangi + serap sisa dengan buffer.",
    mp2k:
      "Cure kolom, reject yard, telat truck. Tangga menunggu struktur C3 L1–L2 (landing lantai dua).",
  },
];

export function totalBeams(): number {
  return 24 + 20;
}

/** 7×3×2 + Z6 L1 (2) + Z6 L2 (3) = 42 + 2 + 3 = 47 */
export function totalPanels(): number {
  return 7 * 3 * 2 + 2 + 3;
}

export const TOTALS = {
  columns: TOTAL_COLUMNS,
  beams: totalBeams(),
  panels: totalPanels(),
  zones: 16,
  stairs: 1,
};
