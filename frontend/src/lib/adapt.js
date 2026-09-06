// Maps the backend /analyze response into the view-models the dashboard renders.
// Everything here is defensive — the report is LLM-generated, so fields may be
// missing. Returns null when there is no usable report (→ UI shows empty states).

const SEV = {
  CRITICAL: { c: '#DC2626', bg: 'rgba(248,113,113,0.12)' },
  RED: { c: '#DC2626', bg: 'rgba(248,113,113,0.12)' },
  HIGH: { c: '#D97706', bg: 'rgba(251,191,36,0.12)' },
  AMBER: { c: '#D97706', bg: 'rgba(251,191,36,0.12)' },
  MEDIUM: { c: '#F2785C', bg: 'rgba(242,120,92,0.12)' },
  MODERATE: { c: '#F2785C', bg: 'rgba(242,120,92,0.12)' },
  ELEVATED: { c: '#F2785C', bg: 'rgba(242,120,92,0.12)' },
  LOW: { c: '#1C2220', bg: 'rgba(28,34,32,0.08)' },
  GREEN: { c: '#1C2220', bg: 'rgba(28,34,32,0.08)' },
}
const RANK = { CRITICAL: 0, RED: 0, HIGH: 1, AMBER: 1, MEDIUM: 2, MODERATE: 2, ELEVATED: 2, LOW: 3, GREEN: 3 }

const sev = (label) => SEV[String(label || '').toUpperCase()] || SEV.MEDIUM
const rank = (label) => RANK[String(label || '').toUpperCase()] ?? 2
const up = (s) => String(s || '').toUpperCase()

export function adaptReport(analysis) {
  const report = analysis?.report
  if (!report || report.parse_error || !report.overall_risk_level) return null

  const loc = analysis.location || report.location || {}
  const sa = report.signal_assessment || {}
  const aqi = sa.aqi || {}
  const weather = sa.weather || {}
  const fsf = report.festival_surge_forecast || {}
  const pr = report.pollution_risk || {}
  const outbreaks = sa.outbreak_alerts || []
  const events = fsf.upcoming_events || []
  const compounds = report.compound_risks || []

  // ---- unified alert list -------------------------------------------------
  const alerts = []
  outbreaks.forEach((o, i) => {
    const s = sev(o.severity)
    alerts.push({
      id: 'ob' + i, sev: up(o.severity) || 'ALERT', sevColor: s.c, sevBg: s.bg,
      title: o.signal || 'Outbreak signal', fac: o.source || loc.city || 'Block-wide',
      when: o.date || '', conf: '', impact: '',
      cause: o.signal || '', forecast: [], actions: [], _r: rank(o.severity),
    })
  })
  events.forEach((e, i) => {
    const s = sev(e.risk_rating)
    alerts.push({
      id: 'ev' + i, sev: up(e.risk_rating) || 'EVENT', sevColor: s.c, sevBg: s.bg,
      title: e.name ? `${e.name} — surge window` : 'Event surge',
      fac: loc.city || 'Block-wide', when: e.dates || e.peak_risk_window || '',
      conf: e.attendance ? `~${e.attendance}` : '', impact: '',
      cause: `Peak window: ${e.peak_risk_window || 'n/a'}. Attendance: ${e.attendance || 'n/a'}.`,
      forecast: e.services_impacted || [],
      actions: (fsf.resource_recommendations || []).map((t) => ({ t })),
      _r: rank(e.risk_rating),
    })
  })
  compounds.forEach((c, i) => {
    const s = sev(c.risk_level)
    alerts.push({
      id: 'cr' + i, sev: up(c.risk_level) || 'RISK', sevColor: s.c, sevBg: s.bg,
      title: c.scenario || 'Compound risk', fac: loc.city || 'Block-wide', when: '',
      conf: '', impact: '', cause: c.rationale || '', forecast: [], actions: [], _r: rank(c.risk_level),
    })
  })
  if (pr.protocol_triggered && up(pr.protocol_triggered) !== 'GREEN') {
    const s = sev(pr.protocol_triggered)
    alerts.push({
      id: 'pol', sev: `POLLUTION ${up(pr.protocol_triggered)}`, sevColor: s.c, sevBg: s.bg,
      title: `Pollution protocol ${up(pr.protocol_triggered)}`, fac: loc.city || 'Block-wide',
      when: pr.lag_forecast || '', conf: '', impact: '',
      cause: pr.lag_forecast || 'Air-quality protocol triggered.',
      forecast: pr.interventions || [], actions: [], _r: rank(pr.protocol_triggered),
    })
  }
  alerts.sort((a, b) => a._r - b._r)

  // ---- threat + KPIs ------------------------------------------------------
  const t = sev(report.overall_risk_level)
  const threat = { label: up(report.overall_risk_level), color: t.c, bg: t.bg.replace('0.12', '0.10') }

  const kpis = [
    { label: 'Overall Risk', value: up(report.overall_risk_level) || '—', delta: '', deltaColor: t.c, tone: t.c,
      sub: loc.city ? `${loc.city}${loc.country ? ', ' + loc.country : ''}` : 'block-wide' },
    { label: 'Active Signals', value: String(alerts.length), delta: '', deltaColor: '#D97706', tone: '#D97706',
      sub: `${outbreaks.length} outbreak · ${compounds.length} compound` },
    { label: 'Air Quality', value: aqi.label || (aqi.index != null ? String(aqi.index) : '—'),
      delta: aqi.pm2_5 != null ? `PM2.5 ${aqi.pm2_5}` : '', deltaColor: '#D97706', tone: '#F2785C',
      sub: aqi.pm10 != null ? `PM10 ${aqi.pm10}` : 'air pollution' },
    { label: 'Upcoming Events', value: String(events.length), delta: '', deltaColor: '#5C665F', tone: '#1C2220',
      sub: 'festivals & gatherings' },
  ]

  // ---- weather card -------------------------------------------------------
  const weatherCard =
    weather.temperature != null || aqi.index != null || aqi.label
      ? {
          temp: weather.temperature, humidity: weather.humidity, desc: weather.description,
          aqiLabel: aqi.label, aqiIndex: aqi.index, pm25: aqi.pm2_5, pm10: aqi.pm10,
        }
      : null

  // ---- recommended actions (rail + comms suggestions) --------------------
  const ra = report.recommended_actions || {}
  const actions = []
  ;(ra['24h'] || []).forEach((text) => actions.push({ tag: '24h', text }))
  ;(ra['7_day'] || []).forEach((text) => actions.push({ tag: '7-day', text }))
  ;(ra['30_day'] || []).forEach((text) => actions.push({ tag: '30-day', text }))

  return {
    threat,
    kpis,
    alerts,
    summary: report.executive_summary?.length ? report.executive_summary : null,
    weather: weatherCard,
    events: events.length ? events : null,
    pollution:
      pr.risk_matrix?.length || pr.protocol_triggered
        ? { matrix: pr.risk_matrix || [], protocol: up(pr.protocol_triggered), lag: pr.lag_forecast || '', interventions: pr.interventions || [] }
        : null,
    actions: actions.length ? actions : null,
    dataSources: report.data_sources || [],
    location: loc,
  }
}
