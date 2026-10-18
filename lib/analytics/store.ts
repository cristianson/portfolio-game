/**
 * Where the counters live: Upstash Redis (added from the Vercel Marketplace, which sets
 * KV_REST_API_URL / KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * Without them, in development only, an in-memory copy stands in so /stats can be tried locally.
 *
 * Keys:
 *   c:<day>     hash of daily counters, "<metric>|<key>" → n (kept forever)
 *   v:<day>     set of today's visitor hashes and "<hash>:<event>…" (gone after the day)
 *   salt:<day>  today's random salt for the visitor hash (gone after the day)
 */

import { Redis } from "@upstash/redis";

export interface Store {
  /** Adds 1 to each counter of the day. */
  bump(day: string, fields: string[]): Promise<void>;
  /** True the first time `member` is seen today. */
  firstToday(day: string, member: string): Promise<boolean>;
  /** Today's salt, created on first use. */
  salt(day: string): Promise<string>;
  /** Counters for each of the given days. */
  counters(days: string[]): Promise<Record<string, Record<string, number>>>;
}

/** Day keys expire this long after the day ends (UTC). */
const GRACE_S = 3600;
const endOfDay = (day: string) => Math.floor(Date.parse(`${day}T00:00:00Z`) / 1000) + 86400 + GRACE_S;

function redisStore(redis: Redis): Store {
  return {
    async bump(day, fields) {
      if (!fields.length) return;
      const p = redis.pipeline();
      for (const f of fields) p.hincrby(`c:${day}`, f, 1);
      await p.exec();
    },
    async firstToday(day, member) {
      const p = redis.pipeline();
      p.sadd(`v:${day}`, member);
      p.expireat(`v:${day}`, endOfDay(day));
      const [added] = await p.exec<[number, number]>();
      return added === 1;
    },
    async salt(day) {
      const key = `salt:${day}`;
      const known = await redis.get<string>(key);
      if (known) return known;
      await redis.set(key, crypto.randomUUID(), { nx: true, exat: endOfDay(day) });
      return (await redis.get<string>(key)) ?? "";
    },
    async counters(days) {
      if (!days.length) return {};
      const p = redis.pipeline();
      for (const d of days) p.hgetall(`c:${d}`);
      const rows = await p.exec<(Record<string, number | string> | null)[]>();
      const out: Record<string, Record<string, number>> = {};
      days.forEach((d, i) => {
        const row = rows[i];
        if (row) out[d] = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));
      });
      return out;
    },
  };
}

function memoryStore(): Store {
  const counts = new Map<string, Record<string, number>>();
  const seen = new Map<string, Set<string>>();
  const salts = new Map<string, string>();
  return {
    async bump(day, fields) {
      const row = counts.get(day) ?? {};
      for (const f of fields) row[f] = (row[f] ?? 0) + 1;
      counts.set(day, row);
    },
    async firstToday(day, member) {
      const set = seen.get(day) ?? new Set();
      seen.set(day, set);
      if (set.has(member)) return false;
      set.add(member);
      return true;
    },
    async salt(day) {
      if (!salts.has(day)) salts.set(day, crypto.randomUUID());
      return salts.get(day)!;
    },
    async counters(days) {
      return Object.fromEntries(days.filter((d) => counts.has(d)).map((d) => [d, { ...counts.get(d)! }]));
    },
  };
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

// Kept on globalThis so the dev server's reloads don't wipe the in-memory copy
const g = globalThis as unknown as { __portfolioStatsMemory?: Store };

/** The store, or null in production when no database is connected yet. */
export const store: Store | null =
  url && token
    ? redisStore(new Redis({ url, token }))
    : process.env.NODE_ENV !== "production"
      ? (g.__portfolioStatsMemory ??= memoryStore())
      : null;

export const storeKind = url && token ? "redis" : store ? "memory" : "none";
