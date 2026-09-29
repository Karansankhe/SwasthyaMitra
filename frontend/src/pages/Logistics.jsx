import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useView } from '../view.js'
import { api, q } from '../lib/api.js'
import { Card, CardHead, Skeleton, Spinner, ErrorNote, SevPill, Empty, PageHeader, btnPrimary, btnGhost } from '../components/ui.jsx'
import SupplySchedule from '../components/SupplySchedule.jsx'
import { toneOf, inventoryRows, stockScore, stockTone, num } from '../lib/selectors.js'

const STAGES = [
  { key: 'pending', label: 'Pending Transfers', sub: 'Awaiting dispatch', dot: '#8A908D', bg: 'rgba(138,144,141,0.16)', icon: '◷' },
  { key: 'transit', label: 'In-Transit', sub: 'On the road', dot: '#F59E0B', bg: 'rgba(245,158,11,0.16)', icon: '➜' },
  { key: 'delivered', label: 'Delivered', sub: 'Received at PHC', dot: '#34A56A', bg: 'rgba(52,165,106,0.16)', icon: '✓' },
]

// Nodal-officer view: PHC map (inventory status), transfer Kanban (plan
// transfers → /distribution/reallocate) and the critical-shortage cards.
export default function Logistics() {
  const { session, inventory, transfers, shortages, status, errors, board, setStage, report } = useView()
  const [view, setView] = useState('schedule')
  const rows = useMemo(() => inventoryRows(inventory), [inventory])
  const critical = rows.filter((r) => stockScore(r.status) >= 45)
  const shortageCount = shortages.length + critical.length

  return (
    <div className="px-7 pt-3">
      <PageHeader eyebrow="Supply chain" title="Logistics & Supply" subtitle="Manage redistribution between PHCs across the district" />

      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px' }}>
        <Card i={0} className="overflow-hidden flex flex-col">
          <CardHead
            title="PHC network"
            sub="Stock status by facility · transfer routes"
            right={
              <div className="flex items-center gap-3 text-[11px] text-muted">
                <Legend c="#EF4444" l="Critical · receiving" />
                <Legend c="#F59E0B" l="Low · shortage" />
                <Legend c="#34A56A" l="Healthy · sending" />
                <span className="flex items-center gap-1.5">
                  <span className="w-4 border-t-2 border-dashed" style={{ borderColor: '#14968C' }} />
                  Transfer
                </span>
              </div>
            }
          />
          <PhcMap center={session?.geo} rows={rows} transfers={transfers} shortages={shortages} inventoryState={status.inventory} />
        </Card>

        <Card i={1} className="flex flex-col overflow-hidden">
          <CardHead title="Critical shortages" sub="Forecast and inventory flags" right={<SevPill tone={toneOf(shortageCount ? 'HIGH' : 'LOW')}>{shortageCount}</SevPill>} />
          <div className="flex-1 px-4 pb-4 overflow-auto max-h-[500px]" data-lenis-prevent>
            {(status.plan === 'loading' || status.inventory === 'loading') && shortageCount === 0 ? (
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : shortageCount === 0 ? (
              <Empty>No critical shortages reported.</Empty>
            ) : (
              <div className="flex flex-col gap-2.5">
                {shortages.map((s, i) => (
                  <ShortageCard key={s.id} i={i} tone={toneOf(s.severity)} title={s.title} line={s.desc} note={s.reason} tag="Forecast" />
                ))}
                {critical.map((r, i) => (
                  <ShortageCard
                    key={'inv' + r.id}
                    i={shortages.length + i}
                    tone={stockTone(r.status)}
                    title={`${r.item} in ${r.district}`}
                    line={r.stock != null ? `Stock left: ${r.stock}` : ''}
                    note=""
                    tag={r.status}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Transfer flow: stages sit on a rail, connectors drop to their cards */}
      <Card i={2} className="overflow-hidden">
        <CardHead
          title="Transfer board"
          sub={`${transfers.length} transfer${transfers.length === 1 ? '' : 's'} in the redistribution plan`}
          right={
            <div className="flex p-1 rounded-full glass-inset text-[12px] font-medium">
              {[
                ['schedule', 'Schedule'],
                ['flow', 'Flow'],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  className={`h-8 px-4 rounded-full transition-all duration-300 ${view === k ? 'bg-navy text-white shadow-[0_6px_14px_rgba(21,32,31,0.25)]' : 'text-muted hover:text-navy'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-6">
          {status.plan === 'loading' || status.plan === 'idle' ? (
            <div className="grid grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
              <div className="col-span-3 flex items-center gap-2 text-[12px] text-muted justify-center">
                <Spinner size={12} /> Supply Chain Agent is building the plan…
              </div>
            </div>
          ) : status.plan === 'error' ? (
            <ErrorNote title="Distribution plan unavailable" message={errors.plan} />
          ) : view === 'schedule' ? (
            <div key="schedule" className="slide-next">
              <SupplySchedule rows={rows} transfers={transfers} board={board} report={report} />
            </div>
          ) : (
            <div key="flow" className="relative slide-prev">
              <div className="rail absolute left-4 right-4 top-[18px] h-px" style={{ background: 'linear-gradient(90deg, #8A908D66, #F59E0B66, #34A56A66)' }} />
              <div className="grid grid-cols-3 gap-5">
                {STAGES.map((s, si) => {
                  const items = transfers.filter((t) => (board[t.id]?.stage || 'pending') === s.key)
                  return (
                    <div key={s.key} className="relative">
                      <div className="flex items-center gap-3">
                        <span
                          className="pop-in relative z-10 w-9 h-9 flex-none rounded-full flex items-center justify-center text-white text-[14px]"
                          style={{ background: s.dot, boxShadow: `0 0 0 6px ${s.bg}`, animationDelay: `${si * 0.15}s` }}
                        >
                          {s.icon}
                        </span>
                        <div className="glass-inset rounded-full pl-3 pr-3.5 h-8 flex items-center gap-2 relative z-10">
                          <span className="text-[12px] font-semibold text-navy">{s.label}</span>
                          <span className="text-[11px] text-faint tabular-nums">{items.length}</span>
                        </div>
                      </div>
                      <div className="connector absolute left-[17px] top-[40px] bottom-2 w-px bg-navy/10" style={{ '--i': si }} />
                      <div className="pl-11 pt-4 flex flex-col gap-3 min-h-[120px]">
                        {items.length === 0 && <div className="text-[11px] text-faint pt-2">{s.sub} · nothing here.</div>}
                        {items.map((t, ti) => (
                          <KanbanCard key={t.id} i={ti} t={t} state={board[t.id]} setStage={setStage} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function Legend({ c, l }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
      {l}
    </span>
  )
}

function ShortageCard({ tone, title, line, note, tag, i = 0 }) {
  return (
    <div className="rise hover-lift rounded-2xl glass-inset p-3.5 pl-4 relative overflow-hidden" style={{ '--i': i }}>
      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ background: tone.dot }} />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <SevPill tone={tone}>{tag}</SevPill>
      </div>
      <div className="text-[13px] font-semibold text-navy leading-snug">{title}</div>
      {line && <div className="text-[12px] font-semibold mt-1" style={{ color: tone.c }}>{line}</div>}
      {note && <div className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-3">{note}</div>}
    </div>
  )
}

function KanbanCard({ t, state, setStage, i = 0 }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const stage = state?.stage || 'pending'

  const dispatch = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await api.post('/api/v1/distribution/reallocate', {
        source_phc_id: t.from,
        target_phc_id: t.to,
        item_id: t.resource,
        quantity: Math.max(1, Math.round(num(t.quantity) || 1)),
      })
      setStage(t.id, 'transit', res?.transaction_id)
    } catch (e) {
      setErr(e.message || 'Dispatch failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rise hover-lift glass-strong rounded-[20px] p-3" style={{ '--i': i }}>
      {/* resource pill: icon circle + name + quantity */}
      <div className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 bg-[#5F6966]/90 text-white">
        <span className="w-7 h-7 rounded-full bg-white text-navy flex items-center justify-center text-[12px] flex-none">✚</span>
        <span className="text-[12px] font-medium truncate flex-1">{t.resource}</span>
        <span className="text-[11px] text-white/80 tabular-nums">×{t.quantity}</span>
      </div>
      <div className="flex items-center gap-2 mt-2.5 px-1">
        <div className="text-[11px] text-muted flex-1 min-w-0 truncate">
          {t.from} <span className="text-brand">→</span> {t.to}
        </div>
        <SevPill tone={toneOf(t.urgency)}>{t.urgency}</SevPill>
      </div>
      <div className="flex items-center justify-between mt-2.5 px-1 min-h-[28px]">
        <span className="text-[10px] text-faint font-mono">{state?.txn || ''}</span>
        {stage === 'pending' && (
          <button onClick={dispatch} disabled={busy} className={`${btnPrimary} !h-7 !px-3 flex items-center gap-1.5`}>
            {busy && <Spinner size={10} className="!border-white/40 !border-t-white" />} Dispatch
          </button>
        )}
        {stage === 'transit' && (
          <button onClick={() => setStage(t.id, 'delivered')} className={`${btnGhost} !h-7`}>
            Mark delivered
          </button>
        )}
        {stage === 'delivered' && <span className="text-[11px] font-semibold text-[#2F7A4F]">✓ Delivered</span>}
      </div>
      {err && <div className="text-[11px] text-danger mt-1.5 px-1">{err}</div>}
    </div>
  )
}

// ---- map --------------------------------------------------------------------
const geoCache = new Map()
function geocodeOnce(query) {
  if (!geoCache.has(query)) {
    geoCache.set(
      query,
      api
        .get(`/api/v1/surveillance/geocode?location=${q(query)}`)
        .then((g) => ({ lat: Number(g.lat), lon: Number(g.lon) }))
        .catch(() => null),
    )
  }
  return geoCache.get(query)
}

const kmBetween = (a, b) => {
  const r = Math.PI / 180
  const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r)
  const y = (b.lat - a.lat) * r
  return Math.sqrt(x * x + y * y) * 6371
}

// Plan locations are often descriptive ("Dadar/Andheri District Hospitals",
// "Andheri Emergency Dept"). Strip facility words and split on "/", "and", ","
// to get geocodable place names.
const GENERIC =
  /\b(district|districts|hospitals?|phcs?|chcs?|emergency|dept|department|eds?|transit|hubs?|central|medical|stores?|peripheral|urban|rural|high|low|density|traffic|market|facilit(?:y|ies)|centres?|centers?|primary|health|wards?|areas?|zones?|block|region|the|of|all|nearby)\b/gi

export function placeCandidates(name) {
  const raw = String(name || '').replace(/\(.*?\)/g, ' ')
  const parts = raw
    .split(/\/|,|&|\band\b/i)
    .map((p) => p.replace(GENERIC, ' ').replace(/[^A-Za-z .'-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length >= 3)
  return [...new Set([raw.trim(), ...parts])].filter(Boolean)
}

// Qualify each candidate with the region's state and keep only matches inside
// the operational region (so "Andheri" can't land in another state).
async function geocodeName(name, center) {
  const ctx = [center.state, center.country].filter(Boolean).join(', ')
  for (const cand of placeCandidates(name)) {
    for (const query of ctx ? [`${cand}, ${ctx}`, cand] : [cand]) {
      const g = await geocodeOnce(query)
      if (g && kmBetween(center, g) < 150) return g
    }
  }
  return null
}

// Popup content is HTML; everything shown comes from agent output.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const STATUS_COLOR = (s) => {
  const v = stockScore(s)
  return v >= 75 ? '#EF4444' : v >= 45 ? '#F59E0B' : '#34A56A'
}

const ROUTE = '#14968C'
const ROLE = {
  to: { color: '#EF4444', label: 'Receiving transfer' },
  from: { color: '#34A56A', label: 'Sending stock' },
  shortage: { color: '#F59E0B', label: 'Predicted shortage' },
}

function PhcMap({ center, rows, transfers, shortages = [], inventoryState }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const [resolving, setResolving] = useState(false)
  const [missing, setMissing] = useState({ names: [], outside: 0, plotted: 0 })

  useEffect(() => {
    if (!el.current || map.current || !center) return
    map.current = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([center.lat, center.lon], 9)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      className: 'map-tiles-soft',
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    // Re-measure when the container resizes (e.g. sidebar open/close).
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.current?.invalidateSize()) : null
    ro?.observe(el.current)
    return () => {
      ro?.disconnect()
      map.current?.remove()
      map.current = null
    }
  }, [center])

  // Plot inventory facilities, transfer endpoints and shortage areas, with
  // transfer routes between endpoints that resolve inside the region.
  useEffect(() => {
    if (!map.current || !center) return
    let cancelled = false
    const places = new Map() // name → { name, items, roles:Set, notes:[] }
    const add = (name, role, note) => {
      if (!name || name === '—') return
      const p = places.get(name) || { name, items: [], roles: new Set(), notes: [] }
      if (role) p.roles.add(role)
      if (note) p.notes.push(note)
      places.set(name, p)
    }
    rows.forEach((r) => {
      add(r.district)
      places.get(r.district).items.push(r)
    })
    transfers.forEach((t) => {
      add(t.from, 'from', `Sends ${t.resource} (${t.quantity})`)
      add(t.to, 'to', `Receives ${t.resource} (${t.quantity}) · ${t.urgency}`)
    })
    shortages.forEach((s) => add(s.area, 'shortage', `${s.item || 'Shortage'}${s.desc ? ` · ${s.desc}` : ''}`))
    const names = [...places.keys()].slice(0, 20)

    setResolving(names.length > 0)
    Promise.all(names.map((n) => geocodeName(n, center).then((g) => [n, g]))).then((pairs) => {
      if (cancelled || !map.current) return
      setResolving(false)
      const pos = new Map(pairs.filter(([, g]) => g))
      const g = layer.current
      g.clearLayers()

      L.circleMarker([center.lat, center.lon], { radius: 7, color: '#111312', weight: 2, fillColor: '#fff', fillOpacity: 1 })
        .bindTooltip('Operational region', { direction: 'top' })
        .addTo(g)

      transfers.forEach((t) => {
        const a = pos.get(t.from)
        const b = pos.get(t.to)
        if (!a || !b) return
        L.polyline([[a.lat, a.lon], [b.lat, b.lon]], { color: ROUTE, weight: 3, dashArray: '6 6', opacity: 0.85 })
          .bindTooltip(esc(`${t.resource} · ${t.quantity}`), { sticky: true })
          .addTo(g)
      })

      const bounds = [[center.lat, center.lon]]
      pos.forEach((p, name) => {
        const place = places.get(name)
        const worst = place.items.reduce((m, r) => (stockScore(r.status) > stockScore(m) ? r.status : m), '')
        const color = place.items.length
          ? STATUS_COLOR(worst)
          : ROLE[['to', 'shortage', 'from'].find((r) => place.roles.has(r))]?.color || ROUTE
        const lines = [
          ...place.items.map((r) => `${esc(r.item)}: <b>${esc(r.status)}</b>${r.stock != null ? ` (${r.stock} left)` : ''}`),
          ...place.notes.map(esc),
        ]
        L.circleMarker([p.lat, p.lon], { radius: 9, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.95 })
          .bindTooltip(esc(name), { direction: 'top' })
          .bindPopup(`<div style="font-size:12px;max-width:220px"><b>${esc(name)}</b><br/>${lines.join('<br/>')}</div>`)
          .addTo(g)
        bounds.push([p.lat, p.lon])
      })
      if (bounds.length > 1) map.current.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })

      const unresolved = names.filter((n) => !pos.has(n))
      setMissing({
        // state-level inventory rows (e.g. "Uttar Pradesh") sit outside a city region
        outside: unresolved.filter((n) => places.get(n).items.length).length,
        names: unresolved.filter((n) => !places.get(n).items.length),
        plotted: pos.size,
      })
    })
    return () => {
      cancelled = true
    }
  }, [center, rows, transfers, shortages])

  return (
    <div className="relative flex-1 min-h-[440px] mx-4 mb-4 rounded-2xl overflow-hidden border border-white/80">
      <div ref={el} className="absolute inset-0" />
      {(resolving || inventoryState === 'loading') && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-white/95 rounded-full px-3 py-1.5 text-[11px] text-muted shadow flex items-center gap-2">
          <Spinner size={11} /> {inventoryState === 'loading' ? 'Loading inventory status…' : 'Locating facilities…'}
        </div>
      )}
      {/* What couldn't be placed, so an empty-looking map is explained */}
      {!resolving && (missing.names.length > 0 || missing.outside > 0 || inventoryState === 'error') && (
        <div className="absolute bottom-3 left-3 z-[500] max-w-[70%] bg-white/95 rounded-xl px-3 py-2 text-[11px] text-muted shadow leading-relaxed">
          <div className="font-semibold text-navy mb-0.5">
            {missing.plotted ? `${missing.plotted} location${missing.plotted === 1 ? '' : 's'} mapped` : 'No facility locations could be mapped'}
          </div>
          {missing.names.length > 0 && (
            <div>
              Not on map: {missing.names.slice(0, 4).join(' · ')}
              {missing.names.length > 4 ? ` +${missing.names.length - 4} more` : ''}
            </div>
          )}
          {missing.outside > 0 && <div>{missing.outside} inventory record{missing.outside === 1 ? ' is' : 's are'} state-level, outside this region</div>}
          {inventoryState === 'error' && <div>Inventory status unavailable</div>}
        </div>
      )}
    </div>
  )
}
