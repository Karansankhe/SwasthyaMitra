import { useEffect, useMemo, useRef, useState } from 'react'
import { SevPill, Empty } from './ui.jsx'
import { stockTone, levelScore } from '../lib/selectors.js'
import { facilities as buildFacilities, scheduleBars, monthWeeks, layoutWeek, sameDay, startOfDay } from '../lib/schedule.js'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PAGE = 5
const LANE_H = 24
const KIND = {
  transfer: { dot: 'rgb(var(--brand))', label: 'Transfers' },
  event: { dot: '#F59E0B', label: 'Surge events' },
  action: { dot: '#EF4444', label: 'Due today' },
}
const hatch = 'repeating-linear-gradient(135deg, rgba(21,32,31,0.07) 0 1px, transparent 1px 7px)'

// Facility list · month calendar with spanning bars · facility profile.
export default function SupplySchedule({ rows, transfers, board, report }) {
  const all = useMemo(() => buildFacilities(rows, transfers), [rows, transfers])
  const bars = useMemo(() => scheduleBars({ transfers, board, report }), [transfers, board, report])
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const [month, setMonth] = useState(() => startOfDay(new Date()))
  const [query, setQuery] = useState('')
  const [kinds, setKinds] = useState({ transfer: true, event: true, action: true })

  const facility = all.find((f) => f.name === selected) || null
  const pages = Math.max(1, Math.ceil(all.length / PAGE))
  const shown = all.slice(page * PAGE, page * PAGE + PAGE)

  const visible = bars.filter(
    (b) =>
      kinds[b.kind] &&
      (!facility || b.kind !== 'transfer' || b.facilities.includes(facility.name)) &&
      (!query || `${b.label} ${b.detail}`.toLowerCase().includes(query.toLowerCase())),
  )
  const trs = visible.filter((b) => b.kind === 'transfer')
  const units = trs.reduce((t, b) => t + b.units, 0)
  const counts = ['pending', 'transit', 'delivered'].map((s) => trs.filter((b) => b.stage === s).length)

  // Three columns when there's room, otherwise the profile drops below.
  const wrap = useRef(null)
  const [wide, setWide] = useState(true)
  useEffect(() => {
    if (!wrap.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setWide(e.contentRect.width >= 1060))
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={wrap}
      className="grid gap-5 items-start"
      style={{ gridTemplateColumns: wide ? '240px minmax(0,1fr) 280px' : '240px minmax(0,1fr)' }}
    >
      {/* ---- facilities ---- */}
      <div className="flex flex-col gap-3">
        <FacilityCard
          f={{ name: 'All facilities', items: rows, incoming: transfers, outgoing: [], critical: all.reduce((t, f) => t + f.critical, 0), low: all.reduce((t, f) => t + f.low, 0), healthy: all.reduce((t, f) => t + f.healthy, 0) }}
          all
          active={!facility}
          onClick={() => setSelected(null)}
          i={0}
        />
        {shown.map((f, i) => (
          <FacilityCard key={f.name} f={f} active={facility?.name === f.name} onClick={() => setSelected(f.name)} i={i + 1} />
        ))}
        {all.length === 0 && <Empty>No facilities in the inventory or plan.</Empty>}
        {pages > 1 && (
          <div className="flex items-center justify-between glass-inset rounded-full px-2 py-1.5">
            <PageBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>←</PageBtn>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded-full text-[11px] transition-colors ${i === page ? 'bg-navy text-white' : 'text-muted hover:bg-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <PageBtn onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}>→</PageBtn>
          </div>
        )}
      </div>

      {/* ---- calendar ---- */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-4">
          {Object.entries(KIND).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setKinds((x) => ({ ...x, [k]: !x[k] }))}
              title={`Toggle ${v.label.toLowerCase()}`}
              className={`h-9 px-3 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all duration-300 ${
                kinds[k] ? 'bg-white text-navy shadow-[0_4px_12px_rgba(20,40,38,0.1)]' : 'glass-inset text-faint'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: kinds[k] ? v.dot : '#C9CECC' }} />
              {v.label}
            </button>
          ))}
          <div className="flex-1 flex items-center gap-2 h-9 px-3.5 rounded-full glass-inset">
            <span className="text-faint text-[12px]">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schedule"
              className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-navy placeholder:text-faint"
            />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="text-[28px] font-light tracking-[-0.02em] text-navy leading-none">
            {trs.length} transfer{trs.length === 1 ? '' : 's'} <span className="text-faint">/</span> {units.toLocaleString()} units
          </div>
          <div className="flex items-center gap-1 glass-inset rounded-full p-1">
            <PageBtn onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</PageBtn>
            <span className="text-[12px] font-medium text-navy px-2 min-w-[92px] text-center">
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <PageBtn onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</PageBtn>
          </div>
        </div>

        {/* proportional status bar */}
        <StatusBar counts={counts} />

        <div className="grid grid-cols-7 mt-5 mb-1.5">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-medium ${i >= 5 ? 'text-[#E07A5F]' : 'text-muted'}`}>
              {d}
            </div>
          ))}
        </div>
        <div key={`${month.getFullYear()}-${month.getMonth()}`} className="flex flex-col gap-1.5 fade-in">
          {monthWeeks(month).map((week, wi) => (
            <WeekRow key={wi} week={week} month={month} bars={visible} wi={wi} />
          ))}
        </div>
        <div className="text-[11px] text-faint mt-3">
          Dispatch windows are derived from each transfer's urgency; surge bars use the festival dates in the surveillance report.
        </div>
      </div>

      {/* ---- profile ---- */}
      <div className={wide ? '' : 'col-start-2'}>
        <FacilityProfile f={facility} all={all} transfers={transfers} board={board} />
      </div>
    </div>
  )
}

