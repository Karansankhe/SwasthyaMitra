import { useEffect, useRef, useState } from 'react'

// Scroll-driven "expanding panel" stories for the landing page (The gap, How it works).
// Each section is tall; its stage sticks to the viewport while scroll progress p (0→1)
// first grows a small panel to near full screen, splitting the title apart, then plays
// the panel's content one beat after another.

const clamp = (x) => Math.min(1, Math.max(0, x))
const stage = (p, a, b) => clamp((p - a) / (b - a))
const easeOut = (x) => 1 - Math.pow(1 - x, 3)

function useReducedMotion() {
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  return reduced
}

function useScrollProgress(ref, disabled) {
  const [p, setP] = useState(disabled ? 1 : 0)
  useEffect(() => {
    if (disabled) return
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      setP(total > 0 ? clamp(-r.top / total) : 1)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, disabled])
  return p
}

const TONES = {
  white: { bg: '#E6E7E8', panel: 'studio-teal text-white border-white/25', dots: 'rgba(17,19,18,0.09)' },
  warm: { bg: '#EEEFEF', panel: 'studio-card !bg-white/70 text-ink border-white', dots: 'rgba(20,150,140,0.14)' },
}

// '#rrggbb' → [r, g, b]
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const mix = (a, b, k) => {
  const [x, y] = [rgb(a), rgb(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`
}

// `from` / `to` are the neighbouring sections' colours: the stage enters wearing
// `from` and leaves wearing `to`, so there is never a hard edge between sections.
function ScrollExpand({ id, tone, from, to, top, bottom, hint, teaser, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const p = useScrollProgress(ref, reduced)
  const e = easeOut(stage(p, 0, 0.42))
  const t = TONES[tone]
  const bg = reduced
    ? t.bg
    : p < 0.5
      ? mix(from ?? t.bg, t.bg, easeOut(stage(p, 0, 0.14)))
      : mix(t.bg, to ?? t.bg, stage(p, 0.86, 1))

  return (
    <section id={id} ref={ref} className="relative" style={{ height: reduced ? 'auto' : '290vh', background: bg }}>
      {/* the stage carries the background so the title's blend has something to invert against */}
      <div
        className={`${reduced ? 'relative py-24' : 'sticky top-0 h-[100svh]'} overflow-hidden isolate flex items-center justify-center pt-14`}
        style={{ background: bg }}
      >
        {/* backdrop: dot field + green glow, fading back as the panel takes over */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 1 - e * 0.75 }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${t.dots} 1.2px, transparent 1.2px)`,
              backgroundSize: '22px 22px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 100%)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 w-[620px] h-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(20,150,140,0.2), transparent 62%)' }}
          />
        </div>

        {/* the panel */}
        <div
          className={`relative border overflow-hidden shadow-[0_30px_80px_rgba(17,19,18,0.22)] ${t.panel}`}
          style={{
            width: `calc(260px + (min(1120px, 100vw - 32px) - 260px) * ${e})`,
            height: `calc(320px + (min(700px, 100svh - 110px) - 320px) * ${e})`,
            borderRadius: `${28 - e * 8}px`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 1 - stage(e, 0.25, 0.6), pointerEvents: 'none' }}>
            {teaser}
          </div>
          <div className="absolute inset-0" style={{ opacity: stage(e, 0.85, 1), visibility: e > 0.8 ? 'visible' : 'hidden' }}>
            {children(p)}
          </div>
        </div>

        {/* split title — difference blend keeps it legible over both the page and the panel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-14 pointer-events-none mix-blend-difference text-white font-display font-bold tracking-[-0.03em] leading-[1.05] text-[40px] md:text-[68px]">
          <div style={{ transform: `translateX(calc(${-e} * 75vw))`, opacity: 1 - stage(e, 0.55, 0.95) }}>{top}</div>
          <div style={{ transform: `translateX(calc(${e} * 75vw))`, opacity: 1 - stage(e, 0.55, 0.95) }}>{bottom}</div>
        </div>
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint"
          style={{ opacity: 1 - stage(e, 0, 0.3) }}
        >
          {hint}
          <span className="w-px h-7 bg-gradient-to-b from-brand to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}

/* ================= The gap ================= */

const GAPS = [
  { t: 'Stock-outs & delays', d: 'Supplies run dry mid-surge with no forward view of demand.' },
  { t: 'Predictable surges, missed', d: 'Festivals, winter AQI and monsoon outbreaks still overwhelm.' },
  { t: 'Disconnected blocks', d: 'Facilities can’t see or share load, so pressure lands late.' },
]
const GAP_AT = [0.5, 0.62, 0.74]

export function GapStory() {
  return (
    <ScrollExpand id="gap" tone="white" from="#E6E7E8" to="#EEEFEF" top="Reacting" bottom="too late." hint="Scroll to see the gap" teaser={<GapTeaser />}>
      {(p) => {
        const draw = stage(p, 0.44, 0.8)
        const shown = GAP_AT.filter((a) => p >= a).length
        return (
          <div className="h-full flex flex-col p-6 md:p-10">
            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/80">The gap</div>
            <h2 className="m-0 mt-2 text-[19px] md:text-[26px] font-bold tracking-[-0.02em] max-w-[620px] leading-[1.2]">
              Rural health centres react to surges. They rarely see them coming.
            </h2>

            <div className="flex-1 min-h-0 grid md:grid-cols-[1.15fr_1fr] gap-5 md:gap-8 mt-5 md:mt-8">
              {/* demand vs stock */}
              <div className="relative rounded-2xl bg-white/10 border border-white/20 p-4 md:p-5 flex flex-col min-h-[150px]">
                <div className="flex items-center gap-4 text-[11px] text-white/60">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-[2px] bg-brand-light rounded" />Patient demand</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-[2px] bg-white/60 rounded" />Medicine stock</span>
                </div>
                <div className="relative flex-1 mt-3">
                  <svg viewBox="0 0 320 150" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                    {[30, 75, 120].map((y) => (
                      <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" vectorEffect="non-scaling-stroke" />
                    ))}
                  </svg>
                  {/* lines are revealed left→right with a clip (dash tricks break under non-scaling strokes) */}
                  <svg viewBox="0 0 320 150" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(-4px ${100 - draw * 100}% -4px 0)` }}>
                    <path d="M0 50 H 140 C 185 50, 215 95, 250 146 H 320" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <path d="M0 128 C 60 126, 110 120, 150 106 S 235 42, 320 16" fill="none" stroke="#6FD8C9" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div
                    className="absolute flex flex-col items-center transition-all duration-500"
                    style={{ left: '78%', bottom: 0, transform: `translate(-50%, ${draw > 0.92 ? 0 : 8}px)`, opacity: draw > 0.92 ? 1 : 0 }}
                  >
                    <span className="text-[10px] font-bold text-white bg-danger rounded-full px-2 py-0.5 mb-1.5 whitespace-nowrap">Stock-out</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-danger shadow-[0_0_0_5px_rgba(220,38,38,0.25)]" />
                  </div>
                </div>
              </div>

              {/* problems, one after another */}
              <div className="flex flex-col gap-2.5 md:gap-3">
                {GAPS.map((g, i) => {
                  const on = i < shown
                  const current = i === shown - 1
                  return (
                    <div
                      key={g.t}
                      className={`rounded-xl border px-4 py-2.5 md:py-3 transition-all duration-500 ease-out ${
                        current ? 'border-brand-light/50 bg-brand-light/[0.08]' : 'border-white/10 bg-white/[0.03]'
                      }`}
                      style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(14px)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 flex-none rounded-md flex items-center justify-center text-[11px] font-bold ${current ? 'bg-brand-light text-dark' : 'bg-white/20 text-white'}`}>
                          {i + 1}
                        </span>
                        <span className="text-[14px] md:text-[15px] font-semibold">{g.t}</span>
                      </div>
                      <div className="text-[12px] md:text-[12.5px] text-white/60 mt-1 leading-snug pl-[34px] [@media(max-height:720px)]:hidden">{g.d}</div>
                    </div>
                  )
                })}
                <div
                  className="mt-auto text-[13px] font-semibold text-white transition-all duration-500"
                  style={{ opacity: p > 0.86 ? 1 : 0, transform: p > 0.86 ? 'none' : 'translateY(8px)' }}
                >
                  SwasthyaMitra closes this gap →
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </ScrollExpand>
  )
}

