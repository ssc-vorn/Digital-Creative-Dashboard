/**
 * Deterministic helpers for mock data. All datasets are generated from a
 * fixed seed so server and client renders always agree.
 */

export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xFFFFFFFF
  }
}

/** Anchor "today" used by all mock dates so datasets stay coherent. */
export const MOCK_NOW = new Date()
MOCK_NOW.setMinutes(0, 0, 0)

export function daysAgo(days: number, hourOffset = 0): string {
  const d = new Date(MOCK_NOW)
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hourOffset)
  return d.toISOString()
}

export function daysAhead(days: number): string {
  const d = new Date(MOCK_NOW)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)] as T
}

export function pickMany<T>(rng: () => number, list: readonly T[], count: number): T[] {
  const pool = [...list]
  const out: T[] = []
  while (out.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length)
    out.push(...pool.splice(idx, 1))
  }
  return out
}

export function between(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

let idCounter = 0
export function mockId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${idCounter.toString(36).padStart(4, '0')}`
}

/** Deterministic trend series generator for charts. */
export function trendSeries(seed: number, days: number, base: number, variance: number): { date: string, value: number }[] {
  const rng = createRng(seed)
  const points: { date: string, value: number }[] = []
  let value = base
  for (let i = days - 1; i >= 0; i--) {
    value = Math.max(0, value + (rng() - 0.45) * variance)
    points.push({ date: daysAgo(i).slice(0, 10), value: Math.round(value) })
  }
  return points
}
