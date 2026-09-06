import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAV } from '../data.js'
import { useDashboard } from '../dashboard.jsx'

export default function SearchBar() {
  const navigate = useNavigate()
  const { alerts } = useDashboard()
  const ref = useRef(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const index = useMemo(() => {
    const idx = NAV.map((n) => ({ label: n.label, sub: 'Page', type: 'Page', tag: 'P', to: n.to }))
    alerts.forEach((a) => idx.push({ label: a.title, sub: [a.fac, a.sev].filter(Boolean).join(' · '), type: 'Alert', tag: 'A', to: '/alerts' }))
    return idx
  }, [alerts])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return index.filter((i) => i.label.toLowerCase().includes(s) || i.sub.toLowerCase().includes(s)).slice(0, 8)
  }, [q, index])

  useEffect(() => setActive(0), [q])

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const go = (item) => {
    if (!item) return
    navigate(item.to)
    setQ('')
    setOpen(false)
  }

  const onKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-[420px]">
      <div className={`flex items-center gap-2.5 h-[34px] px-3 border rounded-lg bg-white transition-colors ${open ? 'border-brand ring-2 ring-brand/15' : 'border-black/[0.09]'}`}>
        <span className="text-[13px] text-faint">⌕</span>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search pages and alerts…"
          className="flex-1 bg-transparent border-0 outline-none text-ink text-[13px] placeholder:text-faint"
        />
        <span className="text-[10px] text-faint font-mono border border-black/[0.12] rounded px-[5px] py-px">⌘K</span>
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-black/[0.08] rounded-xl shadow-[0_12px_32px_rgba(28,34,32,0.12)] p-1.5 z-30 max-h-[360px] overflow-auto">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-[13px] text-faint">No matches for “{q}”</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.type + r.label}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={`w-full text-left px-2 h-11 rounded-lg flex items-center gap-2.5 transition-colors ${i === active ? 'bg-brand/10' : 'hover:bg-black/[0.03]'}`}
              >
                <span className="w-[26px] h-[26px] rounded-md bg-brand/10 text-brand flex items-center justify-center text-[11px] font-bold flex-none">{r.tag}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-ink truncate">{r.label}</div>
                  {r.sub && <div className="text-[11px] text-faint truncate">{r.sub}</div>}
                </div>
                <span className="text-[10px] text-faint flex-none">{r.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
