import { useEffect, useRef } from 'react'

// Dark bento grid for the landing "Platform" section. Each card carries a small
// looping illustration of its feature; the whole grid shares a cursor spotlight
// (see .spotlight in index.css).
export default function FeatureBento() {
  const gridRef = useRef(null)

  // Feed every card the cursor position in its own coordinates, so the border
  // glow bleeds across neighbouring cards while the fill glow stays on the hovered one.
  const onMove = (e) => {
    for (const card of gridRef.current.querySelectorAll('.spotlight')) {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
  }

  return (
    <div ref={gridRef} onMouseMove={onMove} className="bento grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
      <Card className="md:col-span-3 lg:col-span-4">
        <Title t="Surge forecasting" d="See festival and pollution-driven spikes days before they land." />
        <ForecastArt />
      </Card>
      <Card className="md:col-span-3 lg:col-span-5">
        <FusionArt />
        <Title t="Signal fusion" d="Weather, AQI, festivals and outbreak feeds fused into one live risk picture." />
      </Card>
      <Card className="md:col-span-6 lg:col-span-3">
        <OrbitArt />
        <Title t="Command center" d="One readiness view: risk, alerts and the signals driving them." />
      </Card>
      <Card className="md:col-span-3 lg:col-span-4">
        <Title t="Recommended actions" d="24-hour, 7-day and 30-day plans, approved by a human." />
        <PlanWindow />
      </Card>
      <Card className="md:col-span-3 lg:col-span-4">
        <AdvisoryCarousel />
        <Title t="Multilingual advisories" d="SMS, IVR and WhatsApp in regional dialects via Bhashini." />
      </Card>
      <Card className="md:col-span-6 lg:col-span-4">
        <Title t="Scenario simulator" d="Model AQI, festivals and outbreaks to preview load and a plan." />
        <SimulatorPath />
      </Card>
    </div>
  )
}

function Card({ className = '', children }) {
  return (
    <div className={`spotlight relative overflow-hidden rounded-2xl bg-[#1B1D1C] border border-white/[0.07] h-[272px] flex flex-col ${className}`}>
      {children}
    </div>
  )
}

function Title({ t, d }) {
  return (
    <div className="relative z-[1] px-6 pt-5 pb-5 text-center">
      <div className="text-[15px] font-semibold text-white tracking-[-0.01em]">{t}</div>
      <div className="text-[12px] text-white/50 mt-1 leading-relaxed max-w-[280px] mx-auto">{d}</div>
    </div>
  )
}

/* ---------- 1. Forecast: grid + line that draws itself into a surge ---------- */

function ForecastArt() {
  return (
    <div
      className="relative z-[1] flex-1 mx-5 mb-5 rounded-xl border border-white/[0.06] overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold text-brand-light bg-brand-light/15 rounded-full px-2 py-0.5">
        +38% · in 5 days
      </span>
      <span className="absolute top-2.5 left-2.5 text-[10px] text-white/40">OPD load</span>
      <svg viewBox="0 0 300 120" className="absolute inset-x-0 bottom-0 w-full h-[80%]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6FD8C9" stopOpacity="0.35" />
            <stop offset="1" stopColor="#6FD8C9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="150" y1="0" x2="150" y2="120" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        <path d="M0 96 C 30 93, 50 90, 80 91 S 130 85, 150 81" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path className="fc-area" d="M150 81 C 180 77, 200 60, 215 45 S 238 18, 250 20 S 280 50, 300 58 V120 H150 Z" fill="url(#fc-fill)" />
        <path className="fc-line" pathLength="100" d="M150 81 C 180 77, 200 60, 215 45 S 238 18, 250 20 S 280 50, 300 58" fill="none" stroke="#6FD8C9" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* peak marker sits in HTML so it stays round despite the stretched SVG */}
      <span className="fc-peak absolute w-2.5 h-2.5 rounded-full bg-brand-light" style={{ left: 'calc(83.3% - 5px)', top: 'calc(20% + 80% * 20 / 120 - 5px)' }} />
      <span className="absolute bottom-1.5 text-[9px] text-white/35" style={{ left: 'calc(50% + 4px)' }}>today</span>
    </div>
  )
}

/* ---------- 2. Fusion: four signal nodes feeding one hub ---------- */

const SIGNALS = [
  { x: 55, label: 'Weather', icon: <path d="M4.5 12h7a3 3 0 0 0 .4-6 4 4 0 0 0-7.7 1A2.5 2.5 0 0 0 4.5 12z" /> },
  { x: 125, label: 'AQI', icon: <path d="M2 5.5h8a2 2 0 1 0-2-2M2 10.5h10a2 2 0 1 1-2 2M2 8h6" /> },
  { x: 195, label: 'Outbreaks', icon: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v2.5M8 12v2.5M1.5 8H4M12 8h2.5M3.4 3.4l1.8 1.8M10.8 10.8l1.8 1.8M3.4 12.6l1.8-1.8M10.8 5.2l1.8-1.8" />
    </>
  ) },
  { x: 265, label: 'Festivals', icon: <path d="M8 1.5l1.6 4.9L14.5 8l-4.9 1.6L8 14.5l-1.6-4.9L1.5 8l4.9-1.6z" /> },
]

