/** Glossary for MP2K lab — short definitions + units. */

export type GlossaryEntry = {
  term: string;
  unit?: string;
  def: string;
  group: "metrik" | "tuas" | "hukum" | "moda" | "lain";
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "TH",
    unit: "job/hari",
    def: "Throughput — laju penyelesaian kerja rata-rata.",
    group: "metrik",
  },
  {
    term: "CT",
    unit: "hari",
    def: "Cycle time — waktu dari mulai hingga selesai satu job (rata-rata).",
    group: "metrik",
  },
  {
    term: "WIP",
    unit: "job",
    def: "Work-in-process — pekerjaan yang sedang mengalir di sistem.",
    group: "metrik",
  },
  {
    term: "ū",
    unit: "0–1",
    def: "Utilisasi resource — proporsi waktu sibuk. Dekat 1 → antrian meledak (Kingman).",
    group: "metrik",
  },
  {
    term: "FR",
    unit: "%",
    def: "Fill rate — proporsi permintaan panel yang dipenuhi dari stok (tanpa stockout).",
    group: "metrik",
  },
  {
    term: "te",
    unit: "hari",
    def: "Waktu proses efektif rata-rata per job di satu resource.",
    group: "tuas",
  },
  {
    term: "m",
    unit: "unit",
    def: "Jumlah resource paralel (crew / bay / crane slot).",
    group: "tuas",
  },
  {
    term: "ca",
    unit: "CV",
    def: "Koefisien variasi kedatangan / aliran antar job.",
    group: "tuas",
  },
  {
    term: "ce",
    unit: "CV",
    def: "Koefisien variasi waktu proses.",
    group: "tuas",
  },
  {
    term: "V",
    unit: "—",
    def: "Indeks variabilitas gabungan ≈ (ca² + ce²) / 2 pada model Kingman.",
    group: "tuas",
  },
  {
    term: "CONWIP",
    unit: "job",
    def: "Constant WIP — batas atas pekerjaan aktif di sistem (tuas inventory).",
    group: "tuas",
  },
  {
    term: "L",
    unit: "hari",
    def: "Lead time pasokan panel (far supply) hingga tiba di staging.",
    group: "tuas",
  },
  {
    term: "Little",
    def: "WIP = TH × CT pada sistem stabil (rata-rata jangka panjang).",
    group: "hukum",
  },
  {
    term: "Kingman",
    def: "Perkiraan CT antrian vs utilisasi dan variabilitas — CT naik tajam saat ū tinggi.",
    group: "hukum",
  },
  {
    term: "Inventory / FR",
    def: "Trade-off stok (buffer) vs fill rate / stockout pada pasokan lead time.",
    group: "hukum",
  },
  {
    term: "M",
    def: "Manual / craft onsite — di kasus ini: kolom (dan tangga).",
    group: "moda",
  },
  {
    term: "N",
    def: "Near-site offsite — di kasus ini: balok dari yard dekat site.",
    group: "moda",
  },
  {
    term: "F",
    def: "Far supply & install — di kasus ini: panel lantai dari luar.",
    group: "moda",
  },
  {
    term: "Workface",
    def: "Lokasi fisik di mana pekerjaan dipasang / dipasangkan antar moda.",
    group: "lain",
  },
  {
    term: "DES",
    def: "Discrete event simulation — simulasi event (start/end/arrive) berurutan waktu.",
    group: "lain",
  },
  {
    term: "PPM",
    def: "Project Production Management — mengelola proyek sebagai sistem produksi (bukan hanya jadwal).",
    group: "lain",
  },
];

export const GLOSSARY_GROUPS: { id: GlossaryEntry["group"]; label: string }[] = [
  { id: "metrik", label: "Metrik" },
  { id: "tuas", label: "Parameter tuas" },
  { id: "hukum", label: "Hukum" },
  { id: "moda", label: "Moda produksi" },
  { id: "lain", label: "Lainnya" },
];
