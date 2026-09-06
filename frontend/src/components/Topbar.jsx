import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useDashboard } from '../dashboard.jsx'
import SearchBar from './SearchBar.jsx'

export default function Topbar() {
  const navigate = useNavigate()
  const { session, analyzing } = useStore()
  const { ready, threat } = useDashboard()
  const blockName = session?.location?.name ?? 'Select block'
  const name = session?.profile?.name || 'Coordinator'
  const role = session?.profile?.role || 'District Coordinator'
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'

  return (
    <header className="h-14 flex-none border-b border-black/[0.08] flex items-center gap-4 px-5 bg-white/70 backdrop-blur-md">
      <button
        onClick={() => navigate('/onboarding')}
        title="Change block"
        className="flex items-center gap-[9px] h-[34px] px-3 border border-black/[0.10] hover:border-black/[0.18] rounded-lg bg-white cursor-pointer transition-colors"
      >
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#F2785C' }} />
        <span className="text-[13px] font-semibold">{blockName}</span>
        <span className="text-faint text-[11px]">▾</span>
      </button>

      {/* Threat level (from analysis) */}
      <div className="flex items-center gap-2 h-[30px] pl-[9px] pr-[11px] rounded-lg" style={{ background: threat.bg }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: threat.color, boxShadow: `0 0 8px ${threat.color}` }} />
        <span className="text-[10px] font-semibold tracking-[0.06em] text-muted">THREAT</span>
        <span className="text-xs font-bold" style={{ color: threat.color }}>{threat.label}</span>
      </div>

      <SearchBar />

      <div className="ml-auto flex items-center gap-3.5">
        {/* Live / no-data source indicator */}
        <div
          className="flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-[11px] font-semibold"
          style={
            ready || analyzing
              ? { background: 'rgba(242,120,92,0.12)', color: '#F2785C' }
              : { background: 'rgba(28,34,32,0.06)', color: '#5C665F' }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: ready || analyzing ? '#F2785C' : '#AAB1AA', animation: analyzing ? 'spin 1s linear infinite' : 'none' }}
          />
          {analyzing ? 'Analysing…' : ready ? 'Live data' : 'No data'}
        </div>
        <div className="flex items-center gap-[9px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#F2785C,#E15D3F)' }}>
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold">{name}</div>
            <div className="text-[10px] text-faint">{role}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