function FusionArt() {
  const hubX = [136, 153, 167, 184]
  return (
    <div className="relative z-[1] flex-1 flex items-start justify-center">
      <svg viewBox="0 0 320 160" className="w-full max-w-[360px] h-full">
        {SIGNALS.map((s, i) => {
          const up = `M${s.x} 96 C ${s.x} 64, ${hubX[i]} 72, ${hubX[i]} 40`
          return (
            <g key={s.label}>
              <path d={up} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
              <circle r="2.6" fill="#6FD8C9" className="motion-dot">
                <animateMotion dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={up} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={s.x} cy="114" r="18" fill="#242726" stroke="rgba(255,255,255,0.14)" />
              <g transform={`translate(${s.x - 8} 106)`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </g>
              <text x={s.x} y="148" textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.45)">{s.label}</text>
            </g>
          )
        })}
        {/* hub, bleeding off the top edge like a window peeking in */}
        <rect x="92" y="-14" width="136" height="54" rx="11" fill="#0E100F" stroke="rgba(255,255,255,0.22)" />
        <rect x="106" y="8" width="17" height="17" rx="4.5" fill="#14968C" />
        <rect x="111.5" y="13.5" width="6" height="6" rx="1.8" fill="#0E100F" />
        <text x="130" y="21.5" fontSize="13" fontWeight="700" fill="#fff">SwasthyaMitra</text>
      </svg>
    </div>
  )
}

/* ---------- 3. Command center: risk tile inside a tilted orbit ---------- */

