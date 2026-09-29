import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import FeatureBento from '../components/FeatureBento.jsx'
import { GapStory, HowStory } from '../components/LandingStories.jsx'
import { CountUp, Decode, LetterSwap } from '../components/Motion.jsx'

const SURGE_WORDS = ['dengue wave.', 'festival rush.', 'smog season.', 'heatwave.', 'flu spike.', 'stock-out.']

const SECTIONS = [
  { id: 'top', label: 'Overview', icon: <path d="M3 8.5 8 4l5 4.5M4.5 7.5V13h7V7.5" /> },
  { id: 'gap', label: 'The gap', icon: <path d="M2.5 12.5 6 8l3 2.5 4.5-6M11 4.5h2.5V7" /> },
  { id: 'how', label: 'How it works', icon: <path d="M3 4h10M3 8h10M3 12h6" /> },
  { id: 'features', label: 'Platform', icon: <path d="M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z" /> },
  { id: 'impact', label: 'Impact', icon: <path d="M8 2.5v11M4 6.5 8 2.5l4 4" /> },
]

const TILES = [
  { l: ['Surge', 'triggers'], to: 3, unit: 'types' },
  { l: ['Time to a', 'readiness report'], to: 60, prefix: '<', unit: 'sec' },
  { l: ['Agents per', 'analysis'], to: 5, suffix: '+', unit: 'agents' },
  { l: ['Forecast', 'horizon'], to: 14, unit: 'days' },
  { l: ['Advisory', 'channels'], to: 3, unit: 'SMS · IVR · WA' },
]

// Agent "transcript" shown in the hero panel, one set per tab.
const TRANSCRIPTS = {
  signals: [
    { who: 'Signal Collector', i: 'SC', c: '#F6B8A6', t: '00:04', m: 'AQI 312 in Barabanki — very poor, rising for three days.' },
    { who: 'Festival Surge', i: 'FS', c: '#B9E4C9', t: '00:11', m: 'Diwali in 6 days · 1.2M expected at the ghats. Burns & trauma risk.' },
    { who: 'Pollution Risk', i: 'PR', c: '#C9D4FF', t: '00:18', m: 'Respiratory OPD load +15% expected 2–3 days after the peak.' },
  ],
  agents: [
    { who: 'Resource Forecasting', i: 'RF', c: '#FFE0A3', t: '00:06', m: 'Predicted deficit: 50 O₂ cylinders at Hadapsar PHC by Friday.' },
    { who: 'Supply Chain', i: 'SU', c: '#B9E4C9', t: '00:13', m: 'Move 30 cylinders Aundh → Hadapsar. Urgency HIGH, ETA 1 day.' },
    { who: 'Alert Generator', i: 'AG', c: '#F6B8A6', t: '00:20', m: 'Early warning issued: ORS stock-out likely in Wagholi within 5 days.' },
  ],
  readiness: [
    { who: 'Block officer', i: 'BO', c: '#C9D4FF', t: '00:05', m: 'Why was the O₂ redistribution triggered today?' },
    { who: 'SwasthyaMitra', i: 'SM', c: '#B9E4C9', t: '00:09', m: 'Festival crowding + AQI lag push respiratory demand past Hadapsar reserves.' },
    { who: 'Block officer', i: 'BO', c: '#C9D4FF', t: '00:15', m: 'Approved. Send advisories in Awadhi to high-risk households.' },
  ],
}
const TABS = [
  ['signals', 'Live signals'],
  ['agents', 'Agent plan'],
  ['readiness', 'Readiness'],
]
// Waveform segments: [left %, width %, sentiment]
const WAVE = [
  [8, 9, 'rising'],
  [36, 7, 'stable'],
  [55, 16, 'rising'],
  [74, 14, 'rising'],
  [90, 8, 'easing'],
]

