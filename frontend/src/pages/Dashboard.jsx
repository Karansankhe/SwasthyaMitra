import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useView } from '../view.js'
import { Card, CardHead, Skeleton, Spinner, ErrorNote, SevPill, Empty, PageHeader, Count, btnGhost } from '../components/ui.jsx'
import { RadarChart, AreaChart } from '../components/Charts.jsx'
import { riskVectors, demandSeries, timeline, toneOf, rankLabel, relatedTransfers, levelScore, up } from '../lib/selectors.js'

export default function Dashboard() {
  const v = useView()
  const { status, errors, report, plan, snapshot, load, data } = v

  const vectors = useMemo(() => riskVectors(report, snapshot), [report, snapshot])
  const demand = useMemo(() => demandSeries(report, plan), [report, plan])
  const groups = useMemo(() => timeline(report), [report])

  const updated = data.at ? new Date(data.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
  const busy = Object.values(status).some((s) => s === 'loading')

  return (
    <div className="px-7 pt-3">
      <PageHeader
        eyebrow="Overview"
        title="Surveillance & Supply"
        subtitle={`Live intelligence for your region${updated ? ` · updated ${updated}` : ''}`}
        right={
          <button onClick={() => load({ force: true })} disabled={busy} className={`${btnGhost} !h-10 !px-4 flex items-center gap-2`}>
            {busy ? <Spinner size={12} /> : <span className="text-brand">↻</span>} Refresh analysis
          </button>
        }
      />

      <Kpis {...v} />

      {/* Visualising the threats */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)' }}>
        <Card i={3}>
          <CardHead title="Compound Risks" sub="Intensity by threat vector · 0–100" right={<IconTile>◎</IconTile>} />
          <div className="px-5 pb-5">
            {vectors ? (
              <RadarChart key={vectors.map((x) => x.value).join()} data={vectors} />
            ) : status.analysis === 'error' ? (
              <ErrorNote title="Analysis unavailable" message={errors.analysis} onRetry={() => load({ force: true })} />
            ) : (
              <AgentProgress />
            )}
          </div>
        </Card>

        <Card i={4}>
          <DemandCard demand={demand} plan={plan} status={status} />
        </Card>
      </div>

      <ResponseDynamics groups={groups} v={v} loading={!groups.length && (status.analysis === 'loading' || status.analysis === 'idle')} />

      <Insights {...v} />
    </div>
  )
}

function IconTile({ children, tone }) {
  return (
    <span
      className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] flex-none"
      style={{ background: tone?.bg || 'rgb(var(--brand) / 0.1)', color: tone?.c || 'rgb(var(--brand))' }}
    >
      {children}
    </span>
  )
}

