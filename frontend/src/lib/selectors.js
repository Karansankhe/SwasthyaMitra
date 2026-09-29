// Pure functions that turn backend payloads into dashboard view-models.
// Reports are LLM-generated, so every field is treated as optional.

export const up = (s) => String(s ?? '').trim().toUpperCase()
const arr = (x) => (Array.isArray(x) ? x : [])

// ---- severity scale -------------------------------------------------------
const TONES = {
  red: { c: '#DC2626', bg: 'rgba(220,38,38,0.10)', dot: '#EF4444' },
  amber: { c: '#B45309', bg: 'rgba(217,119,6,0.12)', dot: '#F59E0B' },
  green: { c: '#2F7A4F', bg: 'rgba(47,122,79,0.12)', dot: '#34A56A' },
  grey: { c: '#5E6460', bg: 'rgba(17,19,18,0.06)', dot: '#AEB3AF' },
}
const LEVEL = {
  CRITICAL: 95, SEVERE: 90, RED: 90, IMMEDIATE: 90, URGENT: 85, HIGH: 78,
  AMBER: 60, ELEVATED: 58, MEDIUM: 52, MODERATE: 50, LOW: 25, GREEN: 20, MINIMAL: 12,
  // stock / facility states
  'OUT OF STOCK': 95, STOCKOUT: 95, SHORTAGE: 78, NORMAL: 18, STABLE: 18,
  ADEQUATE: 15, SUFFICIENT: 15, HEALTHY: 15, GOOD: 15,
}
export function levelScore(label) {
  const u = up(label)
  if (!u) return 0
  if (LEVEL[u] != null) return LEVEL[u]
  const hit = Object.keys(LEVEL).find((k) => u.includes(k))
  return hit ? LEVEL[hit] : 50
}
export function toneOf(labelOrScore) {
  const s = typeof labelOrScore === 'number' ? labelOrScore : levelScore(labelOrScore)
  if (!s) return TONES.grey
  if (s >= 75) return TONES.red
  if (s >= 45) return TONES.amber
  return TONES.green
}
// Stock status reads differently from risk: "Low" stock is a warning, not calm.
export function stockScore(status) {
  const u = up(status)
  if (/^LOW|DEPLET|RUNNING/.test(u)) return 60
  return levelScore(status)
}
export const stockTone = (status) => toneOf(stockScore(status))

export function rankLabel(label) {
  const s = levelScore(label)
  return s >= 75 ? 'Red' : s >= 45 ? 'Amber' : s ? 'Green' : '—'
}

// ---- raw accessors --------------------------------------------------------
export function reportOf(analysis) {
  const r = analysis?.report
  return r && !r.parse_error && !r.raw_output && r.overall_risk_level ? r : null
}
export const planOf = (plan) => (plan && !plan.parse_error && !plan.raw_output ? plan : null)

export function regionName(session) {
  const g = session?.geo
  if (!g) return session?.query || 'Region'
  return [g.city, g.state].filter(Boolean).join(', ')
}

