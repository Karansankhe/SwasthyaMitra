import { useState } from 'react'
import { Card, Badge, Empty, btnPrimary, btnGhost } from '../components/ui.jsx'
import { useDashboard } from '../dashboard.jsx'

export default function SurgeMonitor() {
  const { alerts } = useDashboard()
  const [selected, setSelected] = useState(0)
  const sel = alerts[selected]

  if (!sel) {
    return (
      <div className="p-6 px-[26px]">
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Surge Monitor</h1>
        <Card className="mt-5"><Empty>No alerts in the current analysis.</Empty></Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-full">
      <div className="w-[400px] flex-none border-r border-black/[0.08] flex flex-col">
        <div className="px-[22px] pt-5 pb-3.5">
          <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Surge Monitor</h1>
          <div className="text-[13px] text-muted mt-[3px]">
            {alerts.length} active alert{alerts.length > 1 ? 's' : ''} · sorted by severity
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3.5 pb-[18px]">
          {alerts.map((a, i) => {
            const active = i === selected
            return (
              <div
                key={a.id}
                onClick={() => setSelected(i)}
                className="rounded-[10px] p-3.5 mb-[9px] cursor-pointer border transition-colors"
                style={{
                  borderColor: active ? 'rgba(242,120,92,0.4)' : 'rgba(0,0,0,0.08)',
                  background: active ? 'rgba(242,120,92,0.06)' : '#FFFFFF',
                }}
              >
                <div className="flex items-center gap-[9px] mb-2">
                  <Badge color={a.sevColor} bg={a.sevBg} className="px-[7px] py-[3px] tracking-[0.05em]">{a.sev}</Badge>
                  {a.conf && <span className="ml-auto text-[11px] text-faint">{a.conf}</span>}
                </div>
                <div className="text-[13px] font-semibold leading-[1.35]">{a.title}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
                  {a.fac && <span>{a.fac}</span>}
                  {a.when && <><span className="text-[#CBD0C9]">·</span><span>{a.when}</span></>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-auto px-[26px] py-[22px]">
        <div className="flex items-center gap-[11px] mb-1.5">
          <Badge color={sel.sevColor} bg={sel.sevBg} className="px-[9px] py-1 rounded-md tracking-[0.05em]">{sel.sev}</Badge>
          <span className="text-xs text-muted">{[sel.fac, sel.when, sel.conf].filter(Boolean).join(' · ')}</span>
        </div>
        <h2 className="m-0 mb-5 text-[22px] font-bold tracking-[-0.02em] leading-[1.25]">{sel.title}</h2>

        <div className="grid grid-cols-2 gap-4 mb-[18px]">
          <Card className="px-[17px] py-4">
            <div className="text-xs font-semibold text-muted mb-[9px]">Cause</div>
            <div className="text-[13px] leading-relaxed text-body">{sel.cause || '—'}</div>
          </Card>
          <Card className="px-[17px] py-4">
            <div className="text-xs font-semibold text-muted mb-[11px]">Services impacted</div>
            {sel.forecast?.length ? (
              sel.forecast.map((f) => (
                <div key={f} className="flex gap-[9px] items-start mb-2 text-[13px] text-body leading-snug">
                  <span className="w-[5px] h-[5px] rounded-full bg-brand mt-1.5 flex-none" />
                  {f}
                </div>
              ))
            ) : (
              <div className="text-[13px] text-faint">Not specified.</div>
            )}
          </Card>
        </div>

        {sel.actions?.length > 0 && (
          <Card className="overflow-hidden mb-5">
            <div className="px-[17px] py-3.5 border-b border-black/[0.08] text-[13px] font-semibold">Recommended actions</div>
            {sel.actions.map((ac, i) => (
              <div key={i} className="flex items-center gap-[13px] px-[17px] py-[13px] border-b border-black/[0.05]">
                <span className="w-6 h-6 rounded-md bg-brand/[0.12] text-brand flex items-center justify-center text-xs flex-none">→</span>
                <div className="flex-1 text-[13px]">{ac.t}</div>
              </div>
            ))}
          </Card>
        )}

        <div className="flex gap-3">
          <button className={`${btnPrimary} h-10 px-[22px] text-[13px] font-bold`}>Approve response plan</button>
          <button className={`${btnGhost} h-10 px-5 text-[13px]`}>Dismiss alert</button>
        </div>
      </div>
    </div>
  )
}