// ---- KPI stat cards --------------------------------------------------------
function Kpis({ kpi, status, errors }) {
  // Warnings come from /alerts/trigger plus the report's outbreak/compound signals.
  const alertsState =
    status.alerts === 'error' && status.analysis === 'error'
      ? 'error'
      : kpi.alerts === 0 && (status.alerts === 'loading' || status.analysis === 'loading')
        ? 'loading'
        : 'done'
  const cards = [
    {
      label: 'Overall Risk',
      value: kpi.risk,
      tone: kpi.riskTone,
      colored: true,
      sub: 'From the surveillance report',
      state: status.analysis,
      icon: <path d="M8 1.8 14 13.5H2L8 1.8Z M8 6.5v3 M8 11.5h.01" />,
    },
    {
      label: 'Critical Stockouts',
      value: kpi.stockouts,
      tone: toneOf(kpi.stockouts > 5 ? 'HIGH' : kpi.stockouts > 0 ? 'MEDIUM' : 'LOW'),
      sub: kpi.districts != null ? `${kpi.districts} district${kpi.districts === 1 ? '' : 's'} impacted` : 'Inventory status',
      state: status.inventory,
      err: errors.inventory,
      icon: <path d="M2 5l6-3 6 3v6l-6 3-6-3V5Z M2 5l6 3 6-3 M8 8v6" />,
    },
    {
      label: 'Active Alerts',
      value: kpi.alerts,
      tone: toneOf(kpi.alertsHigh ? 'HIGH' : kpi.alerts ? 'MEDIUM' : 'LOW'),
      sub: `${kpi.alertsHigh} high-severity predictive warning${kpi.alertsHigh === 1 ? '' : 's'}`,
      state: alertsState,
      err: errors.alerts,
      icon: <path d="M8 2.5c-2 0-3.2 1.4-3.2 3.4 0 2.6-1 3.6-1.3 4h9c-.3-.4-1.3-1.4-1.3-4 0-2-1.2-3.4-3.2-3.4Z M6.5 12.5a1.5 1.5 0 0 0 3 0" />,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-5 mb-5">
      {cards.map((c, i) => (
        <Card key={c.label} i={i} className="hover-lift px-5 py-[18px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] text-muted font-medium">{c.label}</div>
              {c.value != null ? (
                <div
                  className="text-[30px] font-semibold tracking-[-0.02em] leading-tight mt-1.5 text-navy"
                  style={c.colored ? { color: c.tone.c } : undefined}
                >
                  <Count value={c.value} />
                </div>
              ) : c.state === 'error' || c.state === 'idle' ? (
                <div className="text-[26px] font-semibold text-hint leading-tight mt-1.5" title={c.err}>—</div>
              ) : (
                <Skeleton className="h-8 w-24 mt-2" />
              )}
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-none" style={{ background: c.tone.bg, color: c.tone.c }}>
              <svg width="19" height="19" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {c.icon}
              </svg>
            </div>
          </div>
          <div className="text-[12px] text-faint mt-1.5 leading-snug" title={c.state === 'error' ? c.err : undefined}>
            {c.state === 'error' ? 'Service unavailable' : c.sub}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ---- demand forecast (heart-rate style card) --------------------------------
function DemandCard({ demand, plan, status }) {
  const peak = demand ? demand.points.reduce((m, p) => (p.value > m.value ? p : m), demand.points[0]) : null
  const surge = peak && peak.value >= 115
  return (
    <>
      <CardHead
        title={
          <span className="flex items-center gap-2">
            <span style={{ color: 'rgb(var(--brand))' }}>♥</span> Demand Forecast
          </span>
        }
        sub="Projected demand index · next 14 days · baseline 100"
        right={
          peak ? (
            <SevPill tone={toneOf(surge ? 'AMBER' : 'GREEN')}>{surge ? 'Surge expected' : 'Stable'}</SevPill>
          ) : null
        }
      />
      <div className="px-5 pb-4">
        {demand && (plan || status.plan !== 'loading') ? (
          <div className="flex gap-4 items-stretch">
            <div className="w-[118px] flex-none flex flex-col justify-center gap-4 fade-in">
              <div>
                <div className="text-[34px] font-semibold tracking-[-0.03em] leading-none text-navy">
                  <Count value={peak.value} />
                </div>
                <div className="text-[11px] text-faint mt-1">Peak index</div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-navy">
                  {peak.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-[11px] text-faint">Peak day</div>
              </div>
              {demand.markers.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="w-2 h-2 rounded-sm bg-[#F59E0B]" /> {demand.markers.length} surge event{demand.markers.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <AreaChart points={demand.points} markers={demand.markers} />
            </div>
          </div>
        ) : status.analysis === 'error' ? (
          <ErrorNote title="Forecast unavailable" message="Needs a completed surveillance analysis." />
        ) : status.analysis === 'done' ? (
          <div className="h-[230px] flex flex-col items-center justify-center gap-2 text-[12px] text-muted">
            <Spinner size={20} />
            Resource Forecasting Agent is planning distribution…
          </div>
        ) : (
          <AgentProgress compact />
        )}
        {demand && (
          <div className="pt-1 text-[11px] text-faint">
            Modelled from the plan's predicted deficits, festival dates and pollution lag.
            {status.plan === 'error' && ' Distribution plan unavailable — showing surveillance signals only.'}
          </div>
        )}
      </div>
    </>
  )
}

// ---- streamed agent progress (shown over charts while /analyze/stream runs) --
function AgentProgress({ compact = false }) {
  const { progress } = useView()
  const recent = progress.slice(compact ? -3 : -5)
  return (
    <div className={`relative ${compact ? 'h-[230px]' : 'h-[270px]'} rounded-2xl overflow-hidden`}>
      <div className="absolute inset-0 p-4 flex flex-col gap-3 opacity-70">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="flex-1 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl px-4 py-3 w-full max-w-[320px]">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-navy mb-2">
            <Spinner size={12} /> Agents gathering signals…
          </div>
          {recent.map((p, i) => (
            <div
              key={progress.length - recent.length + i}
              className={`log-in text-[11px] leading-relaxed truncate ${i === recent.length - 1 ? 'text-navy' : 'text-faint'}`}
            >
              {i === recent.length - 1 ? '› ' : '✓ '}
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Response Dynamics: horizontal rail of intervention horizons -------------
// Each horizon is a node on the rail; a connector drops to its action pills and
// a linked detail card. Tabs (or the arrows) slide the rail between horizons.
function ResponseDynamics({ groups, v, loading }) {
  const scroller = useRef(null)
  const cols = useRef([])
  const [active, setActive] = useState(0)

  // Track which horizon is in view while the rail scrolls.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onScroll = () => {
      const x = el.scrollLeft + 40
      let idx = 0
      cols.current.forEach((c, i) => {
        if (c && c.offsetLeft <= x) idx = i
      })
      setActive(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [groups.length])

  const slideTo = (i) => {
    const el = scroller.current
    const col = cols.current[i]
    if (!el || !col) return
    el.scrollTo({ left: col.offsetLeft - 8, behavior: 'smooth' })
    setActive(i)
  }

  return (
    <Card i={5} className="mb-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2 flex-wrap">
        <div>
          <div className="text-[15px] font-semibold text-navy">Response Dynamics</div>
          <div className="text-[11px] text-faint mt-0.5">AI-recommended interventions by horizon</div>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-inset">
          {groups.map((g, i) => (
            <button
              key={g.key}
              onClick={() => slideTo(i)}
              className={`h-8 px-3.5 rounded-full text-[12px] font-medium flex items-center gap-2 transition-all duration-300 ${
                active === i ? 'bg-white text-navy shadow-[0_4px_12px_rgba(20,40,38,0.12)]' : 'text-muted hover:text-navy'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.tone.dot }} />
              {g.label}
            </button>
          ))}
          {groups.length > 1 && (
            <span className="flex ml-1">
              <ArrowBtn dir="‹" onClick={() => slideTo(Math.max(0, active - 1))} />
              <ArrowBtn dir="›" onClick={() => slideTo(Math.min(groups.length - 1, active + 1))} />
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="px-5 pb-5 pt-3 flex gap-5">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[240px] w-[520px] rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Empty>No recommended actions in this report yet.</Empty>
      ) : (
        <div ref={scroller} className="relative overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-5 [scrollbar-width:none]">
          <div className="relative flex pl-5 pr-24 pt-4 w-max">
            {/* the rail */}
            <div className="rail absolute left-0 right-0 top-[34px] h-px" style={{ background: 'linear-gradient(90deg, rgb(var(--brand) / 0.45), rgba(245,158,11,0.45), rgb(var(--brand) / 0.15))' }} />

            {groups.map((g, gi) => (
              <div key={g.key} ref={(el) => (cols.current[gi] = el)} className="relative snap-start w-[560px] flex-none pr-8">
                {/* node */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] ${gi === 0 ? 'node-pulse' : ''} pop-in`}
                  style={{ background: g.tone.dot, boxShadow: `0 0 0 6px ${g.tone.bg}`, animationDelay: `${gi * 0.15}s` }}
                >
                  {gi === 0 ? '!' : gi === 1 ? '7' : '30'}
                </div>
                {/* connector down from node */}
                <div className="connector absolute left-[17px] top-[52px] w-px bottom-3 bg-navy/10" style={{ '--i': gi }} />

                <div className="pl-12 -mt-1">
                  <div className="text-[14px] font-semibold text-navy">{g.label}</div>
                  <div className="text-[11px] text-faint">
                    {g.nodes.length} action{g.nodes.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 mt-4 pl-12">
                  <div className="flex flex-col gap-2.5">
                    {g.nodes.map((n, ni) => (
                      <div
                        key={n.id}
                        className="rise flex items-center gap-3 rounded-full pl-1.5 pr-4 py-1.5 bg-[#5F6966]/90 text-white shadow-[0_6px_16px_rgba(20,40,38,0.14)]"
                        style={{ '--i': gi * 2 + ni }}
                      >
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-none text-[10px] font-semibold text-navy tabular-nums">
                          {shortWhen(n.when)}
                        </span>
                        <span className="text-[12px] leading-snug line-clamp-2">{n.text}</span>
                      </div>
                    ))}
                  </div>
                  <HorizonCard g={g} gi={gi} v={v} />
                </div>
              </div>
            ))}

            {/* end node → ask the assistant */}
            <Link
              to="/dashboard/assistant"
              title="Ask the AI assistant about these actions"
              className="relative z-10 mt-0 w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-[18px] hover:scale-110 transition-transform flex-none"
            >
              +
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}

// Compact badge text for a timeline slot: "10:00" → "10h", "Tue, 29 Sep" → "Tue", "Week 2" → "W2".
function shortWhen(when) {
  const s = String(when)
  if (/^\d\d:00$/.test(s)) return `${s.slice(0, 2)}h`
  if (/^Week \d/.test(s)) return `W${s.slice(5)}`
  return s.split(/[ ,]/)[0].slice(0, 3)
}

function ArrowBtn({ dir, onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 rounded-full text-muted hover:bg-white hover:text-navy transition-colors text-[16px] leading-none">
      {dir}
    </button>
  )
}

// Detail card linked to each horizon on the rail.
function HorizonCard({ g, gi, v }) {
  const { report, weather, warnings, plan } = v
  const events = report?.festival_surge_forecast?.upcoming_events || []
  let title, body
  if (g.key === '24h') {
    const top = warnings[0]
    title = 'Risk snapshot'
    body = (
      <>
        <div className="flex items-center gap-2 mb-2">
          <SevPill tone={toneOf(report?.overall_risk_level)}>{up(report?.overall_risk_level) || '—'}</SevPill>
          {weather && <span className="text-[11px] text-muted">{Math.round(weather.temperature)}°C · AQI {weather.aqi_label}</span>}
        </div>
        {top && (
          <div className="text-[12px] text-body leading-snug">
            <span className="text-faint">Top warning · </span>
            {top.title}
          </div>
        )}
      </>
    )
  } else if (g.key === '7_day') {
    const e = events[0]
    title = 'Surge window'
    body = e ? (
      <>
        <div className="text-[13px] font-semibold text-navy">{e.name}</div>
        <div className="text-[11px] text-muted mt-0.5">{e.dates}</div>
        {e.peak_risk_window && <div className="text-[11px] text-body mt-1.5">Peak: {e.peak_risk_window}</div>}
      </>
    ) : (
      <div className="text-[12px] text-faint">No festival surge flagged this week.</div>
    )
  } else {
    const items = plan?.recommended_procurement || []
    title = 'Procurement'
    body = items.length ? (
      items.slice(0, 3).map((p, i) => (
        <div key={i} className="text-[12px] text-body leading-snug mb-1">• {p}</div>
      ))
    ) : (
      <div className="text-[12px] text-faint">{plan ? 'No procurement recommended.' : 'Awaiting distribution plan…'}</div>
    )
  }
  return (
    <div className="rise glass-strong rounded-[20px] p-4 self-start" style={{ '--i': gi * 2 + 1 }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[13px] font-semibold text-navy">{title}</div>
        <span className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[12px]" style={{ color: g.tone.c }}>
          ⚖
        </span>
      </div>
      {body}
    </div>
  )
}

// ---- bottom: alerts / shortages list + recommendation detail ----------------
function Insights({ warnings, shortages, status, errors, plan }) {
  const [tab, setTab] = useState('warnings')
  const [selId, setSelId] = useState(null)
  const list = tab === 'warnings' ? warnings : shortages
  const sel = list.find((x) => x.id === selId) || list[0] || null

  useEffect(() => setSelId(null), [tab])

  const listLoading =
    tab === 'warnings' ? status.alerts === 'loading' || status.analysis === 'loading' : status.plan === 'loading' || status.analysis === 'loading'
  const listError = tab === 'shortages' && status.plan === 'error' ? errors.plan : null

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)' }}>
      <Card i={6} className="flex flex-col min-h-[380px] overflow-hidden">
        <div className="px-5 pt-4 pb-3 text-[15px] font-semibold text-navy">Critical Alerts &amp; Shortages</div>
        <div className="mx-5 mb-3 p-1 rounded-full glass-inset grid grid-cols-2 gap-1 text-[12px] font-medium">
          {[
            ['warnings', 'Automated Warnings', warnings.length],
            ['shortages', 'Predicted Shortages', shortages.length],
          ].map(([k, label, n]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`h-8 rounded-full transition-all duration-300 ${tab === k ? 'bg-white shadow-[0_4px_12px_rgba(20,40,38,0.12)] text-navy' : 'text-muted hover:text-navy'}`}
            >
              {label} <span className="text-faint tabular-nums">{n}</span>
            </button>
          ))}
        </div>
        <div key={tab} className="flex-1 overflow-auto px-3 pb-3 max-h-[440px]" data-lenis-prevent>
          {list.map((it, idx) => {
            const t = toneOf(it.severity)
            const active = sel?.id === it.id
            return (
              <button
                key={it.id}
                onClick={() => setSelId(it.id)}
                style={{ '--i': idx }}
                className={`rise w-full text-left flex gap-3 p-3 mb-2 rounded-2xl border transition-all duration-300 ${
                  active ? 'bg-white/90 border-white shadow-[0_8px_20px_rgba(20,40,38,0.12)]' : 'border-transparent hover:bg-white/50'
                }`}
              >
                <span className="w-1 self-stretch rounded-full flex-none" style={{ background: t.dot }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="text-[13px] font-semibold text-navy leading-snug line-clamp-2 flex-1">{it.title}</div>
                    <SevPill tone={t}>{rankLabel(it.severity)}</SevPill>
                  </div>
                  <div className="text-[11px] text-muted mt-1 line-clamp-2">{it.desc || it.reason}</div>
                  <div className="text-[10px] text-faint mt-1">{it.source}</div>
                </div>
              </button>
            )
          })}
          {list.length === 0 &&
            (listLoading ? (
              <div className="px-2 flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[62px] w-full rounded-2xl" />
                ))}
              </div>
            ) : listError ? (
              <ErrorNote title="Distribution plan unavailable" message={listError} />
            ) : (
              <Empty>{tab === 'warnings' ? 'No predictive warnings for this region.' : 'No predicted shortages.'}</Empty>
            ))}
        </div>
      </Card>

      <RecommendationPanel item={sel} plan={plan} planStatus={status.plan} />
    </div>
  )
}

function RecommendationPanel({ item, plan, planStatus }) {
  const { list: transfers, exact } = relatedTransfers(item, plan)
  const logisticsAlerts = plan?.redistribution_plan?.logistics_alerts || []
  const t = toneOf(item?.severity)

  return (
    <Card i={7} className="flex flex-col min-h-[380px] overflow-hidden">
      {!item ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty>Select an alert to see the AI's reasoning and recommended logistics actions.</Empty>
        </div>
      ) : (
        <div key={item.id} className="flex flex-col flex-1 fade-in">
          <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(180deg, ${t.bg}, transparent)` }}>
            <div className="flex items-center gap-2 mb-2">
              <SevPill tone={t}>{String(item.severity)}</SevPill>
              <span className="text-[11px] text-muted">{item.source}</span>
            </div>
            <div className="text-[18px] font-semibold tracking-[-0.01em] leading-snug text-navy">{item.title}</div>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4" data-lenis-prevent>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase mb-1.5">AI reasoning</div>
            <div className="text-[13px] text-body leading-relaxed mb-5">
              {[item.desc, item.reason].filter(Boolean).join('. ') || 'No rationale supplied by the agent.'}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
                Recommended logistics actions {!exact && transfers.length > 0 && <span className="normal-case tracking-normal font-normal">· full plan</span>}
              </div>
              <Link to="/dashboard/logistics" className="text-[11px] font-semibold text-brand">
                Open logistics →
              </Link>
            </div>

            {!plan && (planStatus === 'loading' || planStatus === 'idle') ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            ) : transfers.length ? (
              transfers
                .slice()
                .sort((a, b) => levelScore(b.urgency) - levelScore(a.urgency))
                .map((tr, i) => <TransferRow key={tr.id} tr={tr} i={i} />)
            ) : (
              <div className="text-[12px] text-faint py-3">
                {planStatus === 'error' ? 'Distribution plan unavailable.' : 'No transfers recommended.'}
              </div>
            )}

            {logisticsAlerts.length > 0 && (
              <div className="mt-4 rounded-2xl bg-[#FFF7E8]/80 border border-[#F5D9A8]/70 px-3.5 py-3">
                <div className="text-[11px] font-semibold text-[#92400E] mb-1">Logistics alerts</div>
                {logisticsAlerts.map((a, i) => (
                  <div key={i} className="text-[12px] text-[#78350F] leading-relaxed">• {a}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export function TransferRow({ tr, i = 0 }) {
  const t = toneOf(tr.urgency)
  return (
    <div className="rise flex items-center gap-3 p-2.5 pr-3 mb-2 rounded-2xl glass-inset" style={{ '--i': i }}>
      <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-[13px] font-semibold flex-none tabular-nums">
        {String(tr.quantity).slice(0, 4)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-navy truncate">{tr.resource}</div>
        <div className="text-[11px] text-muted truncate">
          {tr.from} <span className="text-brand">→</span> {tr.to}
        </div>
      </div>
      <SevPill tone={t}>{tr.urgency}</SevPill>
    </div>
  )
}
