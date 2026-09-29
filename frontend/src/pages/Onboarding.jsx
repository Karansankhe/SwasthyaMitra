import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, q } from '../lib/api.js'
import { useStore } from '../store.jsx'
import { REGION_EXAMPLES } from '../data.js'
import { Spinner } from '../components/ui.jsx'

// Entry point: the user names their operational region; we validate it with
// /surveillance/geocode as they type, then hand off to /dashboard.
export default function Onboarding() {
  const navigate = useNavigate()
  const { startSession } = useStore()
  const [text, setText] = useState('')
  const [check, setCheck] = useState({ state: 'idle', geo: null, for: '' })
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)
  const seq = useRef(0)

  useEffect(() => inputRef.current?.focus(), [])

  const geocode = async (value) => {
    const my = ++seq.current
    setCheck({ state: 'checking', geo: null, for: value })
    try {
      const geo = await api.get(`/api/v1/surveillance/geocode?location=${q(value)}`)
      if (my === seq.current) setCheck({ state: 'ok', geo, for: value })
      return geo
    } catch (e) {
      if (my === seq.current) setCheck({ state: e.status === 404 ? 'notfound' : 'error', geo: null, for: value, msg: e.message })
      return null
    }
  }

  // Debounced validation while typing.
  useEffect(() => {
    const v = text.trim()
    if (v.length < 3) {
      seq.current++
      setCheck({ state: 'idle', geo: null, for: '' })
      return
    }
    const t = setTimeout(() => geocode(v), 550)
    return () => clearTimeout(t)
  }, [text])

  const submit = async (e) => {
    e?.preventDefault()
    const v = text.trim()
    if (!v || submitting) return
    setSubmitting(true)
    const geo = check.state === 'ok' && check.for === v ? check.geo : await geocode(v)
    if (!geo) {
      setSubmitting(false)
      return
    }
    startSession(v, geo)
    navigate('/dashboard', { replace: true })
  }

  const hint = {
    idle: <span className="text-faint">Type at least 3 characters — we'll verify it on the map.</span>,
    checking: (
      <span className="flex items-center gap-2 text-muted">
        <Spinner size={12} /> Validating location…
      </span>
    ),
    ok: check.geo && (
      <span className="flex items-center gap-2 text-[#2F7A4F] font-medium">
        <span className="w-4 h-4 rounded-full bg-[#34A56A] text-white text-[10px] flex items-center justify-center">✓</span>
        {[check.geo.city, check.geo.state, check.geo.country].filter(Boolean).join(', ')}
        <span className="text-faint font-normal tabular-nums">
          · {Number(check.geo.lat).toFixed(3)}°, {Number(check.geo.lon).toFixed(3)}°
        </span>
      </span>
    ),
    notfound: <span className="text-danger">We couldn't find that place. Try a city or district name.</span>,
    error: <span className="text-danger">Location service unavailable ({check.msg}). Please retry.</span>,
  }[check.state]

  return (
    <div className="theme-glass relative min-h-screen w-full overflow-hidden flex items-center justify-center px-6 py-10">
      <MapBackdrop />

      <form onSubmit={submit} className="glass-strong rise relative w-full max-w-[560px] rounded-[32px] px-9 pt-9 pb-8">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#3FB58E] to-[#14968C] flex items-center justify-center shadow-[0_8px_18px_rgba(20,150,140,0.35)]">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
          </div>
          <div className="text-[15px] font-bold tracking-[-0.01em]">Swasthya Mitra</div>
        </div>

        <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.02em] leading-tight text-navy">Where are you operating?</h1>
        <p className="mt-2 mb-6 text-[14px] text-muted leading-relaxed">
          Your region sets the context for every AI agent — surveillance, forecasting, logistics and alerts.
        </p>

        <div
          className={`flex items-center gap-3 h-[58px] pl-5 pr-2 rounded-full bg-white/85 border transition-all ${
            check.state === 'ok' ? 'border-brand/60 ring-4 ring-brand/15' : 'border-white focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/15'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#8F9591" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" />
          </svg>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your City, District, or Region (e.g., Pune, London)"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ink placeholder:text-faint"
            aria-label="City, district or region"
          />
          {check.state === 'checking' && <Spinner size={16} />}
          <button
            type="submit"
            disabled={!text.trim() || submitting || check.state === 'checking'}
            className="lm lm-primary h-[42px] px-5 rounded-full text-[13px] font-bold cursor-pointer flex items-center gap-2"
          >
            {submitting ? <Spinner size={13} className="!border-white/40 !border-t-white" /> : null}
            {submitting ? 'Loading' : 'Continue'}
          </button>
        </div>

        <div className="mt-3 min-h-[20px] text-[12px]">{hint}</div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-faint mr-1">Try</span>
          {REGION_EXAMPLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setText(r)}
              className="h-7 px-3 rounded-full bg-white/70 border border-white text-[12px] text-body hover:bg-white hover:text-brand transition-all duration-300"
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-7 pt-5 border-t border-white/80 grid grid-cols-3 gap-3 text-[11px] text-muted">
          {[
            ['1', 'Validate region', 'Geocode & coordinates'],
            ['2', 'Live snapshot', 'Weather, AQI, news'],
            ['3', 'Agent analysis', 'Risks, supply plan'],
          ].map(([n, t, s]) => (
            <div key={n} className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center flex-none">{n}</span>
              <div>
                <div className="font-semibold text-ink">{t}</div>
                <div className="text-faint">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}

// Subtle stylised map: contour lines, roads and pulsing facility dots.
function MapBackdrop() {
  const dots = [
    [180, 210], [340, 120], [520, 300], [760, 180], [980, 260], [1180, 140],
    [260, 520], [470, 640], [700, 560], [900, 690], [1120, 520], [1280, 620],
  ]
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="rgba(20,150,140,0.07)" />
        </pattern>
        <radialGradient id="blobA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8FE0D3" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8FE0D3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blobB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BFEAE2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#BFEAE2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#grid)" />
      <circle cx="300" cy="260" r="360" fill="url(#blobA)" />
      <circle cx="1160" cy="660" r="380" fill="url(#blobA)" />
      <circle cx="1060" cy="200" r="260" fill="url(#blobB)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M-50 ${150 + i * 130} C 300 ${80 + i * 140}, 520 ${260 + i * 110}, 820 ${170 + i * 130} S 1300 ${120 + i * 150}, 1500 ${200 + i * 120}`}
          fill="none"
          stroke="rgba(20,150,140,0.09)"
          strokeWidth="1.2"
        />
      ))}
      <path d="M0 470 L380 430 L640 480 L1000 390 L1440 440" fill="none" stroke="rgba(17,19,18,0.08)" strokeWidth="5" strokeLinecap="round" />
      <path d="M560 0 L600 300 L540 560 L640 900" fill="none" stroke="rgba(17,19,18,0.07)" strokeWidth="4" strokeLinecap="round" />
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="rgba(20,150,140,0.12)" className="animate-glow" style={{ animationDelay: `${i * 0.3}s` }} />
          <circle cx={x} cy={y} r="4" fill={i % 5 === 2 ? '#3FB58E' : '#14968C'} />
        </g>
      ))}
    </svg>
  )
}
