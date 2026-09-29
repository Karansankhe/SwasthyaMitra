import { NavLink, useNavigate } from 'react-router-dom'
import { NAV } from '../data.js'
import { Icons } from '../icons.jsx'
import { useView } from '../view.js'

// Floating glass sidebar (reference: soft clinical glass dashboard).
export default function Sidebar({ onClose }) {
  const navigate = useNavigate()
  const { kpi, shortages, region, session, endSession } = useView()
  const badges = {
    '/dashboard/surveillance': kpi.alertsHigh,
    '/dashboard/logistics': shortages.length,
    '/dashboard/inventory': kpi.stockouts || 0,
  }
  const initials = (session?.geo?.city || region).slice(0, 2).toUpperCase()

  return (
    <aside className="relative z-10 w-[248px] h-full flex-none p-4 pr-0">
      <div className="glass-card h-full rounded-[28px] flex flex-col overflow-hidden">
        <div className="h-[72px] flex items-center gap-3 px-5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#3FB58E] to-[#14968C] flex items-center justify-center shadow-[0_8px_18px_rgba(20,150,140,0.35)]">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-navy whitespace-nowrap">Swasthya Mitra</div>
            <div className="text-[10px] text-faint whitespace-nowrap truncate">Health supply intelligence</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              title="Close sidebar (use the bottom slider)"
              aria-label="Close sidebar"
              className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-faint hover:text-navy hover:bg-white/70 transition-colors flex-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2.5" width="12" height="11" rx="2.5" />
                <path d="M6 2.5v11M10.5 6.5 9 8l1.5 1.5" />
              </svg>
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 pt-2 flex flex-col gap-1 overflow-auto">
          {NAV.map((item, i) => {
            const Icon = Icons[item.icon]
            const badge = badges[item.to]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={{ '--i': i }}
                className={({ isActive }) =>
                  `rise group relative flex items-center gap-3 h-11 px-3.5 rounded-2xl text-[13px] font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-[#1FA592] to-[#14968C] shadow-[0_8px_20px_rgba(20,150,140,0.3)]'
                      : 'text-body hover:bg-white/60 hover:text-navy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex w-4 h-4 ${isActive ? 'text-white' : 'text-faint group-hover:text-brand'}`}>
                      <Icon />
                    </span>
                    <span className="flex-1 truncate whitespace-nowrap">{item.label}</span>
                    {badge > 0 && (
                      <span
                        className={`text-[10px] font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center tabular-nums ${
                          isActive ? 'bg-white/25 text-white' : 'bg-brand/10 text-brand'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="m-3 p-3 rounded-2xl glass-inset flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E3F6F2] to-[#BFEAE2] text-brand text-[13px] font-bold flex items-center justify-center flex-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-navy truncate">{region}</div>
            <button
              onClick={() => {
                endSession()
                navigate('/onboarding')
              }}
              className="text-[11px] font-medium text-brand hover:text-brand-dark"
            >
              Change region
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