function GapTeaser() {
  return (
    // badge and caption hug the edges so the split title can sit over the middle
    <div className="absolute inset-0 flex flex-col items-center justify-between py-6 text-center">
      <span className="text-[10px] font-bold text-white bg-danger/90 rounded-full px-2.5 py-1">SURGE IN 3 DAYS</span>
      <svg viewBox="0 0 120 50" className="w-[190px] opacity-40">
        <path d="M0 42 C 30 41, 50 38, 65 32 S 95 10, 120 6" fill="none" stroke="#6FD8C9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M0 18 H 55 C 75 18, 88 34, 100 48" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeDasharray="3 4" />
      </svg>
      <span className="text-[11px] text-white/50">Stock left: 2 days</span>
    </div>
  )
}

/* ================= How it works ================= */

const STEPS = [
  { n: '01', t: 'Choose your block', d: 'Pick the block you manage and set up your profile in seconds.' },
  { n: '02', t: 'Agents analyse signals', d: 'Specialised agents turn local data into a readiness report in under a minute.' },
  { n: '03', t: 'Act on the plan', d: 'Review recommendations and dispatch advisories with one approval.' },
]
const STEP_SPAN = [
  [0.46, 0.6],
  [0.6, 0.76],
  [0.76, 0.9],
]

export function HowStory() {
  return (
    <ScrollExpand id="how" tone="warm" to="#E6E7E8" top="From block" bottom="to plan." hint="Scroll to see how" teaser={<HowTeaser />}>
      {(p) => {
        const active = p < 0.6 ? 0 : p < 0.76 ? 1 : 2
        const line = stage(p, 0.46, 0.9)
        return (
          <div className="h-full flex flex-col p-6 md:p-10">
            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand">How it works</div>
            <h2 className="m-0 mt-2 text-[19px] md:text-[28px] font-bold tracking-[-0.02em] leading-[1.2]">From block to plan in three steps.</h2>

            <div className="mt-5 md:mt-6 flex-1 min-h-0 flex flex-col md:justify-center">
              <div className="relative md:pb-6">
                {/* progress rail */}
                <div className="hidden md:block absolute left-[16%] right-[16%] top-[18px] h-[2px] bg-black/[0.07] rounded">
                  <div className="h-full bg-brand rounded transition-[width] duration-150" style={{ width: `${line * 100}%` }} />
                </div>
                <div className="grid md:grid-cols-3 gap-2.5 md:gap-5">
                  {STEPS.map((s, i) => {
                    const sp = stage(p, ...STEP_SPAN[i])
                    const state = i < active ? 'done' : i === active ? 'active' : 'next'
                    return (
                      <div key={s.n} className="flex flex-col md:items-center md:text-center min-h-0">
                        <div
                          className={`relative z-[1] w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold font-mono transition-all duration-300 ${
                            state === 'next' ? 'bg-white border border-black/[0.1] text-faint' : 'bg-brand text-white shadow-[0_0_0_6px_rgba(20,150,140,0.15)]'
                          } hidden md:flex`}
                        >
                          {state === 'done' ? '✓' : s.n}
                        </div>
                        <div
                          className={`md:mt-4 w-full rounded-2xl border p-3.5 md:p-4 transition-all duration-500 flex flex-col ${
                            state === 'active'
                              ? 'border-brand/40 bg-white shadow-[0_16px_40px_rgba(20,150,140,0.14)]'
                              : 'border-white bg-white/50'
                          }`}
                          style={{ opacity: state === 'next' ? 0.5 : 1 }}
                        >
                          <div className="flex items-center gap-2 md:justify-center">
                            <span className="md:hidden text-[11px] font-bold font-mono text-brand">{s.n}</span>
                            <span className="text-[14px] md:text-[15px] font-semibold">{s.t}</span>
                          </div>
                          <div className="hidden md:block [@media(max-height:720px)]:!hidden text-[12.5px] text-muted mt-1.5 leading-relaxed">{s.d}</div>
                          <div className={`${state === 'active' ? 'block' : 'hidden md:block'} mt-3`}>
                            {i === 0 && <PickBlock sp={sp} />}
                            {i === 1 && <RunAgents sp={sp} />}
                            {i === 2 && <ApprovePlan sp={sp} />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </ScrollExpand>
  )
}

function HowTeaser() {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center py-5 opacity-60">
      {['Choose block', 'Agents analyse', 'Act on plan'].map((t, i) => (
        <div key={t} className="w-[190px] flex items-center gap-2.5 rounded-xl border border-black/[0.07] bg-[#F7F7F7] px-3 py-2.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-brand text-white' : 'bg-black/[0.06] text-faint'}`}>
            {i + 1}
          </span>
          <span className="text-[12px] font-semibold text-ink">{t}</span>
        </div>
      ))}
    </div>
  )
}

function Check({ className = '' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 6.5l2.2 2.2 4.8-5" />
    </svg>
  )
}

function PickBlock({ sp }) {
  const label = 'Rampur Block · Barabanki'
  const chosen = sp >= 0.95
  return (
    <div
      className={`h-10 rounded-xl border bg-white px-3 flex items-center gap-2 text-[12.5px] text-left transition-colors ${
        chosen ? 'border-brand ring-2 ring-brand/20' : 'border-black/[0.12]'
      }`}
    >
      <span className="w-[7px] h-[7px] rounded-full bg-brand flex-none" />
      <span className="flex-1 truncate text-ink">
        {label.slice(0, Math.round(label.length * stage(sp, 0.1, 0.85)))}
        {!chosen && <span className="inline-block w-px h-3.5 bg-ink align-middle animate-pulse ml-px" />}
      </span>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${chosen ? 'bg-brand text-white scale-100' : 'scale-0'}`}>
        <Check />
      </span>
    </div>
  )
}

const AGENTS = ['Weather', 'Air quality', 'Outbreaks', 'Festivals']

function RunAgents({ sp }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        {AGENTS.map((a, i) => {
          const started = sp > 0.02
          const done = sp >= (i + 1) / 5
          return (
            <div key={a} className="h-8 rounded-lg bg-white border border-black/[0.08] px-2 flex items-center gap-1.5 text-[11.5px] text-body">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-none ${done ? 'bg-brand text-white' : ''}`}>
                {done ? <Check /> : <span className={`w-3 h-3 rounded-full border-2 border-brand/25 border-t-brand ${started ? 'animate-spin' : ''}`} />}
              </span>
              <span className="truncate">{a}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-[11px] font-semibold transition-colors" style={{ color: sp >= 0.95 ? '#14968C' : '#8F9591' }}>
        {sp >= 0.95 ? 'Readiness report ready · 48s' : 'Analysing local signals…'}
      </div>
    </div>
  )
}

function ApprovePlan({ sp }) {
  const rows = [
    { w: '24h', t: 'Stock 400 ORS packs' },
    { w: '7d', t: 'Add 6 dengue beds' },
  ]
  const approved = sp >= 0.9
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => {
        const on = sp > 0.15 + i * 0.25
        return (
          <div
            key={r.t}
            className="h-8 rounded-lg bg-white border border-black/[0.08] px-2 flex items-center gap-2 text-[11.5px] text-body transition-all duration-300"
            style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(6px)' }}
          >
            <span className="text-[9.5px] font-semibold text-brand bg-brand/10 rounded-full px-1.5 py-0.5">{r.w}</span>
            <span className="truncate">{r.t}</span>
          </div>
        )
      })}
      <div className="pt-1 flex md:justify-center">
        <span className="lm lm-primary h-8 px-4 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5">
          {approved ? (
            <>
              Approved <Check />
            </>
          ) : (
            'Approve plan'
          )}
        </span>
      </div>
    </div>
  )
}
