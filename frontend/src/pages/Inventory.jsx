import { useMemo, useState } from 'react'
import { useView } from '../view.js'
import { Card, CardHead, Skeleton, ErrorNote, SevPill, Empty, Bar, PageHeader, Count } from '../components/ui.jsx'
import { inventoryRows, toneOf, stockScore, stockTone } from '../lib/selectors.js'

// Stock levels across districts from /inventory/status.
export default function Inventory() {
  const { inventory, status, errors, load } = useView()
  const rows = useMemo(() => inventoryRows(inventory), [inventory])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const statuses = ['All', ...new Set(rows.map((r) => r.status))]
  const shown = rows
    .filter((r) => filter === 'All' || r.status === filter)
    .filter((r) => !search || `${r.item} ${r.district}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => stockScore(b.status) - stockScore(a.status))
  const maxStock = Math.max(1, ...rows.map((r) => r.stock || 0))

  const districts = useMemo(() => {
    const m = new Map()
    rows.forEach((r) => {
      const d = m.get(r.district) || { name: r.district, total: 0, critical: 0 }
      d.total++
      if (stockScore(r.status) >= 75) d.critical++
      m.set(r.district, d)
    })
    return [...m.values()].sort((a, b) => b.critical - a.critical)
  }, [rows])

  const loading = status.inventory === 'loading' || status.inventory === 'idle'

  return (
    <div className="px-7 pt-3">
      <PageHeader eyebrow="Stock" title="Inventory" subtitle="Current stock levels and critical stock-outs across districts" />

      <div className="grid grid-cols-3 gap-5 mb-4">
        {[
          ['Critical stock-outs', inventory?.critical_stockouts, toneOf('HIGH')],
          ['Districts impacted', inventory?.districts_impacted, toneOf('MEDIUM')],
          ['Items tracked', inventory ? rows.length : null, toneOf('LOW')],
        ].map(([label, val, tone], ki) => (
          <Card i={ki} key={label} className="px-5 py-4">
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: tone.dot }} />
              {label}
            </div>
            {loading ? <Skeleton className="h-8 w-16 mt-2" /> : <div className="text-[30px] font-semibold text-navy mt-1">{val != null ? <Count value={Number(val)} /> : '—'}</div>}
          </Card>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
        <Card i={2} className="overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 flex-wrap">
            <div className="text-[14px] font-semibold mr-auto">Stock register</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter items or districts…"
              className="h-9 w-56 px-4 rounded-full glass-inset text-[12px] outline-none focus:ring-4 focus:ring-brand/15"
            />
            <div className="flex gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-all duration-300 ${filter === s ? 'bg-navy text-white' : 'glass-inset text-muted hover:text-navy'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="px-5 pb-5 flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : status.inventory === 'error' ? (
            <ErrorNote title="Inventory service unavailable" message={errors.inventory} onRetry={() => load({ force: true })} />
          ) : shown.length === 0 ? (
            <Empty>{rows.length ? 'No items match this filter.' : 'The inventory agent returned no stock records.'}</Empty>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-faint border-y border-white/70 bg-white/40">
                  <th className="font-medium px-5 py-2.5">Item</th>
                  <th className="font-medium py-2.5">District</th>
                  <th className="font-medium py-2.5">Status</th>
                  <th className="font-medium py-2.5 pr-5 w-[200px]">Stock left</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const t = stockTone(r.status)
                  return (
                    <tr key={r.id} className="border-b border-white/60 hover:bg-white/50 transition-colors">
                      <td className="px-5 py-3 font-semibold">{r.item}</td>
                      <td className="py-3 text-body">{r.district}</td>
                      <td className="py-3"><SevPill tone={t}>{r.status}</SevPill></td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-10 text-right tabular-nums font-semibold">{r.stock ?? '—'}</span>
                          <div className="flex-1"><Bar pct={((r.stock || 0) / maxStock) * 100} color={t.dot} /></div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card i={3}>
          <CardHead title="By district" sub="Critical items per district" />
          <div className="px-5 pb-5">
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : districts.length ? (
              districts.map((d) => (
                <div key={d.name} className="py-2.5 border-b border-black/[0.05] last:border-0">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold">{d.name}</span>
                    <span className="text-[11px] text-muted tabular-nums">
                      <span className="text-danger font-semibold">{d.critical}</span> / {d.total}
                    </span>
                  </div>
                  <Bar className="h-1.5 mt-1.5" pct={(d.critical / d.total) * 100} color="#EF4444" />
                </div>
              ))
            ) : (
              <Empty>No district data.</Empty>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
