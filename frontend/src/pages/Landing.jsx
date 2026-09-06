import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  { t: 'Signal fusion', d: 'Weather, AQI, festivals and outbreak feeds fused into one live risk picture.' },
  { t: 'Surge forecasting', d: 'Anticipate festival and pollution-driven surges before they hit.' },
  { t: 'Command center', d: 'One readiness view: risk, alerts and the signals driving them.' },
  { t: 'Multilingual advisories', d: 'SMS, IVR and WhatsApp advisories in regional dialects via Bhashini.' },
  { t: 'Scenario simulator', d: 'Model AQI, festivals and outbreaks to preview load and a plan.' },
  { t: 'Recommended actions', d: '24-hour, 7-day and 30-day actions, approved with a human in the loop.' },
]

const STEPS = [
  { n: '01', t: 'Choose your block', d: 'Pick the block you manage and set up your profile in seconds.' },
  { n: '02', t: 'Agents analyse signals', d: 'Specialised agents turn local data into a readiness report in under a minute.' },
  { n: '03', t: 'Act on the plan', d: 'Review recommendations and dispatch advisories with one approval.' },
]

const STATS = [
  { k: '3', v: 'surge triggers', s: 'festivals · pollution · outbreaks' },
  { k: '<60s', v: 'to a report', s: 'multi-agent analysis' },
  { k: '5+', v: 'AI agents', s: 'coordinated per block' },
  { k: 'Multi', v: 'lingual advisories', s: 'SMS · IVR · WhatsApp' },
]

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-white text-ink">
      <Nav />

      {/* ===== HERO (fills one frame) ===== */}
      <section className="relative overflow-hidden bg-dark text-white min-h-screen flex items-center">
        <div
          className="animate-glow pointer-events-none absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(242,120,92,0.55), transparent 60%)' }}
        />
        <div className="relative w-full max-w-6xl mx-auto px-6 pt-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="animate-fadeup inline-flex items-center gap-2 h-6 px-2.5 rounded-full bg-white/10 text-[11px] font-medium text-white/80 mb-4" style={{ animationDelay: '0ms' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Built for India&apos;s PHCs &amp; CHCs
              </div>
              <h1 className="animate-fadeup m-0 text-[32px] md:text-[44px] font-bold leading-[1.06] tracking-[-0.03em]" style={{ animationDelay: '90ms' }}>
                Get ahead of the <span style={{ color: '#F2785C' }}>next surge</span>.
              </h1>
              <p className="animate-fadeup mt-3.5 text-[14px] md:text-[15px] leading-relaxed text-white/70 max-w-[460px]" style={{ animationDelay: '180ms' }}>
                SwasthyaMitra reads local health signals — festivals, pollution, outbreaks — and hands rural
                health teams a live readiness plan before demand spikes.
              </p>
              <div className="animate-fadeup flex flex-wrap items-center gap-3 mt-6" style={{ animationDelay: '270ms' }}>
                <Link
                  to="/app"
                  className="h-11 px-6 rounded-full bg-brand hover:bg-brand-dark text-white text-[14px] font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_10px_30px_rgba(242,120,92,0.4)]"
                >
                  Get started <span aria-hidden>→</span>
                </Link>
                <a
                  href="#how"
                  className="h-11 px-6 rounded-full border border-white/20 hover:bg-white/10 text-white text-[14px] font-semibold flex items-center transition-all duration-200 hover:-translate-y-0.5"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="animate-fadeup" style={{ animationDelay: '360ms' }}>
              <div className="animate-float">
                <HeroPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <Reveal>
          <SectionLabel>The gap</SectionLabel>
          <h2 className="m-0 mt-2 text-[22px] md:text-[27px] font-bold tracking-[-0.02em] max-w-[560px]">
            Rural health centres react to surges. They rarely see them coming.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          {[
            { t: 'Stock-outs & delays', d: 'Supplies run dry mid-surge with no forward view of demand.' },
            { t: 'Predictable surges, missed', d: 'Festivals, winter AQI and monsoon outbreaks still overwhelm.' },
            { t: 'Disconnected blocks', d: 'Facilities can’t see or share load, so pressure lands late.' },
          ].map((p, i) => (
            <Reveal key={p.t} delay={i * 80}>
              <div className="rounded-2xl bg-dark text-white p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(28,34,32,0.25)]">
                <div className="w-8 h-8 rounded-lg bg-brand/20 text-brand flex items-center justify-center mb-3 text-[14px] font-bold">!</div>
                <div className="text-[15px] font-semibold">{p.t}</div>
                <div className="text-[12.5px] text-white/60 mt-1.5 leading-relaxed">{p.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="bg-[#FAFAF8] border-y border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <Reveal>
            <SectionLabel>Platform</SectionLabel>
            <h2 className="m-0 mt-2 text-[22px] md:text-[27px] font-bold tracking-[-0.02em] max-w-[560px]">
              One coordinator, a team of agents, one readiness plan.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 mt-7">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} delay={(i % 3) * 80}>
                <div className="rounded-2xl bg-white border border-black/[0.06] p-5 h-full shadow-[0_1px_2px_rgba(28,34,32,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(28,34,32,0.1)]">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3">
                    <span className="w-2 h-2 rounded-full bg-brand" />
                  </div>
                  <div className="text-[15px] font-semibold">{f.t}</div>
                  <div className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{f.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-14">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="m-0 mt-2 text-[22px] md:text-[27px] font-bold tracking-[-0.02em] max-w-[560px]">
            From block to plan in three steps.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="rounded-2xl border border-black/[0.08] p-5 h-full transition-all duration-300 hover:-translate-y-1 hover:border-brand/30">
                <div className="text-[12px] font-bold text-brand font-mono">{s.n}</div>
                <div className="text-[15px] font-semibold mt-2">{s.t}</div>
                <div className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{s.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== IMPACT (dark) ===== */}
      <section id="impact" className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <Reveal key={s.v} delay={i * 80}>
                <div className="text-[30px] md:text-[38px] font-bold tracking-[-0.02em]" style={{ color: '#F2785C' }}>{s.k}</div>
                <div className="text-[13px] font-semibold mt-0.5">{s.v}</div>
                <div className="text-[11px] text-white/50 mt-0.5">{s.s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
          <div className="rounded-3xl bg-dark text-white px-8 md:px-14 py-12 md:py-14 text-center relative overflow-hidden">
            <div
              className="animate-glow pointer-events-none absolute -bottom-28 -left-20 w-[360px] h-[360px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(242,120,92,0.6), transparent 60%)' }}
            />
            <h2 className="relative m-0 text-[24px] md:text-[32px] font-bold tracking-[-0.02em] max-w-[560px] mx-auto leading-[1.12]">
              Ready to see the next surge before it arrives?
            </h2>
            <p className="relative mt-3 text-[14px] text-white/70 max-w-[460px] mx-auto">
              Set up your block and get a live readiness report in under a minute.
            </p>
            <Link
              to="/app"
              className="relative inline-flex items-center gap-2 h-11 px-7 mt-6 rounded-full bg-brand hover:bg-brand-dark text-white text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(242,120,92,0.45)]"
            >
              Get started <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-9">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <Brand light />
            <div className="md:ml-auto flex flex-wrap gap-x-7 gap-y-2 text-[12.5px] text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How it works</a>
              <a href="#impact" className="hover:text-white transition-colors">Impact</a>
              <Link to="/app" className="hover:text-white transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 text-[11.5px] text-white/40">
            © {new Date().getFullYear()} SwasthyaMitra · Predictive readiness for India&apos;s primary health network.
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ---------- pieces ---------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/85 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
        <Brand light />
        <div className="hidden md:flex items-center gap-7 ml-8 text-[13px] text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
        </div>
        <Link
          to="/app"
          className="ml-auto h-9 px-4 rounded-full bg-brand hover:bg-brand-dark text-white text-[13px] font-semibold flex items-center transition-all duration-200 hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </div>
    </nav>
  )
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

function Brand({ light }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[24px] h-[24px] rounded-md bg-brand flex items-center justify-center" style={{ boxShadow: '0 0 16px rgba(242,120,92,0.5)' }}>
        <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: light ? '#1C2220' : '#FFFFFF' }} />
      </div>
      <div className={`text-[14px] font-bold tracking-[-0.01em] ${light ? 'text-white' : 'text-ink'}`}>SwasthyaMitra</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand">{children}</div>
}

function HeroPreview() {
  return (
    <div className="rounded-2xl bg-white text-ink p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] max-w-[360px] ml-auto">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-semibold">Command Center</div>
        <span className="text-[9px] font-bold text-danger bg-danger/[0.12] rounded-full px-2 py-0.5">HIGH RISK</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { l: 'Risk', v: 'HIGH', c: '#DC2626' },
          { l: 'Signals', v: '4', c: '#1C2220' },
          { l: 'AQI', v: 'Fair', c: '#F2785C' },
        ].map((t) => (
          <div key={t.l} className="rounded-lg border border-black/[0.06] p-2.5">
            <div className="text-[9px] text-faint">{t.l}</div>
            <div className="text-[16px] font-bold tabular-nums" style={{ color: t.c }}>{t.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { s: 'CRITICAL', t: 'Mass gathering during active outbreak', c: '#DC2626', bg: 'rgba(248,113,113,0.12)' },
          { s: 'HIGH', t: 'Festival surge window — trauma & burns', c: '#D97706', bg: 'rgba(251,191,36,0.12)' },
        ].map((a) => (
          <div key={a.t} className="flex items-center gap-2 rounded-lg bg-[#FAFAF8] border border-black/[0.05] px-2.5 py-2">
            <span className="text-[8px] font-bold rounded-full px-1.5 py-0.5" style={{ color: a.c, background: a.bg }}>{a.s}</span>
            <span className="text-[11px] font-medium truncate">{a.t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