const STATS = [
  { to: 3, v: 'surge triggers', s: 'festivals · pollution · outbreaks' },
  { to: 60, prefix: '<', suffix: 's', v: 'to a report', s: 'multi-agent analysis' },
  { to: 5, suffix: '+', v: 'AI agents', s: 'coordinated per block' },
  { word: 'Multi', v: 'lingual advisories', s: 'SMS · IVR · WhatsApp' },
]

export default function Landing() {
  useSmoothScroll()
  const active = useScrollSpy(SECTIONS.map((s) => s.id))

  return (
    <div className="theme-studio min-h-screen w-full text-ink">
      <TopBar active={active} />
      <LeftRail active={active} />

      {/* ===== HERO ===== */}
      <section id="top" className="relative">
        <div className="max-w-[1180px] mx-auto px-6 pt-24 pb-14">
          <div className="animate-fadeup text-[13px] text-[#4A4F4C]">Predictive readiness</div>
          <h1 className="animate-fadeup m-0 mt-2 font-display font-normal text-[40px] md:text-[56px] leading-[1.04] tracking-[-0.035em] text-[#111312]" style={{ animationDelay: '80ms' }}>
            Get ahead of the next <RotatingWord words={SURGE_WORDS} />
          </h1>

          <HeroTabsAndMeta />
        </div>
      </section>

      {/* ===== THE GAP → HOW IT WORKS (scroll-driven) ===== */}
      <GapStory />
      <HowStory />

      {/* ===== PLATFORM ===== */}
      <section id="features">
        <div className="max-w-[1180px] mx-auto px-6 pt-20 pb-12">
          <Reveal>
            <SectionLabel>Platform</SectionLabel>
            <h2 className="m-0 mt-2 font-display font-normal text-[28px] md:text-[38px] tracking-[-0.03em] max-w-[640px] leading-[1.1]">
              One coordinator, a team of agents, one readiness plan.
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <FeatureBento />
          </Reveal>
        </div>
      </section>

      {/* ===== IMPACT ===== */}
      <section id="impact">
        <div className="max-w-[1180px] mx-auto px-6 py-8">
          <Reveal>
            <div className="studio-teal rounded-[28px] px-8 md:px-12 py-10 relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {STATS.map((s, i) => (
                  <div key={s.v}>
                    <div className="font-display font-light text-[40px] md:text-[48px] tracking-[-0.03em] leading-none">
                      {s.word ? <Decode text={s.word} delay={i * 180} /> : <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} delay={i * 180} />}
                    </div>
                    <div className="text-[14px] font-medium mt-2">{s.v}</div>
                    <div className="text-[12px] text-white/70 mt-0.5">{s.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section>
        <div className="max-w-[1180px] mx-auto px-6 py-14">
          <Reveal>
            <div className="studio-card rounded-[32px] px-8 md:px-14 py-12 md:py-16 text-center">
              <h2 className="m-0 font-display font-normal text-[28px] md:text-[42px] tracking-[-0.03em] max-w-[680px] mx-auto leading-[1.1] cursor-default">
                <LetterSwap text="Ready to see the next surge before it arrives?" />
              </h2>
              <p className="mt-3 text-[15px] text-[#4A4F4C] max-w-[460px] mx-auto">
                Pick your district and get a live readiness report in under a minute.
              </p>
              <Link to="/dashboard" className="lm lm-primary inline-flex items-center gap-2 h-12 px-8 mt-7 rounded-full text-[14px] font-medium">
                Get started <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer>
        <div className="max-w-[1180px] mx-auto px-6 py-9">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <Brand />
            <div className="md:ml-auto flex flex-wrap gap-x-7 gap-y-2 text-[12.5px] text-[#4A4F4C]">
              {SECTIONS.slice(1).map((s) => (
                <a key={s.id} href={`#${s.id}`} className="hover:text-black transition-colors">
                  {s.label}
                </a>
              ))}
              <Link to="/dashboard" className="hover:text-black transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-black/[0.08] text-[11.5px] text-[#7A807C]">
            © {new Date().getFullYear()} SwasthyaMitra · Predictive readiness for India&apos;s primary health network.
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ---------- hero ---------- */

function HeroTabsAndMeta() {
  const [tab, setTab] = useState('signals')
  return (
    <>
      {/* underline tabs + meta strip */}
      <div className="animate-fadeup mt-8 flex flex-wrap items-end gap-x-10 gap-y-4 border-b border-black/[0.1]" style={{ animationDelay: '160ms' }}>
        <div className="flex gap-8">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`relative pb-3 text-[17px] transition-colors ${tab === k ? 'text-[#111312]' : 'text-[#8A8F8C] hover:text-[#4A4F4C]'}`}
            >
              {l}
              <span
                className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#111312] origin-center transition-transform duration-500"
                style={{ transform: `scaleX(${tab === k ? 1 : 0})` }}
              />
              {tab === k && <span className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-2.5 h-2.5 rotate-45 bg-[#E6E7E8] border-r border-b border-black/[0.12]" />}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-8 pb-3 text-[12px]">
          <Meta k="Coverage" v="Any district" />
          <Meta k="Horizon" v="14 days" />
          <Meta k="Status" v="Live" />
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6FD8C9] to-[#14968C] text-white text-[11px] font-semibold flex items-center justify-center">PHC</span>
            <Meta k="Built for" v="PHC · CHC teams" />
          </div>
        </div>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
        {TILES.map((t, i) => (
          <div key={t.unit} className="animate-fadeup studio-card rounded-[22px] px-5 py-4" style={{ animationDelay: `${220 + i * 70}ms` }}>
            <div className="text-[11px] text-[#6B706D] leading-tight">
              {t.l[0]}
              <br />
              {t.l[1]}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display font-normal text-[34px] tracking-[-0.03em] leading-none text-[#111312]">
                <CountUp to={t.to} prefix={t.prefix} suffix={t.suffix} delay={300 + i * 120} />
              </span>
              <span className="text-[13px] text-[#6B706D]">{t.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* chips card + teal signal panel */}
      <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4 mt-4">
        <ChipsCard />
        <SignalPanel tab={tab} />
      </div>

      <div className="animate-fadeup flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: '600ms' }}>
        <Link to="/onboarding" className="lm lm-primary h-12 px-7 rounded-full text-[14px] font-medium flex items-center gap-2">
          Get started <span aria-hidden>→</span>
        </Link>
        <a href="#how" className="lm lm-light h-12 px-7 rounded-full text-[14px] font-medium flex items-center">
          See how it works
        </a>
        <span className="ml-2 text-[12px] text-[#7A807C]">
          Powered by <span className="text-[#111312]">Gemini</span> · <span className="text-[#111312]">Bhashini</span> · ABDM-ready
        </span>
      </div>
    </>
  )
}

function Meta({ k, v }) {
  return (
    <div className="leading-tight">
      <div className="text-[10px] text-[#8A8F8C]">{k}</div>
      <div className="text-[12px] text-[#111312]">{v}</div>
    </div>
  )
}

function ChipsCard() {
  const groups = [
    { t: 'Signals', items: [['Festivals', 2], ['AQI', 1], ['Outbreaks', 3]] },
    { t: 'Agents', items: [['Signal Collector'], ['Festival Surge'], ['Pollution Risk'], ['Forecasting'], ['Supply Chain']] },
  ]
  return (
    <div className="animate-fadeup flex flex-col gap-3" style={{ animationDelay: '420ms' }}>
      <div className="studio-card rounded-[22px] p-3 flex items-center gap-2">
        <Person name="Signal agents" role="Surveillance" c="#F6B8A6" i="SA" />
        <span className="text-[10px] text-[#111312]">▶</span>
        <Person name="Block officer" role="Decision" c="#B9E4C9" i="BO" />
      </div>
      <div className="studio-card rounded-[22px] p-5 flex-1">
        {groups.map((g) => (
          <div key={g.t} className="mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[17px] text-[#111312]">
                {g.t} <span className="text-[#8A8F8C]">({g.items.length})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map(([n, c]) => (
                <span key={n} className="h-7 px-3 rounded-full border border-black/[0.12] text-[11px] text-[#2A2E2C] flex items-center gap-1 bg-white/40">
                  {n}
                  {c != null && <span className="text-[#8A8F8C]">({c})</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="text-[17px] text-[#111312] mb-2.5">
          Action items <span className="text-[#8A8F8C]">(2)</span>
        </div>
        {['Pre-position O₂ at Hadapsar', 'Send Awadhi advisory'].map((a) => (
          <div key={a} className="flex items-center gap-2 mb-1.5">
            <span className="h-7 px-3 rounded-full border border-black/[0.12] text-[11px] text-[#2A2E2C] flex items-center bg-white/40">{a}</span>
            <span className="w-7 h-7 rounded-full border border-black/[0.12] flex items-center justify-center text-[#8A8F8C] text-[11px]">···</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Person({ name, role, c, i }) {
  return (
    <div className="flex-1 flex items-center gap-2.5 rounded-2xl bg-white/70 px-3 py-2">
      <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#111312]" style={{ background: c }}>
        {i}
      </span>
      <div className="leading-tight">
        <div className="text-[11.5px] text-[#111312]">{name}</div>
        <div className="text-[9.5px] text-[#8A8F8C]">{role}</div>
      </div>
    </div>
  )
}

function SignalPanel({ tab }) {
  const msgs = TRANSCRIPTS[tab]
  return (
    <div className="animate-fadeup studio-teal rounded-[26px] p-6 relative overflow-hidden" style={{ animationDelay: '480ms' }}>
      <div className="flex items-center gap-3 pb-4 border-b border-white/25">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-80">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 14 14" />
        </svg>
        <span className="text-[18px] font-light text-white/85">Search in live signals</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-5 text-[13px]">
        <span className="flex items-center gap-2">
          Surge outlook <span className="w-4 h-4 rounded-full border border-white/70 text-[9px] flex items-center justify-center">i</span>
        </span>
        {[
          ['Rising', 'bg-white'],
          ['Stable', 'bg-white/60'],
          ['Easing', 'bg-white/30'],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2 text-white/85">
            <span className={`w-2 h-2 rounded-full ${c}`} />
            {l}
          </span>
        ))}
      </div>

      {/* waveform timeline */}
      <div className="relative mt-5">
        <div className="relative h-10 rounded-full studio-glass-row">
          {WAVE.map(([l, w, s], i) => (
            <span
              key={i}
              className="wave-pill absolute top-1.5 bottom-1.5 rounded-full fade-in"
              style={{ left: `${l}%`, width: `${w}%`, opacity: s === 'rising' ? 1 : s === 'stable' ? 0.65 : 0.4, '--d': `${0.5 + i * 0.12}s` }}
            />
          ))}
          <span className="scrubber absolute -top-2 bottom-0 w-px bg-white">
            <span className="absolute -top-1 -left-[3px] w-[7px] h-[7px] rotate-45 bg-white" />
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-white/70 mt-1.5">
          <span>Today</span>
          <span>+14 days</span>
        </div>
      </div>

      <div className="text-[17px] mt-5 mb-3">Agent transcript</div>
      <div key={tab} className="flex flex-col gap-2">
        {msgs.map((m, i) => (
          <div key={i} className="rise studio-glass-row rounded-2xl flex items-center gap-3 px-3 py-2.5" style={{ '--i': i }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#111312] flex-none" style={{ background: m.c }}>
              {m.i}
            </span>
            <div className="w-[120px] flex-none leading-tight">
              <div className="text-[11px]">{m.who}</div>
              <div className="text-[9.5px] text-white/65">{m.t}</div>
            </div>
            <div className="text-[12px] text-white/90 flex-1 min-w-0">{m.m}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- chrome ---------- */

// Black pill toolbar; a white pill slides to the section currently in view.
function TopBar({ active }) {
  const refs = useRef({})
  const [pill, setPill] = useState(null)
  useLayoutEffect(() => {
    const el = refs.current[active]
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  return (
    <nav className="fixed top-0 inset-x-0 z-50 pt-3">
      <div className="max-w-[1180px] mx-auto px-6 flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full studio-card pl-3 pr-4 h-11">
          <span className="grid grid-cols-3 gap-[2px]">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#111312]/60" />
            ))}
          </span>
          <Brand />
          <span className="hidden lg:inline text-[#8A8F8C]">|</span>
          <span className="hidden lg:inline text-[13px] text-[#4A4F4C]">Health Hub</span>
        </div>

        <div className="relative hidden md:flex items-center gap-1 mx-auto bg-[#111312] rounded-full p-1.5 shadow-[0_10px_30px_rgba(17,19,18,0.25)]">
          {pill && (
            <span
              className="absolute top-1.5 bottom-1.5 rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              ref={(el) => (refs.current[s.id] = el)}
              href={`#${s.id}`}
              className={`relative z-[1] h-8 px-3.5 rounded-full flex items-center gap-1.5 text-[12px] transition-colors duration-300 ${
                active === s.id ? 'text-[#111312]' : 'text-white/75 hover:text-white'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </svg>
              {s.label}
            </a>
          ))}
          <span className="relative z-[1] w-px h-5 bg-white/20 mx-1" />
          <Link to="/dashboard" className="relative z-[1] h-8 px-3.5 rounded-full flex items-center gap-1.5 text-[12px] text-white/75 hover:text-white">
            Open dashboard →
          </Link>
        </div>

        <Link to="/onboarding" className="lm lm-primary h-11 px-5 rounded-full text-[13px] font-medium flex items-center ml-auto md:ml-0">
          Get started
        </Link>
      </div>
    </nav>
  )
}

// Slim vertical icon rail — section navigation on wide screens.
function LeftRail({ active }) {
  return (
    <div className="hidden min-[1440px]:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 studio-card rounded-full p-1.5">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          title={s.label}
          aria-label={s.label}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            active === s.id ? 'bg-[#111312] text-white scale-105' : 'text-[#6B706D] hover:bg-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {s.icon}
          </svg>
        </a>
      ))}
    </div>
  )
}

/* ---------- helpers ---------- */

// Which section is under the middle of the viewport.
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.4
      let cur = ids[0]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) cur = id
      })
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

// Inertial scrolling for the landing page only (the dashboard scrolls inside its own panes).
// Lenis drives the native window scroll, so sticky sections and scroll listeners keep working.
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09, anchors: { offset: 0 }, autoRaf: true })
    return () => {
      lenis.destroy()
      // destroy() can leave the root class behind; its height:auto rule would leak into other pages
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling')
    }
  }, [])
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    const fallback = setTimeout(() => setInView(true), 1600)
    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])
  return (
    <div ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// Cycles words in place: the old word lifts out, the next springs up from below.
// All words share one grid cell, so the slot is always as wide as the longest word.
function RotatingWord({ words, interval = 2200 }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])

  return (
    <span className="relative inline-grid overflow-hidden align-bottom pb-[0.08em]">
      <span className="sr-only">{words[0]}</span>
      {words.map((w, n) => {
        const state = n === i ? 'is-current' : n === (i - 1 + words.length) % words.length ? 'is-past' : 'is-next'
        return (
          <span
            key={w}
            aria-hidden
            className={`rotating-word ${state} [grid-area:1/1] whitespace-nowrap bg-clip-text text-transparent`}
            style={{ backgroundImage: 'linear-gradient(100deg,#14968C,#3FB58E)' }}
          >
            {w}
          </span>
        )
      })}
    </span>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-[#2D9C98] to-[#3FB58E] flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
      </div>
      <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#111312]">SwasthyaMitra</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand">{children}</div>
}
