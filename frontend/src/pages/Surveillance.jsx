import { useView } from '../view.js'
import { Card, CardHead, Skeleton, ErrorNote, SevPill, Empty, PageHeader } from '../components/ui.jsx'
import { toneOf, up } from '../lib/selectors.js'

// Full surveillance report from /surveillance/analyze(/stream) + the live
// snapshot (weather, pollutants, health news).
export default function Surveillance() {
  const { report, weather, news, status, errors, load } = useView()
  const analysing = status.analysis === 'loading' || status.analysis === 'idle'

  const sa = report?.signal_assessment || {}
  const fsf = report?.festival_surge_forecast || {}
  const pr = report?.pollution_risk || {}
  const outbreaks = sa.outbreak_alerts || []
  const events = fsf.upcoming_events || []
  const compounds = report?.compound_risks || []
  const risk = toneOf(report?.overall_risk_level)
  const protocol = toneOf(pr.protocol_triggered)

  return (
    <div className="px-7 pt-3">
      <PageHeader
        eyebrow="Surveillance"
        title="Health Surveillance"
        subtitle="Signals from the Signal Collector, Festival Surge and Pollution Risk agents"
        right={report && (
          <div className="flex items-center gap-2">
            <SevPill tone={risk} className="!text-[11px] !px-3 !py-1.5">Overall {up(report.overall_risk_level)}</SevPill>
            {pr.protocol_triggered && (
              <SevPill tone={protocol} className="!text-[11px] !px-3 !py-1.5">Protocol {up(pr.protocol_triggered)}</SevPill>
            )}
          </div>
        )}
      />

      <div className="mb-4">
        <Card i={1}>
          <CardHead title="Executive summary" sub={report?.generated_at ? `Generated ${new Date(report.generated_at).toLocaleString()}` : undefined} />
          <div className="px-5 pb-5">
            {report?.executive_summary?.length ? (
              report.executive_summary.map((s, i) => (
                <div key={i} className="flex gap-3 items-start mb-2.5 text-[13px] text-body leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center flex-none mt-0.5">{i + 1}</span>
                  {s}
                </div>
              ))
            ) : analysing ? (
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : status.analysis === 'error' ? (
              <ErrorNote title="Analysis unavailable" message={errors.analysis} onRetry={() => load({ force: true })} />
            ) : (
              <Empty>No summary in this report.</Empty>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-4">
        <Card i={3} className="col-span-1">
          <CardHead title="Weather & pollutants" sub="Live snapshot" />
          <div className="px-5 pb-5">
            {weather ? (
              <>
                <div className="flex items-baseline gap-2 mb-3">
                  <div className="text-[34px] font-bold tabular-nums leading-none">{weather.temperature != null ? `${Math.round(weather.temperature)}°` : '—'}</div>
                  <div className="text-[12px] text-muted capitalize">{weather.description}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Humidity', weather.humidity, '%'],
                    ['Wind', weather.wind_speed, ' m/s'],
                    ['AQI', weather.aqi_label, ''],
                    ['PM2.5', weather.pm2_5, ''],
                    ['PM10', weather.pm10, ''],
                    ['NO₂', weather.no2, ''],
                  ].map(([k, val, unit]) => (
                    <div key={k} className="rounded-xl glass-inset px-2.5 py-2">
                      <div className="text-[10px] text-faint">{k}</div>
                      <div className="text-[13px] font-semibold tabular-nums">{val != null ? `${typeof val === 'number' ? Math.round(val * 10) / 10 : val}${unit}` : '—'}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : status.snapshot === 'loading' ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <ErrorNote title="Snapshot unavailable" message={errors.snapshot} />
            )}
          </div>
        </Card>

        <Card i={4} className="col-span-2">
          <CardHead title="Outbreak alerts" sub={`${outbreaks.length} signal${outbreaks.length === 1 ? '' : 's'} detected`} />
          <div className="px-5 pb-5">
            {analysing ? (
              <Skeleton className="h-[150px] w-full" />
            ) : outbreaks.length ? (
              <div className="grid grid-cols-2 gap-2.5">
                {outbreaks.map((o, i) => (
                  <div key={i} className="rounded-2xl glass-inset p-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <SevPill tone={toneOf(o.severity)}>{o.severity || '—'}</SevPill>
                      <span className="text-[10px] text-faint">{o.date}</span>
                    </div>
                    <div className="text-[13px] font-semibold leading-snug">{o.signal}</div>
                    {o.source && <div className="text-[11px] text-muted mt-1">{o.source}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <Empty>No outbreak signals.</Empty>
            )}
            {sa.emr_signals?.length > 0 && (
              <div className="mt-3 text-[12px] text-body">
                <span className="font-semibold">EMR signals: </span>
                {sa.emr_signals.join(' · ')}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 mb-4" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <Card i={5}>
          <CardHead title="Festival surge forecast" sub="Mass-gathering risk windows" />
          <div className="px-5 pb-5">
            {analysing ? (
              <Skeleton className="h-[160px] w-full" />
            ) : events.length ? (
              events.map((e, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-black/[0.05] last:border-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none text-[16px]" style={{ background: toneOf(e.risk_rating).bg }}>
                    ✦
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-semibold flex-1 truncate">{e.name}</div>
                      <SevPill tone={toneOf(e.risk_rating)}>{e.risk_rating || '—'}</SevPill>
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {[e.dates, e.attendance && `~${e.attendance} attendees`].filter(Boolean).join(' · ')}
                    </div>
                    {e.peak_risk_window && <div className="text-[11px] text-body mt-1">Peak: {e.peak_risk_window}</div>}
                    {e.services_impacted?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {e.services_impacted.map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full glass-inset text-muted">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty>No upcoming events flagged.</Empty>
            )}
            {fsf.resource_recommendations?.length > 0 && (
              <div className="mt-3 rounded-xl bg-brand/[0.06] px-3.5 py-3">
                <div className="text-[11px] font-semibold text-brand mb-1">Resource recommendations</div>
                {fsf.resource_recommendations.map((r, i) => (
                  <div key={i} className="text-[12px] text-body leading-relaxed">• {r}</div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card i={6}>
          <CardHead title="Pollution risk matrix" sub={pr.lag_forecast || 'Pollutant thresholds & protocols'} />
          <div className="px-5 pb-5">
            {analysing ? (
              <Skeleton className="h-[160px] w-full" />
            ) : pr.risk_matrix?.length ? (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-faint">
                    <th className="font-medium pb-2">Pollutant</th>
                    <th className="font-medium pb-2">Value</th>
                    <th className="font-medium pb-2">Risk</th>
                    <th className="font-medium pb-2">Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {pr.risk_matrix.map((m, i) => (
                    <tr key={i} className="border-t border-black/[0.05] align-top">
                      <td className="py-2 font-semibold">{m.pollutant}</td>
                      <td className="py-2 tabular-nums">
                        {m.value} <span className="text-faint">{m.unit}</span>
                      </td>
                      <td className="py-2"><SevPill tone={toneOf(m.risk)}>{m.risk || '—'}</SevPill></td>
                      <td className="py-2 text-body">{m.protocol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty>No pollution matrix in this report.</Empty>
            )}
            {pr.interventions?.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-muted mb-1">Interventions</div>
                {pr.interventions.map((r, i) => (
                  <div key={i} className="text-[12px] text-body leading-relaxed">• {r}</div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <Card i={7}>
          <CardHead title="Compound risks" sub="Where signals overlap" />
          <div className="px-5 pb-5">
            {analysing ? (
              <Skeleton className="h-[120px] w-full" />
            ) : compounds.length ? (
              compounds.map((c, i) => (
                <div key={i} className="py-3 border-b border-black/[0.05] last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[13px] font-semibold flex-1">{c.scenario}</div>
                    <SevPill tone={toneOf(c.risk_level)}>{c.risk_level || '—'}</SevPill>
                  </div>
                  <div className="text-[12px] text-muted leading-relaxed">{c.rationale}</div>
                </div>
              ))
            ) : (
              <Empty>No compound risks identified.</Empty>
            )}
          </div>
        </Card>

        <Card i={8}>
          <CardHead title="Health news" sub="Top stories from the snapshot" />
          <div className="px-5 pb-5">
            {status.snapshot === 'loading' ? (
              <Skeleton className="h-[120px] w-full" />
            ) : news.length ? (
              news.slice(0, 6).map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noreferrer" className="block py-2.5 border-b border-black/[0.05] last:border-0 group">
                  <div className="text-[13px] font-semibold text-ink group-hover:text-brand leading-snug">{n.title}</div>
                  <div className="text-[11px] text-faint mt-0.5">
                    {[n.source, n.published_at && new Date(n.published_at).toLocaleDateString()].filter(Boolean).join(' · ')}
                  </div>
                </a>
              ))
            ) : (
              <Empty>No news available.</Empty>
            )}
            {report?.data_sources?.length > 0 && (
              <div className="mt-3 text-[11px] text-faint">Sources: {report.data_sources.join(' · ')}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
