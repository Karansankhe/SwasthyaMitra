import { Fragment, useEffect, useRef, useState } from 'react'

// Small motion primitives for the landing page: count-up numbers, a decode
// effect for words, and a 3D letter-swap headline. All respect reduced motion.

const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// true once the element has scrolled into view (sticky), or `live` = tracks in/out
export function useInView(ref, { live = false, threshold = 0.35 } = {}) {
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
          if (!live) io.disconnect()
        } else if (live) setInView(false)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, live, threshold])
  return inView
}

/* ---------- count-up number ---------- */

export function CountUp({ to, prefix = '', suffix = '', delay = 0, duration = 1600 }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  const [n, setN] = useState(prefersReduced() ? to : 0)

  useEffect(() => {
    if (!inView || prefersReduced()) return
    let raf
    let t0
    const timer = setTimeout(() => {
      const tick = (now) => {
        t0 ??= now
        const k = Math.min(1, (now - t0) / duration)
        setN(Math.round(to * (1 - Math.pow(1 - k, 4))))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    // rAF pauses in hidden tabs; always land on the real value.
    const done = setTimeout(() => setN(to), delay + duration + 150)
    return () => {
      clearTimeout(timer)
      clearTimeout(done)
      cancelAnimationFrame(raf)
    }
  }, [inView, to, delay, duration])

  return (
    <span ref={ref} className="tabular-nums" aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {n}
      {suffix}
    </span>
  )
}

/* ---------- decode (scrambled letters settle one by one) ---------- */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function Decode({ text, delay = 0, duration = 1400 }) {
  const ref = useRef(null)
  const inView = useInView(ref)
  const [out, setOut] = useState(prefersReduced() ? text : text.replace(/\S/g, '·'))

  useEffect(() => {
    if (!inView || prefersReduced()) return
    let raf
    let t0
    const timer = setTimeout(() => {
      const tick = (now) => {
        t0 ??= now
        const k = Math.min(1, (now - t0) / duration)
        const settled = Math.floor(k * text.length)
        setOut(
          text
            .split('')
            .map((c, i) => (i < settled || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        )
        if (k < 1) raf = requestAnimationFrame(tick)
        else setOut(text)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [inView, text, delay, duration])

  return (
    <span ref={ref} aria-label={text}>
      {out}
    </span>
  )
}

/* ---------- 3D letter swap ----------
   Every letter is a tiny cube: the front face is the normal letter, the bottom
   face is its inverted (green) twin. Rolling the cubes 90° in a staggered wave
   swaps the whole line; it rolls back the same way. Plays on a loop while in
   view, and on hover. */

export function LetterSwap({ text, className = '', interval = 4200, hold = 1700 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { live: true, threshold: 0.5 })
  const [auto, setAuto] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!inView || prefersReduced()) return
    let off
    const play = () => {
      setAuto(true)
      off = setTimeout(() => setAuto(false), hold)
    }
    const first = setTimeout(play, 500)
    const id = setInterval(play, interval)
    return () => {
      clearTimeout(first)
      clearTimeout(off)
      clearInterval(id)
      setAuto(false)
    }
  }, [inView, interval, hold])

  let i = 0
  const words = text.split(' ')
  return (
    <span
      ref={ref}
      aria-label={text}
      className={`letter-swap ${auto || hover ? 'is-swapped' : ''} ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {w.split('').map((c, ci) => (
              <span key={ci} className="ls-letter" style={{ '--i': i++ }}>
                <span className="ls-cube">
                  <span className="ls-front">{c}</span>
                  <span className="ls-back">{c}</span>
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