function PageBtn({ children, ...rest }) {
  return (
    <button className="w-7 h-7 rounded-full text-muted hover:bg-white hover:text-navy transition-colors disabled:opacity-30" {...rest}>
      {children}
    </button>
  )
}

// Segmented bar: widths proportional to transfer counts per stage.
function StatusBar({ counts }) {
  const segs = [
    { l: 'Pending', n: counts[0], bg: 'linear-gradient(90deg,#6FD8C9,#1FA592)', c: '#fff' },
    { l: 'In-transit', n: counts[1], bg: '#15201F', c: '#fff' },
    { l: 'Delivered', n: counts[2], bg: '#CDD2D0', c: '#15201F' },
  ]
  const total = counts.reduce((a, b) => a + b, 0)
  return (
    <div className="flex gap-1.5">
      {segs.map((s, i) => (
        <div key={s.l} className="min-w-[88px] transition-all duration-700" style={{ flex: `${total ? Math.max(s.n, total * 0.12) : 1} 1 0` }}>
          <div className="text-[11px] text-muted mb-1.5">{s.l}</div>
          <div className="rise h-9 rounded-full flex items-center px-3.5 text-[11px] font-medium" style={{ background: s.bg, color: s.c, '--i': i }}>
            {s.n} transfer{s.n === 1 ? '' : 's'}
          </div>
        </div>
      ))}
    </div>
  )
}