export const num = (v) => {
  if (typeof v === 'number') return v
  const m = String(v ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

// ---- KPIs -----------------------------------------------------------------
export function kpis({ report, inventory, warnings }) {
  const risk = up(report?.overall_risk_level)
  return {
    risk: risk || null,
    riskTone: toneOf(risk),
    stockouts: inventory ? Number(inventory.critical_stockouts ?? 0) : null,
    districts: inventory ? Number(inventory.districts_impacted ?? 0) : null,
    alerts: warnings.length,
    alertsHigh: warnings.filter((w) => levelScore(w.severity) >= 75).length,
  }
}

// ---- compound risk radar --------------------------------------------------
const WEATHER_RE = /heat|flood|rain|monsoon|cyclone|storm|cold|temperature|humid|drought|weather/i

export function riskVectors(report, snapshot) {
  if (!report) return null
  const sa = report.signal_assessment || {}
  const pr = report.pollution_risk || {}
  const events = arr(report.festival_surge_forecast?.upcoming_events)
  const outbreaks = arr(sa.outbreak_alerts)
  const compounds = arr(report.compound_risks)
  const wx = snapshot?.weather_aqi || {}
  const aqiIdx = num(sa.aqi?.index) ?? num(wx.aqi_index)

  const pollution = Math.max(
    levelScore(pr.protocol_triggered),
    ...arr(pr.risk_matrix).map((m) => levelScore(m.risk)),
    aqiIdx ? Math.min(100, aqiIdx * 18) : 0,
  )
  const outbreak = outbreaks.length
    ? Math.min(100, Math.max(...outbreaks.map((o) => levelScore(o.severity))) + Math.min(12, outbreaks.length * 3))
    : 10
  const festival = events.length ? Math.max(...events.map((e) => levelScore(e.risk_rating))) : 10

  const temp = num(sa.weather?.temperature) ?? num(wx.temperature)
  const hum = num(sa.weather?.humidity) ?? num(wx.humidity)
  const weatherCompound = compounds.filter((c) => WEATHER_RE.test(`${c.scenario} ${c.rationale}`))
  const weather = Math.min(
    100,
    Math.max(
      temp != null ? Math.abs(temp - 25) * 4 + (hum != null && hum > 85 ? 20 : 0) : 0,
      ...weatherCompound.map((c) => levelScore(c.risk_level)),
      12,
    ),
  )
  const compound = compounds.length ? Math.max(...compounds.map((c) => levelScore(c.risk_level))) : 10

  return [
    { axis: 'Pollution', value: Math.round(pollution) },
    { axis: 'Outbreak', value: Math.round(outbreak) },
    { axis: 'Festival Surge', value: Math.round(festival) },
    { axis: 'Weather Extremes', value: Math.round(weather) },
    { axis: 'Compound', value: Math.round(compound) },
  ]
}

// ---- demand forecast ------------------------------------------------------
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// Best-effort parse of the first date in free text like "Oct 2-4, 2026",
// "2 October", or "2026-10-02". Returns null when nothing recognisable is found.
export function parseLooseDate(text, now = new Date()) {
  const s = String(text || '').toLowerCase()
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3])
  const mon = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*'
  let m = s.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:-\\s*\\d{1,2}\\s*)?${mon}`))
  let day, mi
  if (m) [day, mi] = [+m[1], MONTHS.indexOf(m[2])]
  else if ((m = s.match(new RegExp(`${mon}\\s*(\\d{1,2})`)))) [day, mi] = [+m[2], MONTHS.indexOf(m[1])]
  else return null
  const yr = s.match(/\b(20\d{2})\b/)
  let d = new Date(yr ? +yr[1] : now.getFullYear(), mi, day)
  if (!yr && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15)) d = new Date(now.getFullYear() + 1, mi, day)
  return d
}

// Projected demand index over the next 14 days (baseline 100). It is modelled
// from the plan's predicted deficits, festival dates and pollution lag — the
// backend does not return a time series.
export function demandSeries(report, plan, days = 14) {
  if (!report && !plan) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const risk = levelScore(report?.overall_risk_level) / 100
  const shortages = arr(plan?.demand_forecast?.predicted_shortages)
  const deficit = shortages.reduce((t, s) => t + (num(s.expected_deficit) || 0), 0)
  const deficitLift = Math.min(30, deficit / 10 + shortages.length * 3)

  const markers = []
  arr(report?.festival_surge_forecast?.upcoming_events).forEach((e) => {
    const d = parseLooseDate(e.dates || e.peak_risk_window, today)
    if (!d) return
    const idx = Math.round((d - today) / 86400000)
    if (idx >= 0 && idx < days) markers.push({ idx, label: e.name || 'Event', weight: levelScore(e.risk_rating) / 100 || 0.5 })
  })
  const pol = levelScore(report?.pollution_risk?.protocol_triggered)
  if (pol >= 45) markers.push({ idx: 2, label: 'Pollution lag', weight: pol / 140 })

  const points = Array.from({ length: days }, (_, i) => {
    const t = i / (days - 1)
    let v = 100 + risk * 22 * t + deficitLift * t
    markers.forEach((m) => {
      v += 38 * m.weight * Math.exp(-((i - m.idx) ** 2) / 3)
    })
    const date = new Date(today.getTime() + i * 86400000)
    return { i, date, value: Math.round(v) }
  })
  return { points, markers }
}

// ---- alerts & shortages ---------------------------------------------------
export function warningItems(alertsResp, report) {
  const out = []
  arr(alertsResp?.alerts).forEach((a, i) =>
    out.push({
      id: 'w' + i,
      kind: 'warning',
      severity: a.severity || 'Medium',
      title: a.type || 'Predictive warning',
      desc: a.description || '',
      source: 'Automated warning',
    }),
  )
  arr(report?.signal_assessment?.outbreak_alerts).forEach((o, i) =>
    out.push({
      id: 'o' + i,
      kind: 'warning',
      severity: o.severity || 'Medium',
      title: o.signal || 'Outbreak signal',
      desc: [o.source, o.date].filter(Boolean).join(' · '),
      source: 'Surveillance',
    }),
  )
  arr(report?.compound_risks).forEach((c, i) =>
    out.push({
      id: 'c' + i,
      kind: 'warning',
      severity: c.risk_level || 'Medium',
      title: c.scenario || 'Compound risk',
      desc: c.rationale || '',
      source: 'Compound risk',
    }),
  )
  return out.sort((a, b) => levelScore(b.severity) - levelScore(a.severity))
}

const matches = (a, b) => {
  const x = String(a || '').toLowerCase()
  const y = String(b || '').toLowerCase()
  if (!x || !y) return false
  if (x.includes(y) || y.includes(x)) return true
  const words = x.split(/[^a-z0-9]+/).filter((w) => w.length > 2)
  return words.some((w) => y.includes(w))
}

export function transferItems(plan) {
  return arr(planOf(plan)?.redistribution_plan?.transfers).map((t, i) => ({
    id: `t${i}-${String(t.resource_type || '').slice(0, 12)}`,
    from: t.from_location || '—',
    to: t.to_location || '—',
    resource: t.resource_type || 'Resource',
    quantity: t.quantity ?? '—',
    urgency: t.urgency || 'Medium',
  }))
}

export function shortageItems(plan) {
  const p = planOf(plan)
  const transfers = transferItems(plan)
  return arr(p?.demand_forecast?.predicted_shortages)
    .map((s, i) => {
      const related = transfers.filter((t) => matches(s.item, t.resource) || matches(s.area, t.to))
      const urgency = related.length ? related.reduce((m, t) => (levelScore(t.urgency) > levelScore(m) ? t.urgency : m), 'Low') : 'High'
      return {
        id: 's' + i,
        kind: 'shortage',
        severity: urgency,
        title: `${s.item || 'Item'}${s.area ? ` in ${s.area}` : ''}`,
        desc: s.expected_deficit != null ? `Expected deficit: ${s.expected_deficit}` : '',
        reason: s.reason || '',
        item: s.item,
        area: s.area,
        related,
        source: 'Predicted shortage',
      }
    })
    .sort((a, b) => levelScore(b.severity) - levelScore(a.severity))
}

// Transfers relevant to a selected alert; falls back to the whole plan.
export function relatedTransfers(item, plan) {
  const all = transferItems(plan)
  if (!item) return { list: all, exact: false }
  const list = item.related?.length
    ? item.related
    : all.filter((t) => matches(item.title, t.resource) || matches(item.desc, t.resource) || matches(item.area, t.to))
  return list.length ? { list, exact: true } : { list: all, exact: false }
}

// ---- action timeline ------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0')
const fmtDay = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export function timeline(report, now = new Date()) {
  const ra = report?.recommended_actions || {}
  const groups = [
    { key: '24h', label: 'Next 24 hours', tone: TONES.red, items: arr(ra['24h']) },
    { key: '7_day', label: 'This week', tone: TONES.amber, items: arr(ra['7_day']) },
    { key: '30_day', label: 'This month', tone: TONES.green, items: arr(ra['30_day']) },
  ]
  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)

  return groups
    .filter((g) => g.items.length)
    .map((g) => ({
      ...g,
      nodes: g.items.map((text, i) => {
        let when
        if (g.key === '24h') {
          const step = Math.max(1, Math.floor(20 / g.items.length))
          const t = new Date(nextHour.getTime() + i * step * 3600000)
          when = `${pad(t.getHours())}:00`
        } else if (g.key === '7_day') {
          const d = new Date(now.getTime() + (1 + Math.round((i * 6) / Math.max(1, g.items.length))) * 86400000)
          when = fmtDay(d)
        } else {
          when = `Week ${Math.min(4, 1 + Math.floor((i * 4) / Math.max(1, g.items.length)))}`
        }
        return { id: `${g.key}-${i}`, when, text: String(text) }
      }),
    }))
}

// ---- inventory ------------------------------------------------------------
export function inventoryRows(inventory) {
  return arr(inventory?.data).map((r, i) => ({
    id: i,
    district: r.district || '—',
    item: r.item || '—',
    status: r.status || '—',
    stock: num(r.stock_left),
  }))
}
