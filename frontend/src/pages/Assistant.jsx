import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { useView } from '../view.js'
import { Card, CardHead, Spinner, SevPill } from '../components/ui.jsx'
import Markdown from '../components/Markdown.jsx'
import { toneOf, up } from '../lib/selectors.js'

const CHAT_KEY = 'swasthya.chat'

// Compact context from the current dashboard, sent with every chat request so
// answers are grounded in this region's analysis and plan.
function contextMessage({ region, report, plan, weather, kpi }) {
  const ctx = {
    region,
    weather: weather && { temp_c: weather.temperature, aqi: weather.aqi_label, pm2_5: weather.pm2_5 },
    overall_risk: report?.overall_risk_level,
    executive_summary: report?.executive_summary,
    compound_risks: report?.compound_risks?.slice(0, 4),
    recommended_actions: report?.recommended_actions,
    predicted_shortages: plan?.demand_forecast?.predicted_shortages?.slice(0, 6),
    transfers: plan?.redistribution_plan?.transfers?.slice(0, 6),
    critical_stockouts: kpi.stockouts,
  }
  return `Current dashboard context (JSON): ${JSON.stringify(ctx).slice(0, 6000)}`
}

export default function Assistant() {
  const v = useView()
  const { region, report, plan, shortages, transfers, session } = v
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_KEY))
      return saved?.region === session?.query ? saved.messages : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify({ region: session?.query, messages }))
    } catch {
      /* ignore */
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, session?.query])

  const suggestions = [
    transfers[0] && `Why was the ${transfers[0].resource} redistribution plan triggered today?`,
    shortages[0] && `What should we do about the ${shortages[0].title} shortage?`,
    report && `Summarise the top 3 risks for ${region} this week.`,
    'Which PHCs should be prioritised for restocking?',
    'Draft a 24-hour action checklist for the nodal officer.',
  ].filter(Boolean)

  const send = async (text = input) => {
    const content = text.trim()
    if (!content || sending) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setErr('')
    setSending(true)
    try {
      const res = await api.post('/api/v1/chat', {
        messages: [{ role: 'system', content: contextMessage(v) }, ...next],
      })
      setMessages((m) => [...m, { role: 'assistant', content: res?.response || '_No response._' }])
    } catch (e) {
      setErr(e.status === 403 ? 'The chat endpoint rejected the API key. Set VITE_API_KEY to match the backend API_KEY.' : e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-5 px-7 pt-3 min-h-[440px]" style={{ height: 'calc(100vh - 110px - var(--dock-space, 0px))' }}>
      <div className="glass-card rise rounded-[28px] flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="px-7 pt-6 pb-3 flex items-end justify-between">
          <div className="rise">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand mb-1">Assistant</div>
            <h1 className="m-0 font-display text-[26px] font-semibold tracking-[-0.02em] text-navy">AI Assistant</h1>
            <div className="text-[13px] text-muted mt-1">Ask about risks, shortages and the redistribution plan for {region}</div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="text-[12px] font-semibold text-muted hover:text-ink">
              Clear chat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto px-7 py-3" data-lenis-prevent>
          {messages.length === 0 && (
            <div className="max-w-[560px] mx-auto text-center pt-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-[24px]">✦</div>
              <div className="text-[17px] font-bold mt-3">How can I help today?</div>
              <div className="text-[13px] text-muted mt-1">I can see this region's surveillance report and distribution plan.</div>
              <div className="grid grid-cols-2 gap-2 mt-6 text-left">
                {suggestions.slice(0, 4).map((s) => (
                  <button key={s} onClick={() => send(s)} className="rise rounded-2xl glass-inset p-3.5 text-[12px] text-body hover:bg-white hover:shadow-[0_8px_20px_rgba(20,40,38,0.1)] transition-all duration-300">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="max-w-[760px] mx-auto flex flex-col gap-4">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="rise self-end max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#1FA592] to-[#14968C] text-white shadow-[0_8px_18px_rgba(20,150,140,0.25)] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="rise self-start flex gap-2.5 max-w-[88%]">
                  <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center text-[12px] flex-none">✦</div>
                  <div className="rounded-2xl rounded-tl-md bg-white/85 border border-white px-4 py-3 text-[13px] leading-relaxed text-body shadow-[0_1px_2px_rgba(17,19,18,0.04)]">
                    <Markdown text={m.content} />
                  </div>
                </div>
              ),
            )}
            {sending && (
              <div className="self-start flex gap-2.5 items-center text-[12px] text-muted">
                <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center text-[12px]">✦</div>
                <Spinner size={12} /> Thinking…
              </div>
            )}
            {err && <div className="self-center text-[12px] text-danger bg-danger/[0.06] rounded-lg px-3 py-2">{err}</div>}
            <div ref={endRef} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="px-7 pb-6 pt-2"
        >
          <div className="max-w-[760px] mx-auto flex items-end gap-2 rounded-full glass-strong p-2 pl-5 focus-within:ring-4 focus-within:ring-brand/15 focus-within:ring-4 focus-within:ring-brand/10">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={1}
              placeholder="Ask e.g. “Why was the O2 redistribution plan triggered today?”"
              className="flex-1 resize-none bg-transparent outline-none text-[14px] py-2 max-h-32"
            />
            <button type="submit" disabled={!input.trim() || sending} className="lm lm-primary h-10 px-5 rounded-full text-[13px] font-bold cursor-pointer">
              Send
            </button>
          </div>
        </form>
      </div>

      <aside className="glass-card rise rounded-[28px] w-[300px] flex-none p-4 overflow-auto" style={{ '--i': 1 }} data-lenis-prevent>
        <Card className="mb-3">
          <CardHead title="Grounded in" sub={region} />
          <div className="px-5 pb-4 flex flex-col gap-2 text-[12px]">
            <Row k="Overall risk" v={report ? <SevPill tone={toneOf(report.overall_risk_level)}>{up(report.overall_risk_level)}</SevPill> : '—'} />
            <Row k="Predicted shortages" v={shortages.length} />
            <Row k="Planned transfers" v={transfers.length} />
          </div>
        </Card>
        <div className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase mb-2 mt-4">Suggested questions</div>
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)} className="w-full text-left rounded-xl px-3 py-2.5 mb-1.5 text-[12px] text-body hover:bg-brand/[0.06] hover:text-brand transition-colors">
            {s}
          </button>
        ))}
        {!plan && <div className="text-[11px] text-faint mt-3">The distribution plan isn't ready yet, so answers draw on surveillance data only.</div>}
      </aside>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  )
}
