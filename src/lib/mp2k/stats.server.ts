import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

const visitorIdSchema = z
  .string()
  .min(8)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

const visitInput = z.object({
  visitorId: visitorIdSchema,
});

const simInput = z.object({
  visitorId: visitorIdSchema,
  how: z.enum(["run_all", "play", "step"]).optional(),
});

export type DailyStat = {
  day: string;
  visits: number;
  sims: number;
};

export type RecentEvent = {
  kind: string;
  how: string | null;
  createdAt: string;
  visitorShort: string;
};

export type Mp2kStats = {
  visitors: number;
  visits: number;
  simulations: number;
  visitorsToday: number;
  simulationsToday: number;
  daily: DailyStat[];
  recent: RecentEvent[];
};

function emptyStats(): Mp2kStats {
  return {
    visitors: 0,
    visits: 0,
    simulations: 0,
    visitorsToday: 0,
    simulationsToday: 0,
    daily: [],
    recent: [],
  };
}

function asIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return String(v ?? "");
}

export const recordVisit = createServerFn({ method: "POST" })
  .validator((data) => visitInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql<{ last_seen: unknown; visit_count: number }>`
      select last_seen, visit_count from mp2k_visitors where visitor_id = ${data.visitorId}
    `;
    const row = existing[0];
    const now = Date.now();
    const last = row ? new Date(asIso(row.last_seen)).getTime() : 0;
    const freshSession = !row || now - last > 30 * 60 * 1000;

    if (!row) {
      await sql`
        insert into mp2k_visitors (visitor_id, visit_count)
        values (${data.visitorId}, 1)
      `;
      await sql`
        insert into mp2k_events (visitor_id, kind, how)
        values (${data.visitorId}, 'visit', 'first')
      `;
    } else {
      if (freshSession) {
        await sql`
          update mp2k_visitors
          set last_seen = now(), visit_count = visit_count + 1
          where visitor_id = ${data.visitorId}
        `;
        await sql`
          insert into mp2k_events (visitor_id, kind, how)
          values (${data.visitorId}, 'visit', 'return')
        `;
      } else {
        await sql`
          update mp2k_visitors set last_seen = now() where visitor_id = ${data.visitorId}
        `;
      }
    }
    return { ok: true as const };
  });

export const recordSimulation = createServerFn({ method: "POST" })
  .validator((data) => simInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const recent = await sql<{ created_at: unknown }>`
      select created_at from mp2k_events
      where visitor_id = ${data.visitorId} and kind = 'sim'
      order by created_at desc
      limit 1
    `;
    if (recent[0]) {
      const t = new Date(asIso(recent[0].created_at)).getTime();
      if (Date.now() - t < 4000) return { ok: true as const, skipped: true };
    }
    await sql`
      insert into mp2k_events (visitor_id, kind, how)
      values (${data.visitorId}, 'sim', ${data.how ?? "run_all"})
    `;
    await sql`
      insert into mp2k_visitors (visitor_id, visit_count)
      values (${data.visitorId}, 0)
      on conflict (visitor_id) do update set last_seen = now()
    `;
    return { ok: true as const, skipped: false };
  });

export const getMp2kStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    const totals = await sql<{
      visitors: number;
      visits: number;
      simulations: number;
      visitors_today: number;
      simulations_today: number;
    }>`
      select
        (select count(*) from mp2k_visitors)::int as visitors,
        coalesce((select sum(visit_count) from mp2k_visitors), 0)::int as visits,
        (select count(*) from mp2k_events where kind = 'sim')::int as simulations,
        (select count(*) from mp2k_visitors where last_seen >= date_trunc('day', now()))::int as visitors_today,
        (select count(*) from mp2k_events where kind = 'sim' and created_at >= date_trunc('day', now()))::int as simulations_today
    `;
    const daily = await sql<{ day: string; visits: number; sims: number }>`
      select
        to_char(d::date, 'YYYY-MM-DD') as day,
        (
          select count(*) from mp2k_events e
          where e.kind = 'visit' and e.created_at::date = d::date
        )::int as visits,
        (
          select count(*) from mp2k_events e
          where e.kind = 'sim' and e.created_at::date = d::date
        )::int as sims
      from generate_series(
        (current_date - interval '13 days')::date,
        current_date,
        interval '1 day'
      ) as d
      order by d
    `;
    const recent = await sql<{
      kind: string;
      how: string | null;
      created_at: unknown;
      visitor_id: string;
    }>`
      select kind, how, created_at, visitor_id
      from mp2k_events
      order by created_at desc
      limit 20
    `;
    const t = totals[0];
    const out: Mp2kStats = {
      visitors: t?.visitors ?? 0,
      visits: t?.visits ?? 0,
      simulations: t?.simulations ?? 0,
      visitorsToday: t?.visitors_today ?? 0,
      simulationsToday: t?.simulations_today ?? 0,
      daily: daily.map((r) => ({
        day: r.day,
        visits: r.visits,
        sims: r.sims,
      })),
      recent: recent.map((r) => ({
        kind: r.kind,
        how: r.how,
        createdAt: asIso(r.created_at),
        visitorShort: (r.visitor_id || "").slice(0, 8),
      })),
    };
    return out;
  } catch {
    return emptyStats();
  }
});
