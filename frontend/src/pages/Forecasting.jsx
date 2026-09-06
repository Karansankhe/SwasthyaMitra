import { Card, Badge, Empty, Bar } from '../components/ui.jsx'
import { useDashboard } from '../dashboard.jsx'

const sev = (label) => {
  const l = String(label || '').toUpperCase()
  if (l === 'CRITICAL' || l === 'RED') return { c: '#DC2626', bg: 'rgba(248,113,113,0.12)' }
  if (l === 'HIGH' || l === 'AMBER') return { c: '#D97706', bg: 'rgba(251,191,36,0.12)' }
  return { c: '#F2785C', bg: 'rgba(242,120,92,0.12)' }
}

export default function Forecasting() {
  const { ready, events, pollution } = useDashboard()

  if (!ready) {
    return (
      <div className="p-6 px-[26px]">
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Forecasting</h1>
        <Card className="mt-5"><Empty>Run an analysis to see surge and pollution forecasts.</Empty></Card>
      </div>
    )
  }

  return (
    <div className="p-6 pb-7 px-[26px]">
      <div className="mb-5">
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Forecasting</h1>
        <div className="text-[13px] text-muted mt-[3px]">Festival surge windows &amp; pollution risk from the latest analysis</div>
      </div>

      {/* Festival surge forecast */}
      <Card className="overflow-hidden mb-5">
        <div className="px-[17px] py-3.5 border-b border-black/[0.08] text-[13px] font-semibold">Upcoming events &amp; surge windows</div>
        {!events?.length && <Empty>No upcoming events identified.</Empty>}
        {events?.map((e, i) => {
          const s = sev(e.risk_rating)
          return (
            <div key={i} className="px-[17px] py-3.5 border-b border-black/[0.05]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Badge color={s.c} bg={s.bg} className="px-2 py-0.5">{String(e.risk_rating || 'EVENT').toUpperCase()}</Badge>
                <div className="text-[13px] font-semibold">{e.name || 'Event'}</div>
                <div className="ml-auto text-[11px] text-faint">{e.dates || ''}</div>
              </div>
              <div className="text-[12px] text-muted">
                Peak window: <span className="text-body font-medium">{e.peak_risk_window || 'n/a'}</span>
                {e.attendance ? <> · Attendance ~{e.attendance}</> : null}
              </div>
              {e.services_impacted?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {e.services_impacted.map((svc) => (
                    <span key={svc} className="text-[11px] rounded-full bg-black/[0.05] px-2 py-0.5 text-body">{svc}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </Card>

      {/* Pollution risk */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-[17px] py-3.5 border-b border-black/[0.08]">
          <div className="text-[13px] font-semibold">Pollution risk</div>
          {pollution?.protocol && (
            <Badge color={sev(pollution.protocol).c} bg={sev(pollution.protocol).bg} className="px-2 py-0.5">
              {pollution.protocol} PROTOCOL
            </Badge>
          )}
        </div>
        {!pollution ? (
          <Empty>No pollution assessment in this report.</Empty>
        ) : (
          <div className="px-[17px] py-4">
            {pollution.lag && <div className="text-[13px] text-body mb-3">{pollution.lag}</div>}
            {pollution.matrix?.map((m, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-body">{m.pollutant} {m.value != null ? `· ${m.value}${m.unit || ''}` : ''}</span>
                  <span className="font-semibold" style={{ color: sev(m.risk).c }}>{m.risk || ''}</span>
                </div>
                <Bar pct={{ LOW: 25, MODERATE: 55, MEDIUM: 55, HIGH: 80, CRITICAL: 100 }[String(m.risk || '').toUpperCase()] || 40} color={sev(m.risk).c} className="h-[5px]" />
              </div>
            ))}
            {pollution.interventions?.length ? (
              <div className="mt-4">
                <div className="text-xs font-semibold text-muted mb-2">Interventions</div>
                {pollution.interventions.map((t) => (
                  <div key={t} className="flex gap-2.5 items-start mb-2 text-[13px] text-body leading-snug">
                    <span className="w-[5px] h-[5px] rounded-full bg-brand mt-1.5 flex-none" />
                    {t}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}