function OrbitArt() {
  return (
    <div className="relative z-[1] flex-1 flex items-center justify-center">
      <svg viewBox="0 0 220 120" className="absolute w-[92%] max-w-[260px]">
        <defs>
          <linearGradient id="orbit-hl" x1="0" x2="1">
            <stop offset="0" stopColor="#6FD8C9" stopOpacity="0" />
            <stop offset="0.6" stopColor="#A6E8DE" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
        </defs>
        <g transform="rotate(-12 110 60)">
          <ellipse cx="110" cy="60" rx="92" ry="24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <ellipse className="orbit-hl" cx="110" cy="60" rx="92" ry="24" fill="none" stroke="url(#orbit-hl)" strokeWidth="2.2" strokeLinecap="round" pathLength="100" />
        </g>
        <path className="twinkle" d="M24 78l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#fff" />
        <path className="twinkle" style={{ animationDelay: '1.2s' }} d="M196 30l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z" fill="#fff" />
      </svg>
      <div className="relative w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-[0_0_30px_rgba(111,216,201,0.55)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path className="pulse-line" pathLength="100" d="M2 12h4l2.5-6 4 12 3-8 1.5 2H22" />
        </svg>
      </div>
    </div>
  )
}

/* ---------- 4. Recommended actions: a plan that fills in, then gets approved ---------- */

const PLAN_STEPS = [
  { when: '24h', text: 'Stock 400 ORS packs' },
  { when: '7 days', text: 'Add 6 dengue beds' },
  { when: '30 days', text: 'Train 12 ASHA workers' },
]

function PlanWindow() {
  return (
    <div className="relative z-[1] flex-1 ml-5 -mr-px rounded-tl-xl border-t border-l border-white/[0.1] bg-[#0C0D0D] overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 h-9 border-b border-white/[0.06]">
        <span className="w-2 h-2 rounded-full bg-brand-light" />
        <span className="text-[11.5px] font-semibold text-white/85">Today&apos;s readiness plan</span>
        <span className="ml-auto text-[10px] text-white/40">Rampur Block</span>
      </div>
      <div className="px-3.5 py-2.5 space-y-1.5">
        {PLAN_STEPS.map((s, i) => (
          <div key={s.text} className="plan-line flex items-center gap-2.5" style={{ animationDelay: `${i * 0.7}s` }}>
            <span className="w-[52px] flex-none text-center text-[9.5px] font-semibold text-brand-light bg-brand-light/15 rounded-full py-0.5">{s.when}</span>
            <span className="text-[12px] text-white/85 whitespace-nowrap">{s.text}</span>
          </div>
        ))}
        <div className="plan-line flex items-center gap-2 pt-1.5" style={{ animationDelay: '2.3s' }}>
          <span className="w-4 h-4 rounded-full bg-[#28C840]/20 text-[#5FE0C8] flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.2 2.2 4.8-5" /></svg>
          </span>
          <span className="text-[11px] text-white/55">Approved by the block officer</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- 5. Advisories: dialect + channel tiles riding an arc ---------- */

const TILES = [
  { t: 'नमस्ते', k: 'green' },
  { t: 'SMS', k: 'dark', icon: <path d="M3 4h10v7H7l-3 2.5V11H3z" /> },
  { t: 'বাংলা', k: 'light' },
  { t: 'IVR', k: 'dark', icon: <path d="M5 2.5h2l1 3-1.5 1a7 7 0 0 0 3 3l1-1.5 3 1v2a1.5 1.5 0 0 1-1.5 1.5A10 10 0 0 1 3.5 4 1.5 1.5 0 0 1 5 2.5z" /> },
  { t: 'தமிழ்', k: 'green' },
  { t: 'ଓଡ଼ିଆ', k: 'light' },
  { t: 'WA', k: 'dark', icon: <path d="M8 2a6 6 0 0 0-5.2 9L2 14l3.1-.8A6 6 0 1 0 8 2z" /> },
  { t: 'తెలుగు', k: 'green' },
  { t: 'मराठी', k: 'light' },
  { t: 'ਪੰਜਾਬੀ', k: 'dark' },
]
const TILE_STYLE = {
  green: 'bg-brand text-white shadow-[0_6px_20px_rgba(111,216,201,0.35)]',
  light: 'bg-[#EEF0EF] text-ink',
  dark: 'bg-[#0A0B0B] text-white border border-white/10',
}

function AdvisoryCarousel() {
  const wrapRef = useRef(null)
  const tileRefs = useRef([])

  useEffect(() => {
    const wrap = wrapRef.current
    const SIZE = 50
    const STEP = 64
    const total = TILES.length * STEP
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let offset = 0
    let raf
    let last = performance.now()

    const place = () => {
      const w = wrap.clientWidth
      const cx = w / 2
      const depth = 30
      tileRefs.current.forEach((el, i) => {
        if (!el) return
        // wrap each tile around a loop wider than the card
        const x = ((((i * STEP + offset) % total) + total) % total) - STEP
        const mid = x + SIZE / 2
        const n = (mid - cx) / cx
        const y = depth * n * n
        const angle = (Math.atan((2 * depth * (mid - cx)) / (cx * cx)) * 180) / Math.PI
        el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`
      })
    }
    const tick = (now) => {
      offset += (now - last) * 0.035
      last = now
      place()
      raf = requestAnimationFrame(tick)
    }
    place()
    if (!still) raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={wrapRef} className="relative z-[1] flex-1 mt-9 overflow-hidden">
      {TILES.map((tile, i) => (
        <div
          key={tile.t}
          ref={(el) => (tileRefs.current[i] = el)}
          className={`absolute top-3 left-0 w-[50px] h-[50px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 font-semibold ${TILE_STYLE[tile.k]}`}
        >
          {tile.icon ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">{tile.icon}</svg>
              <span className="text-[8.5px] tracking-wide opacity-70">{tile.t}</span>
            </>
          ) : (
            <span className="text-[11px] leading-none">{tile.t}</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------- 6. Simulator: a scenario node travelling a dashed path ---------- */

const SIM_PATH = 'M-10 62 C 40 18, 90 22, 110 62 S 150 124, 190 98 S 232 30, 262 56 S 292 118, 320 108'

function SimulatorPath() {
  return (
    <div className="relative z-[1] flex-1">
      <svg viewBox="0 0 300 140" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path d={SIM_PATH} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="3 5" />
        {[
          { x: 110, y: 62, l: 'AQI 320', dx: 8, dy: -8 },
          { x: 190, y: 98, l: 'Diwali', dx: 8, dy: 16 },
          { x: 262, y: 56, l: 'Dengue +', dx: -12, dy: -10 },
        ].map((p) => (
          <g key={p.l}>
            <circle cx={p.x} cy={p.y} r="3.2" fill="#1B1D1C" stroke="#6FD8C9" strokeWidth="1.4" />
            <text x={p.x + p.dx} y={p.y + p.dy} fontSize="9" fill="rgba(255,255,255,0.5)">{p.l}</text>
          </g>
        ))}
        <g className="motion-dot">
          <animateMotion dur="7s" repeatCount="indefinite" path={SIM_PATH} />
          <circle r="15" fill="#6FD8C9" opacity="0.18" />
          <circle r="11" fill="#fff" />
          <g transform="translate(-6 -6)" fill="none" stroke="#111312" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 3h10M1 9h10" />
            <circle cx="4" cy="3" r="1.6" fill="#fff" />
            <circle cx="8" cy="9" r="1.6" fill="#fff" />
          </g>
        </g>
      </svg>
    </div>
  )
}
