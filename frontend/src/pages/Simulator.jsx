import { useState } from 'react'
import { OUTBREAK_LABELS, simOutcome, simPlan } from '../data.js'
import { Card, btnPrimary } from '../components/ui.jsx'

export default function Simulator() {
  const [aqi, setAqi] = useState(320)
  const [festival, setFestival] = useState(60)
  const [outbreak, setOutbreak] = useState(2)

  const outcome = simOutcome({ aqi, festival, outbreak })
  const plan = simPlan(outcome)

  return (
    <div className="p-6 pb-7 px-[26px]">
      <div className="mb-5">
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Scenario Simulator</h1>
        <div className="text-[13px] text-muted mt-[3px]">Model a hypothetical surge and preview the recommended plan</div>
      </div>

      <div className="grid gap-[18px]" style={{ gridTemplateColumns: '380px 1fr' }}>
        {/* Inputs */}
        <Card className="px-6 py-[22px]">
          <div className="text-[13px] font-semibold mb-[22px]">Scenario inputs</div>

          <Slider label="Air quality (AQI)" value={aqi} display={aqi} min={50} max={500} onChange={setAqi} lo="Good" hi="Severe" />
          <Slider label="Festival intensity" value={festival} display={`${festival}%`} min={0} max={100} onChange={setFestival} lo="Quiet" hi="Peak Diwali" />
          <Slider label="Outbreak severity" value={outbreak} display={OUTBREAK_LABELS[outbreak]} min={0} max={4} onChange={setOutbreak} lo="None" hi="Epidemic" last />
        </Card>

        {/* Outcome */}
        <div className="flex flex-col gap-[18px]">
          <Card className="px-6 py-[22px]">
            <div className="flex items-center gap-3 mb-5">
              <div className="text-[13px] font-semibold">Simulated outcome</div>
              <span className="text-[10px] font-bold tracking-[0.05em] rounded-md px-2.5 py-1" style={{ color: outcome.level.c, background: outcome.level.bg }}>
                {outcome.level.l} SURGE
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Stat value={`+${outcome.surplus}`} label="surplus patients/day" color={outcome.level.c} />
              <Stat value={outcome.beds} label="surge beds needed" />
              <Stat value={outcome.staff} label="extra shifts" />
              <Stat value={outcome.o2} label="O₂ cylinders" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black/[0.08] text-[13px] font-semibold">Recommended plan</div>
            {plan.map((p) => (
              <div key={p.t} className="flex items-start gap-[13px] px-5 py-3.5 border-b border-black/[0.05]">
                <span className="w-[22px] h-[22px] rounded-md bg-brand/[0.12] text-brand flex items-center justify-center text-[11px] flex-none mt-px">✓</span>
                <div>
                  <div className="text-[13px] font-semibold">{p.t}</div>
                  <div className="text-xs text-muted mt-0.5">{p.d}</div>
                </div>
              </div>
            ))}
            <div className="px-5 py-4">
              <button className={`${btnPrimary} h-[38px] px-5 text-[13px] font-bold rounded-[9px]`}>Save as response playbook</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Slider({ label, value, display, min, max, onChange, lo, hi, last }) {
  return (
    <div className={last ? 'mb-1.5' : 'mb-[26px]'}>
      <div className="flex justify-between mb-3">
        <span className="text-[13px] text-body">{label}</span>
        <span className="text-[15px] font-bold text-brand tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full cursor-pointer"
        style={{ accentColor: '#F2785C' }}
      />
      <div className="flex justify-between text-[10px] text-faint mt-[5px]">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div>
      <div className="text-[30px] font-bold tabular-nums" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[11px] text-muted mt-[3px]">{label}</div>
    </div>
  )
}
