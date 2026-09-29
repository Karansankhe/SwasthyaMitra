// View-models for the Logistics "Schedule" view: facilities (from inventory +
// transfer endpoints) and calendar bars (transfers, surge events, actions).
import { levelScore, stockScore, parseLooseDate, num } from './selectors.js'

const DAY = 86400000
export const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
export const addDays = (d, n) => new Date(startOfDay(d).getTime() + n * DAY)
export const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime()
const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

// ---- facilities -------------------------------------------------------------
export function facilities(rows, transfers) {
  const map = new Map()
  const get = (name) => {
    if (!map.has(name)) map.set(name, { name, items: [], incoming: [], outgoing: [] })
    return map.get(name)
  }
  rows.forEach((r) => get(r.district).items.push(r))
  transfers.forEach((t) => {
    if (t.from && t.from !== '—') get(t.from).outgoing.push(t)
    if (t.to && t.to !== '—') get(t.to).incoming.push(t)
  })
  return [...map.values()]
    .map((f) => {
      const critical = f.items.filter((r) => stockScore(r.status) >= 75).length
      const low = f.items.filter((r) => {
        const s = stockScore(r.status)
        return s >= 45 && s < 75
      }).length
      const healthy = f.items.length - critical - low
      const urgency = Math.max(0, ...f.incoming.map((t) => levelScore(t.urgency)))
      return { ...f, critical, low, healthy, urgency }
    })
    .sort((a, b) => b.critical - a.critical || b.urgency - a.urgency || b.incoming.length - a.incoming.length)
}

// ---- calendar bars ----------------------------------------------------------
// The plan carries urgency, not dates, so a dispatch window is derived from it.
function transferWindow(urgency) {
  const s = levelScore(urgency)
  if (s >= 90) return [0, 1]
  if (s >= 75) return [1, 2]
  if (s >= 45) return [2, 4]
  return [4, 7]
}

// "Oct 2-10, 2026" → end date; "2026-10-10 to 2026-10-18" → second date.
function endOf(text, start) {
  const s = String(text || '')
  const iso = s.match(/\d{4}-\d{2}-\d{2}.*?(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3])
  const range = s.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})(?!\d)/)
  if (range && start) {
    const end = new Date(start.getFullYear(), start.getMonth(), +range[2])
    return end >= start ? end : new Date(start.getFullYear(), start.getMonth() + 1, +range[2])
  }
  return start
}

export function scheduleBars({ transfers, board, report, today = new Date() }) {
  const t0 = startOfDay(today)
  const bars = []

  transfers.forEach((t) => {
    const [a, b] = transferWindow(t.urgency)
    const stage = board[t.id]?.stage || 'pending'
    bars.push({
      id: 'tr-' + t.id,
      kind: 'transfer',
      stage,
      label: `${t.resource} ×${t.quantity}`,
      detail: `${t.from} → ${t.to}`,
      urgency: t.urgency,
      start: addDays(t0, a),
      end: addDays(t0, b),
      facilities: [t.from, t.to],
      units: num(t.quantity) || 0,
    })
  })

  ;(report?.festival_surge_forecast?.upcoming_events || []).forEach((e, i) => {
    const start = parseLooseDate(e.dates || e.peak_risk_window, t0)
    if (!start) return
    bars.push({
      id: 'ev-' + i,
      kind: 'event',
      label: e.name || 'Surge event',
      detail: e.peak_risk_window || e.dates || '',
      urgency: e.risk_rating,
      start: startOfDay(start),
      end: startOfDay(endOf(e.dates, start)),
      facilities: [],
    })
  })

  const now = report?.recommended_actions?.['24h'] || []
  if (now.length) {
    bars.push({
      id: 'act-24h',
      kind: 'action',
      label: `${now.length} action${now.length > 1 ? 's' : ''} due`,
      detail: now[0],
      urgency: 'HIGH',
      start: t0,
      end: t0,
      facilities: [],
    })
  }
  return bars.map((b) => ({ ...b, range: sameDay(b.start, b.end) ? fmt(b.start) : `${fmt(b.start)} – ${fmt(b.end)}` }))
}

// Weeks (Mon–Sun) covering the month of `anchor`.
export function monthWeeks(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const start = addDays(first, -((first.getDay() + 6) % 7))
  const weeks = []
  for (let d = start; d <= last || weeks.length < 5; d = addDays(d, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)))
    if (weeks.length >= 6) break
  }
  return weeks
}

// Place bars that overlap a week into non-colliding lanes.
export function layoutWeek(week, bars) {
  const ws = week[0].getTime()
  const we = week[6].getTime()
  const placed = []
  bars
    .filter((b) => b.start.getTime() <= we && b.end.getTime() >= ws)
    .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
    .forEach((b) => {
      const c0 = Math.max(0, Math.round((b.start.getTime() - ws) / DAY))
      const c1 = Math.min(6, Math.round((b.end.getTime() - ws) / DAY))
      let lane = 0
      while (placed.some((p) => p.lane === lane && !(c1 < p.c0 || c0 > p.c1))) lane++
      placed.push({ bar: b, c0, c1, lane, clipL: b.start.getTime() < ws, clipR: b.end.getTime() > we })
    })
  return placed
}
