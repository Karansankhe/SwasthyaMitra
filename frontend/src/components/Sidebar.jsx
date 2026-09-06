import { NavLink } from 'react-router-dom'
import { NAV } from '../data.js'
import { Icons } from '../icons.jsx'
import { useDashboard } from '../dashboard.jsx'

export default function Sidebar() {
  const { alerts } = useDashboard()
  const badges = { '/alerts': alerts.length }
  return (
    <aside className="w-56 flex-none bg-dark border-r border-white/[0.06] flex flex-col">
      <div className="h-14 flex items-center gap-2.5 px-[18px] border-b border-white/[0.08]">
        <div
          className="w-[22px] h-[22px] rounded-md bg-brand flex items-center justify-center"
          style={{ boxShadow: '0 0 14px rgba(242,120,92,0.5)' }}
        >
          <div className="w-[9px] h-[9px] rounded-[2px] bg-white" />
        </div>
        <div className="text-sm font-bold tracking-[-0.01em] text-white">SwasthyaMitra</div>
      </div>

      <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-auto">
        {NAV.map((item) => {
          const Icon = Icons[item.icon]
          const badge = badges[item.to]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-[11px] h-9 px-[11px] rounded-lg cursor-pointer text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-brand/20 ring-1 ring-inset ring-brand/40'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex w-4 h-4 ${isActive ? 'text-brand' : 'text-white/45'}`}>
                    <Icon />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="text-[10px] font-semibold text-white bg-brand rounded-[5px] px-1.5 py-px">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
