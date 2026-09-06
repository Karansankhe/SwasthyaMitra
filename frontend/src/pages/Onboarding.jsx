import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCATIONS } from '../data.js'
import { useStore } from '../store.jsx'

export default function Onboarding() {
  const navigate = useNavigate()
  const { startSession } = useStore()

  const [id, setId] = useState(LOCATIONS[0].id)
  const [name, setName] = useState('')
  const [role, setRole] = useState('District Coordinator')

  const location = LOCATIONS.find((l) => l.id === id)

  const start = () => {
    // Enter the dashboard immediately; it runs the analysis with an inline loader.
    startSession(location, null, { name: name.trim() || 'Coordinator', role: role.trim() || 'District Coordinator' })
    navigate('/app', { replace: true })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas px-6 py-10">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-[26px] h-[26px] rounded-md bg-brand flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(242,120,92,0.45)' }}
          >
            <div className="w-[11px] h-[11px] rounded-[3px] bg-canvas" />
          </div>
          <div className="text-[15px] font-bold tracking-[-0.01em]">SwasthyaMitra</div>
        </div>

        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em] leading-tight">Set up your block</h1>
        <p className="mt-2 mb-7 text-[14px] text-muted leading-relaxed">
          SwasthyaMitra analyses local surge signals for the block you manage and prepares a live
          readiness dashboard.
        </p>

        <label className="block text-xs font-semibold text-muted mb-2.5">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. A. Verma"
          className="w-full h-11 px-3.5 mb-4 rounded-xl border border-black/[0.12] bg-white text-[14px] text-ink outline-none focus:border-brand transition-colors"
        />

        <label className="block text-xs font-semibold text-muted mb-2.5">Role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="District Coordinator"
          className="w-full h-11 px-3.5 mb-4 rounded-xl border border-black/[0.12] bg-white text-[14px] text-ink outline-none focus:border-brand transition-colors"
        />

        <label className="block text-xs font-semibold text-muted mb-2.5">Block</label>
        <BlockSelect value={id} onChange={setId} />

        <button
          onClick={start}
          className="mt-6 w-full h-11 rounded-full bg-brand hover:bg-brand-dark text-white text-[14px] font-bold cursor-pointer border-0 transition-colors"
        >
          Continue to dashboard
        </button>

        <div className="mt-4 text-[11px] text-faint">
          The dashboard will run a live analysis for your block — it can take up to a minute.
        </div>
      </div>
    </div>
  )
}

function BlockSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = LOCATIONS.find((l) => l.id === value)

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const label = (l) => `${l.name} · ${l.district}, ${l.state}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-11 px-3.5 rounded-xl border bg-white text-[14px] text-ink flex items-center justify-between transition-colors cursor-pointer ${
          open ? 'border-brand ring-2 ring-brand/20' : 'border-black/[0.12] hover:border-black/[0.2]'
        }`}
      >
        <span className="truncate">{label(selected)}</span>
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none"
          className={`ml-2 flex-none text-faint transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-black/[0.08] bg-white shadow-[0_12px_32px_rgba(28,34,32,0.12)] overflow-hidden p-1">
          {LOCATIONS.map((l) => {
            const active = l.id === value
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  onChange(l.id)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 h-10 flex items-center gap-2 rounded-lg text-[13px] transition-colors ${
                  active ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-canvas'
                }`}
              >
                <span className="flex-1 truncate">{label(l)}</span>
                {active && <span className="text-brand">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
