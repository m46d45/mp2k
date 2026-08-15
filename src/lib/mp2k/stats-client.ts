import { getMp2kStats, recordSimulation, recordVisit } from "@/lib/mp2k/stats.server";
import type { Mp2kStats } from "@/lib/mp2k/stats.server";

const VID_KEY = "mp2k_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(VID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now().toString(36)}`;
  }
}

export async function trackVisit(): Promise<void> {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  try {
    await recordVisit({ data: { visitorId } });
  } catch {
    /* lab harus tetap jalan meski pencatatan gagal */
  }
}

export async function trackSimulation(how: "run_all" | "play" | "step" = "run_all"): Promise<void> {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  try {
    await recordSimulation({ data: { visitorId, how } });
  } catch {
    /* ignore */
  }
}

export async function fetchStats(): Promise<Mp2kStats | null> {
  try {
    return await getMp2kStats();
  } catch {
    return null;
  }
}

export type { Mp2kStats };
