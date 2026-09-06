import { Link } from 'react-router-dom'
import { Card, Badge, Empty } from '../components/ui.jsx'
import AgentRail from '../components/AgentRail.jsx'
import { useDashboard } from '../dashboard.jsx'
import { useStore } from '../store.jsx'

export default function CommandCenter() {
  const { session, analyzing, analyzeError, runAnalysis } = useStore()
  const { ready, kpis, alerts, summary, weather } = useDashboard()
  const blockName = session?.location?.name ?? 'Your block'

  return (
    <div className="flex min-h-full">
      <div className="flex-1 min-w-0 p-6 pb-7">
        <div className="mb-5">
          <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Command Center</h1>
          <div className="text-[13px] text-muted mt-[3px]">
            {blockName} · {analyzing ? 'analysing…' : ready ? 'live intelligence from analysis' : 'awaiting analysis'}
          </div>
        </div>

        {!ready ? (
          <Card className="px-6 py-14">
            <div className="flex flex-col items-center text-center gap-3">
              {analyzing ? (
                <>
                  <Spinner />
                  <div className="text-[14px] font-semibold">Gathering live intelligence for {blockName}…</div>
                  <div className="text-[12px] text-muted max-w-[440px] leading-relaxed">
                    The agents are fusing weather, AQI, the festival calendar and outbreak signals into a
                    readiness report. This can take up to a minute.
                  </div>
                </>
              ) : analyzeError ? (
                <>
                  <div className="text-[14px] font-semibold text-danger">Analysis service unavailable</div>
                  <div className="text-[12px] text-muted max-w-[440px]">{analyzeError}</div>
                  <button onClick={() => runAnalysis()} className="mt-1 h-10 px-5 rounded-full bg-brand hover:bg-brand-dark text-white text-[13px] font-bold cursor-pointer border-0 transition-colors">
                    Retry analysis
                  </button>
                </>
              ) : (
                <>
                  <div className="text-[14px] font-semibold">No analysis yet</div>
                  <div className="text-[12px] text-muted max-w-[440px]">Pull live surge intelligence for {blockName}.</div>
                  <button onClick={() => runAnalysis()} className="mt-1 h-10 px-5 rounded-full bg-brand hover:bg-brand-dark text-white text-[13px] font-bold cursor-pointer border-0 transition-colors">
                    Run analysis
                  </button>
                </>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3.5 mb-5">
              {kpis.map((k) => (
                <Card key={k.label} className="px-4 pt-4 pb-[15px]">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-[7px] h-[7px] rounded-[2px]" style={{ background: k.tone }} />
                    {k.label}
                  </div>
                  <div className="flex items-baseline gap-2 mt-3">
                    <div className="text-[26px] font-bold tracking-[-0.02em] tabular-nums">{k.value}</div>
                    {k.delta && <div className="text-xs font-semibold" style={{ color: k.deltaColor }}>{k.delta}</div>}
                  </div>
                  <div className="text-[11px] text-faint mt-1.5">{k.sub}</div>
                </Card>
              ))}
            </div>

            {/* Executive summary + weather */}
            <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: weather ? '1fr 300px' : '1fr' }}>
              <Card className="px-5 py-[18px]">
                <div className="text-[13px] font-semibold mb-3">Executive summary</div>
                {summary ? (
                  summary.map((s, i) => (
                    <div key={i} className="flex gap-2.5 items-start mb-2.5 text-[13px] text-body leading-snug">
                      <span className="w-[5px] h-[5px] rounded-full bg-brand mt-1.5 flex-none" />
                      {s}
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] text-faint">No summary in this report.</div>
                )}
              </Card>

              {weather && (
                <Card className="px-5 py-[18px]">
                  <div className="text-[13px] font-semibold mb-3">Weather &amp; air quality</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-[30px] font-bold tabular-nums">{weather.temp != null ? `${weather.temp}°` : '—'}</div>
                    <div className="text-xs text-muted">{weather.desc || ''}</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-[12px]">
                    <Field label="Humidity" value={weather.humidity != null ? `${weather.humidity}%` : '—'} />
                    <Field label="AQI" value={weather.aqiLabel || (weather.aqiIndex ?? '—')} />
                    <Field label="PM2.5" value={weather.pm25 ?? '—'} />
                    <Field label="PM10" value={weather.pm10 ?? '—'} />
                  </div>
                </Card>
              )}
            </div>

            {/* Active alerts */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/[0.08]">
                <div className="text-[13px] font-semibold">Active Surge Alerts</div>
                <Link to="/app/alerts" className="text-xs">Open Surge Monitor →</Link>
              </div>
              {alerts.length === 0 && <Empty>No active alerts in this report.</Empty>}
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-black/[0.05]">
                  <Badge color={a.sevColor} bg={a.sevBg} className="px-2 py-1">{a.sev}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px]">{a.title}</div>
                    <div className="text-xs text-muted mt-0.5 truncate">
                      {[a.fac, a.when].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>

      <AgentRail />
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-faint">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-6 h-6 rounded-full border-[3px] border-brand/25 border-t-brand"
      style={{ animation: 'spin 0.7s linear infinite' }}
    />
  )
}
