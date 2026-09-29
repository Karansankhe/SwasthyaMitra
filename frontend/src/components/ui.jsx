import { useEffect, useState } from 'react'

// Frosted-glass surface. `i` staggers its entrance animation.
export function Card({ className = '', children, i, style, ...rest }) {
  return (
    <div
      className={`glass-card rounded-[22px] ${i != null ? 'rise' : ''} ${className}`}
      style={i != null ? { '--i': i, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 rise">
      <div>
        {eyebrow && <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand mb-1">{eyebrow}</div>}
        <h1 className="m-0 font-display text-[26px] font-semibold tracking-[-0.02em] text-navy">{title}</h1>
        {subtitle && <div className="text-[13px] text-muted mt-1">{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Eases a number up to `value`; non-numeric values render as-is.
export function Count({ value, duration = 1100 }) {
  const target = typeof value === 'number' ? value : null
  const [n, setN] = useState(target == null || reduced() ? target : 0)
  useEffect(() => {
    if (target == null || reduced()) return setN(target)
    let raf
    let t0
    const tick = (now) => {
      t0 ??= now
      const k = Math.min(1, (now - t0) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // rAF pauses in hidden tabs; always land on the real value.
    const done = setTimeout(() => setN(target), duration + 150)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
  }, [target, duration])
  return <span className="tabular-nums">{target == null ? value : n}</span>
}

export function Badge({ color, bg, children, className = '' }) {
  return (
    <span
      className={`text-[10px] font-bold tracking-[0.04em] rounded-full px-2 py-1 whitespace-nowrap ${className}`}
      style={{ color, background: bg }}
    >
      {children}
    </span>
  )
}

export function Bar({ pct, color, className = 'h-1.5' }) {
  return (
    <div className={`${className} rounded-full bg-black/[0.06] overflow-hidden`}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function Empty({ children }) {
  return <div className="px-4 py-8 text-center text-[13px] text-faint">{children}</div>
}

// Liquid metal buttons — see .lm in index.css
export const btnPrimary = 'lm lm-primary h-[30px] rounded-full text-xs font-semibold px-4 cursor-pointer'
export const btnGhost = 'lm lm-light h-[30px] rounded-full text-muted hover:text-ink text-xs font-semibold px-3 cursor-pointer'

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-brand/25 border-t-brand flex-none ${className}`}
      style={{ width: size, height: size, animation: 'spin 0.7s linear infinite' }}
    />
  )
}

// Inline notice for a panel whose backend call failed.
export function ErrorNote({ title = 'Unavailable', message, onRetry }) {
  return (
    <div className="px-4 py-7 text-center">
      <div className="text-[13px] font-semibold text-ink">{title}</div>
      {message && <div className="text-[12px] text-faint mt-1 max-w-[360px] mx-auto leading-relaxed">{message}</div>}
      {onRetry && (
        <button onClick={onRetry} className={`${btnGhost} mt-3`}>
          Retry
        </button>
      )}
    </div>
  )
}

export function SevPill({ tone, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.05em] uppercase rounded-full px-2 py-[3px] whitespace-nowrap ${className}`}
      style={{ color: tone.c, background: tone.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.dot }} />
      {children}
    </span>
  )
}

export function CardHead({ title, sub, right }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-ink">{title}</div>
        {sub && <div className="text-[11px] text-faint mt-0.5">{sub}</div>}
      </div>
      {right}
    </div>
  )
}