function WeekRow({ week, month, bars, wi }) {
  const placed = layoutWeek(week, bars)
  const lanes = placed.reduce((m, p) => Math.max(m, p.lane + 1), 0)
  const height = Math.max(70, 34 + lanes * LANE_H + 6)
  const today = new Date()
  return (
    <div className="relative grid grid-cols-7 gap-1.5 rise" style={{ height, '--i': wi }}>
      {week.map((d, i) => {
        const out = d.getMonth() !== month.getMonth()
        const isToday = sameDay(d, today)
        const weekend = i >= 5
        return (
          <div
            key={i}
            className={`rounded-2xl px-2.5 pt-2 text-[12px] transition-colors ${
              isToday
                ? 'bg-gradient-to-br from-[#3FB58E] to-[#14968C] text-white shadow-[0_8px_20px_rgba(20,150,140,0.3)]'
                : out
                  ? 'text-faint/60'
                  : 'bg-white/55 border border-white/80 text-navy'
            }`}
            style={!isToday && (out || weekend) ? { backgroundImage: hatch, backgroundColor: out ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)' } : undefined}
          >
            <div className="flex items-center justify-between">
              <span className={isToday ? 'font-semibold' : ''}>{d.getDate()}</span>
              {isToday && <span className="text-[9px] font-medium bg-white/25 rounded-full px-1.5">Today</span>}
            </div>
          </div>
        )
      })}
      {placed.map(({ bar, c0, c1, lane, clipL, clipR }) => {
        const k = KIND[bar.kind]
        const done = bar.stage === 'delivered'
        return (
          <div
            key={bar.id}
            title={`${bar.label} · ${bar.detail} · ${bar.range}`}
            className={`absolute h-[20px] flex items-center gap-1.5 px-2 text-[10.5px] bg-white shadow-[0_2px_8px_rgba(20,40,38,0.1)] fade-in ${
              clipL ? 'rounded-l-md' : 'rounded-l-full'
            } ${clipR ? 'rounded-r-md' : 'rounded-r-full'}`}
            style={{
              left: `calc(${(c0 / 7) * 100}% + 4px)`,
              width: `calc(${((c1 - c0 + 1) / 7) * 100}% - 8px)`,
              top: 32 + lane * LANE_H,
              opacity: done ? 0.55 : 1,
              '--d': `${0.2 + lane * 0.1}s`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: k.dot }} />
            <span className={`truncate text-navy font-medium ${done ? 'line-through' : ''}`}>{bar.label}</span>
            {c1 - c0 >= 1 && (
              <>
                <span className="flex-1 min-w-[8px] h-px border-t border-dashed border-navy/15" />
                <span className="text-faint whitespace-nowrap">{bar.range}</span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FacilityCard({ f, active, onClick, all, i }) {
  const total = Math.max(1, f.healthy + f.low + f.critical)
  const initials = all ? '∑' : f.name.slice(0, 2).toUpperCase()
  return (
    <button
      onClick={onClick}
      style={{ '--i': i }}
      className={`rise text-left rounded-[20px] p-3.5 transition-all duration-300 ${
        active ? 'bg-white shadow-[0_10px_26px_rgba(20,40,38,0.14)]' : 'glass-card hover:bg-white/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold flex-none ${
            active ? 'bg-navy text-white' : 'bg-gradient-to-br from-[#E3F6F2] to-[#BFEAE2] text-brand'
          }`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-navy truncate">{f.name}</div>
          <div className="text-[11px] text-faint truncate">
            {f.items.length} item{f.items.length === 1 ? '' : 's'} · {f.incoming.length} inbound
          </div>
        </div>
      </div>
      {/* stock health: healthy · critical · low (hatched) */}
      <div className="flex gap-1 mt-3 h-1.5">
        <span className="rounded-full bg-[#1FA592] transition-all duration-700" style={{ flex: f.healthy || 0.001 }} />
        <span className="rounded-full bg-navy transition-all duration-700" style={{ flex: f.critical || 0.001 }} />
        <span className="rounded-full transition-all duration-700" style={{ flex: f.low || (f.items.length ? 0.001 : total), backgroundImage: hatch, backgroundColor: '#E4E8E6' }} />
      </div>
    </button>
  )
}

function FacilityProfile({ f, all, transfers, board }) {
  const incoming = f ? f.incoming : transfers
  const outgoing = f ? f.outgoing : []
  const items = f ? f.items : all.flatMap((x) => x.items)
  const critical = f ? f.critical : all.reduce((t, x) => t + x.critical, 0)
  const low = f ? f.low : all.reduce((t, x) => t + x.low, 0)
  const healthyPct = items.length ? Math.round(((items.length - critical - low) / items.length) * 100) : 0
  const moves = [...incoming, ...outgoing]
  const delivered = moves.filter((t) => board[t.id]?.stage === 'delivered').length
  const donePct = moves.length ? Math.round((delivered / moves.length) * 100) : 0
  const mostStocked = items.slice().sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))[0]

  return (
    <div key={f?.name || 'all'} className="glass-card rounded-[26px] overflow-hidden fade-in">
      {/* banner */}
      <div
        className="h-24 relative"
        style={{
          background:
            'radial-gradient(120px 90px at 30% 110%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(160px 120px at 80% -20%, #8FE0D3, transparent 70%), linear-gradient(120deg,#0E7F77,#1FA592 55%,#A6E8DE)',
        }}
      >
        <span className="absolute left-1/2 -bottom-9 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-white p-1 shadow-[0_8px_20px_rgba(20,40,38,0.2)]">
          <span className="w-full h-full rounded-full bg-gradient-to-br from-[#E3F6F2] to-[#BFEAE2] flex items-center justify-center text-brand">
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 14V6l5.5-3.5L13.5 6v8M6 14V10h4v4M8 5.2v2.6M6.7 6.5h2.6" />
            </svg>
          </span>
        </span>
      </div>
      <div className="pt-11 px-5 pb-5">
        <div className="text-center">
          <div className="text-[18px] font-semibold text-navy">{f ? f.name : 'All facilities'}</div>
          <div className="text-[12px] text-faint">{f ? 'Primary Health Centre' : `${all.length} facilities in network`}</div>
        </div>

        <div className="text-[13px] font-semibold text-navy mt-5 mb-2">Basic information</div>
        {[
          ['Items tracked', items.length],
          ['Critical items', critical],
          ['Low stock', low],
          ['Inbound transfers', incoming.length],
          f ? ['Outbound transfers', outgoing.length] : ['Facilities', all.length],
          ['Most stocked', mostStocked ? mostStocked.item : '—'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2 text-[12px] py-1">
            <span className="text-muted whitespace-nowrap">{k}</span>
            <span className="flex-1 border-b border-dotted border-navy/20 translate-y-[-3px]" />
            <span className="text-navy font-medium truncate max-w-[120px]">{v}</span>
          </div>
        ))}

        <div className="text-[13px] font-semibold text-navy mt-4 mb-2">Transfers</div>
        <div className="grid grid-cols-2 gap-2">
          <Tile tone={{ bg: 'rgba(20,150,140,0.12)', c: '#0E7F77' }} label="Inbound" value={incoming.length} sub={`${incoming.filter((t) => levelScore(t.urgency) >= 75).length} urgent`} />
          {f ? (
            <Tile tone={{ bg: 'rgba(224,122,95,0.14)', c: '#C4553A' }} label="Outbound" value={outgoing.length} sub="to other PHCs" />
          ) : (
            <Tile tone={{ bg: 'rgba(224,122,95,0.14)', c: '#C4553A' }} label="Delivered" value={delivered} sub={`of ${moves.length} planned`} />
          )}
        </div>

        <div className="text-[13px] font-semibold text-navy mt-4 mb-2">Statistics</div>
        <Stat label="Stock health" value={`${healthyPct}%`} pct={healthyPct} color="#1FA592" />
        <Stat label="Transfers delivered" value={`${delivered}/${moves.length}`} pct={donePct} color="#15201F" />
        {items.slice(0, 1).map((r) => (
          <div key={r.id} className="mt-3 flex items-center gap-2 text-[11px] text-muted">
            <SevPill tone={stockTone(r.status)}>{r.status}</SevPill>
            <span className="truncate">{r.item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tile({ tone, label, value, sub }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: tone.bg }}>
      <div className="text-[11px] font-medium" style={{ color: tone.c }}>{label}</div>
      <div className="text-[20px] font-semibold text-navy leading-tight">{value}</div>
      <div className="text-[10px] text-faint">{sub}</div>
    </div>
  )
}

function Stat({ label, value, pct, color }) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-navy font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundImage: hatch, backgroundColor: '#E4E8E6' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
