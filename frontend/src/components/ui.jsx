export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-white border border-black/[0.06] rounded-2xl shadow-[0_1px_2px_rgba(28,34,32,0.05)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em]">{title}</h1>
        {subtitle && <div className="text-[13px] text-muted mt-[3px]">{subtitle}</div>}
      </div>
      {right}
    </div>
  )
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

export const btnPrimary =
  'h-[30px] rounded-full bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 cursor-pointer border-0 transition-colors'
export const btnGhost =
  'h-[30px] rounded-full border border-black/[0.12] hover:border-black/[0.24] bg-transparent text-muted hover:text-ink text-xs font-semibold px-3 cursor-pointer transition-colors'
