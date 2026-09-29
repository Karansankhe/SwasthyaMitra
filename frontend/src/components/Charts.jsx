import { useState } from 'react'
import { toneOf } from '../lib/selectors.js'

// Radar / spider chart for the compound-risk vectors (values 0–100).
export function RadarChart({ data, size = 260 }) {
  const [hover, setHover] = useState(null)
  const padX = 46 // room for axis labels left/right of the web
  const c = size / 2
  const r = size / 2 - 40
  const n = data.length
  const pt = (i, v) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [padX + c + Math.cos(a) * r * (v / 100), c + Math.sin(a) * r * (v / 100)]
  }
  const ring = (v) => data.map((_, i) => pt(i, v).join(',')).join(' ')
  const shape = data.map((d, i) => pt(i, d.value).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size + padX * 2} ${size}`} className="w-full h-auto max-w-[360px] mx-auto block" role="img" aria-label="Compound risk radar">
      {[25, 50, 75, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill={v === 100 ? 'rgba(255,255,255,0.55)' : 'none'} stroke="rgba(20,40,38,0.12)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100)
        return <line key={i} x1={padX + c} y1={c} x2={x} y2={y} stroke="rgba(20,40,38,0.1)" />
      })}
      {/* data shape grows out from the centre */}
      <g className="grow-from-center" style={{ transformOrigin: `${padX + c}px ${c}px` }}>
        <polygon points={shape} style={{ fill: 'rgb(var(--brand) / 0.16)', stroke: 'rgb(var(--brand))' }} strokeWidth="2" strokeLinejoin="round" />
      </g>
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value)
        const [lx, ly] = pt(i, 122)
        const t = toneOf(d.value)
        const active = hover === i
        return (
          <g key={d.axis} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="cursor-default fade-in" style={{ '--d': `${0.5 + i * 0.08}s` }}>
            <circle cx={x} cy={y} r={active ? 6 : 4.5} fill="#fff" stroke={t.dot} strokeWidth="2.5" />
            <text x={lx} y={ly - 5} textAnchor="middle" fontSize="12" fontWeight="600" fill="#3D4442">
              {d.axis}
            </text>
            <text x={lx} y={ly + 10} textAnchor="middle" fontSize="12" fontWeight="700" fill={t.c}>
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Area chart for the 14-day projected demand index.
export function AreaChart({ points, markers = [], height = 220 }) {
  const [hover, setHover] = useState(null)
  const W = 560
  const H = height
  const pad = { l: 34, r: 12, t: 16, b: 26 }
  const vals = points.map((p) => p.value)
  const min = Math.min(90, ...vals)
  const max = Math.max(...vals) + 8
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1)
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b)

  // Smooth path via Catmull–Rom → cubic Bézier.
  const P = points.map((p) => [x(p.i), y(p.value)])
  let d = `M${P[0][0]},${P[0][1]}`
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i]
    const p1 = P[i]
    const p2 = P[i + 1]
    const p3 = P[i + 2] || p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  const area = `${d} L${x(points.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`
  const ticks = [min, Math.round((min + max) / 2), Math.round(max)]
  const hp = hover != null ? points[hover] : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          const px = ((e.clientX - box.left) / box.width) * W
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (points.length - 1))
          setHover(Math.max(0, Math.min(points.length - 1, i)))
        }}
        role="img"
        aria-label="Projected demand index for the next 14 days"
      >
        <defs>
          <linearGradient id="dfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'rgb(var(--brand))', stopOpacity: 0.26 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(var(--brand))', stopOpacity: 0.01 }} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(20,40,38,0.1)" strokeDasharray="3 4" />
            <text x={pad.l - 7} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#8A908D">
              {Math.round(t)}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(100)} y2={y(100)} stroke="rgba(20,40,38,0.22)" />
        {markers.map((m) => (
          <g key={m.label + m.idx}>
            <line x1={x(m.idx)} x2={x(m.idx)} y1={pad.t} y2={H - pad.b} stroke="#F59E0B" strokeDasharray="2 3" />
            <rect x={x(m.idx) - 3} y={pad.t - 3} width="6" height="6" rx="1.5" fill="#F59E0B" />
          </g>
        ))}
        {/* area fades in while the line draws itself */}
        <path key={'a' + d} d={area} fill="url(#dfill)" className="fade-in" style={{ '--d': '0.5s' }} />
        <path
          key={'l' + d}
          d={d}
          fill="none"
          pathLength="1"
          className="draw"
          style={{ '--len': 1, stroke: 'rgb(var(--brand))' }}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {points.map((p) =>
          p.i % 2 === 0 ? (
            <text key={p.i} x={x(p.i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8A908D">
              {p.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </text>
          ) : null,
        )}
        {hp && (
          <g>
            <line x1={x(hp.i)} x2={x(hp.i)} y1={pad.t} y2={H - pad.b} stroke="rgba(20,40,38,0.3)" />
            <circle cx={x(hp.i)} cy={y(hp.value)} r="5" fill="#fff" style={{ stroke: 'rgb(var(--brand))' }} strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hp && (
        <div
          className="absolute top-1 pointer-events-none bg-navy text-white rounded-xl px-2.5 py-1.5 text-[11px] shadow-lg"
          style={{ left: `${(x(hp.i) / W) * 100}%`, transform: `translateX(${hp.i > points.length / 2 ? '-105%' : '8%'})` }}
        >
          <div className="font-semibold">{hp.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          <div className="text-white/70">
            Index <span className="text-white font-bold">{hp.value}</span> · {hp.value >= 100 ? '+' : ''}
            {hp.value - 100}% vs baseline
          </div>
          {markers.filter((m) => m.idx === hp.i).map((m) => (
            <div key={m.label} className="text-amber-300">{m.label}</div>
          ))}
        </div>
      )}
    </div>
  )
}
