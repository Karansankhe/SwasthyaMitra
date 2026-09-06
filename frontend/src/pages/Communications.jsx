import { useState } from 'react'
import { CHANNELS, DIALECTS, SEGMENTS } from '../data.js'
import { Card, Empty, btnPrimary, btnGhost } from '../components/ui.jsx'
import { useDashboard } from '../dashboard.jsx'

export default function Communications() {
  const { actions } = useDashboard()
  const [channels, setChannels] = useState({ SMS: true, IVR: false, WhatsApp: true })
  const [dialect, setDialect] = useState('Awadhi')
  const [segments, setSegments] = useState({ All: false, 'High-risk (elderly)': true, 'Children <5': true, 'ASHA workers': false })
  const [message, setMessage] = useState('')

  const toggleChannel = (c) => setChannels((s) => ({ ...s, [c]: !s[c] }))
  const toggleSegment = (k) => setSegments((s) => ({ ...s, [k]: !s[k] }))
  const activeChannels = Object.values(channels).filter(Boolean).length

  return (
    <div className="p-6 pb-7 px-[26px]">
      <div className="mb-5">
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">Communications</h1>
        <div className="text-[13px] text-muted mt-[3px]">Compose a multilingual advisory · powered by Bhashini</div>
      </div>

      <div className="grid gap-[18px]" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Composer */}
        <Card className="px-[22px] py-5">
          <Label>Channels</Label>
          <div className="flex gap-2.5 mb-5">
            {CHANNELS.map((c) => {
              const on = channels[c]
              return (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  className="flex-1 h-[52px] flex flex-col items-center justify-center gap-[3px] rounded-[9px] cursor-pointer transition-colors"
                  style={{
                    background: on ? 'rgba(242,120,92,0.10)' : '#F3F3F2',
                    color: on ? '#F2785C' : '#5C665F',
                    boxShadow: on ? 'inset 0 0 0 1px rgba(242,120,92,0.4)' : 'inset 0 0 0 1px rgba(0,0,0,0.10)',
                  }}
                >
                  <span className="text-[13px] font-semibold">{c}</span>
                  <span className="text-[10px] opacity-70">{on ? 'On' : 'Off'}</span>
                </button>
              )
            })}
          </div>

          <Label>Dialect (Bhashini)</Label>
          <div className="flex flex-wrap gap-2 mb-5">
            {DIALECTS.map((d) => {
              const active = d === dialect
              return (
                <button
                  key={d}
                  onClick={() => setDialect(d)}
                  className="h-8 px-3.5 flex items-center rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  style={{
                    color: active ? '#1C2220' : '#5C665F',
                    background: active ? 'rgba(242,120,92,0.10)' : 'transparent',
                    boxShadow: active ? 'inset 0 0 0 1px rgba(242,120,92,0.35)' : 'inset 0 0 0 1px rgba(0,0,0,0.09)',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>

          <Label>Audience segmentation</Label>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {SEGMENTS.map((k) => {
              const on = segments[k]
              return (
                <button
                  key={k}
                  onClick={() => toggleSegment(k)}
                  className="flex items-center gap-2.5 h-[42px] px-[13px] rounded-[9px] border border-black/[0.09] bg-field cursor-pointer text-[13px] text-left"
                >
                  <span
                    className="w-[17px] h-[17px] rounded-[5px] flex-none flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ border: `1.5px solid ${on ? '#F2785C' : 'rgba(0,0,0,0.24)'}`, background: on ? '#F2785C' : 'transparent' }}
                  >
                    {on ? '✓' : ''}
                  </span>
                  {k}
                </button>
              )
            })}
          </div>

          <Label>Message ({dialect})</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write an advisory, or load one from a recommended action →"
            className="w-full min-h-[110px] border border-black/[0.10] rounded-[10px] bg-field px-[15px] py-3.5 text-[13px] leading-relaxed text-body outline-none focus:border-brand resize-y"
          />

          <div className="flex items-center gap-3.5 mt-[18px]">
            <button className={`${btnPrimary} h-10 px-[22px] text-[13px] font-bold`} disabled={!message.trim() || !activeChannels}>Send advisory</button>
            <button className={`${btnGhost} h-10 px-[18px] text-[13px]`} onClick={() => setMessage('')}>Clear</button>
            <div className="ml-auto text-xs text-muted">{activeChannels} channel{activeChannels === 1 ? '' : 's'} selected</div>
          </div>
        </Card>

        {/* Recommended advisories from the analysis */}
        <Card className="overflow-hidden">
          <div className="px-[17px] py-3.5 border-b border-black/[0.08] text-[13px] font-semibold">Recommended advisories</div>
          {!actions?.length && <Empty>Run an analysis to get suggested advisories.</Empty>}
          {actions?.map((a, i) => (
            <button
              key={i}
              onClick={() => setMessage(a.text)}
              className="w-full text-left px-[17px] py-3.5 border-b border-black/[0.05] hover:bg-black/[0.02] transition-colors"
            >
              <span className="text-[10px] font-semibold text-brand bg-brand/[0.12] rounded-[5px] px-[7px] py-0.5">{a.tag}</span>
              <div className="text-[13px] text-body mt-1.5 leading-snug">{a.text}</div>
              <div className="text-[11px] text-brand mt-1.5">Load into message →</div>
            </button>
          ))}
        </Card>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div className="text-xs font-semibold text-muted mb-2.5">{children}</div>
}
