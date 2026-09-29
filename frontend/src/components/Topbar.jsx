import { useView } from '../view.js'
import SearchBar from './SearchBar.jsx'
import { Skeleton, Spinner } from './ui.jsx'
import { toneOf } from '../lib/selectors.js'

const AQI_TONE = { 1: 'GREEN', 2: 'GREEN', 3: 'AMBER', 4: 'RED', 5: 'CRITICAL' }

function greeting(h = new Date().getHours()) {
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

// Header: greeting + region, search, and live weather/AQI from /surveillance/snapshot.
export default function Topbar({ sidebarOpen = true, onOpenSidebar }) {
  const { region, weather, status, session } = useView()
  const busy = Object.values(status).some((s) => s === 'loading')
  const aqiTone = toneOf(AQI_TONE[weather?.aqi_index] || '')
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header className="relative z-20 flex-none flex items-center gap-4 px-7 pt-5 pb-3">
      {!sidebarOpen && (
        <button
          onClick={onOpenSidebar}
          title="Open sidebar"
          aria-label="Open sidebar"
          className="glass-card pop-in w-10 h-10 rounded-full flex items-center justify-center text-navy/70 hover:text-brand flex-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2.5" width="12" height="11" rx="2.5" />
            <path d="M6 2.5v11M9 6.5 10.5 8 9 9.5" />
          </svg>
        </button>
      )}
      <div className="min-w-0 rise">
        <div className="text-[11px] text-faint">{today}</div>
        <div className="text-[19px] font-semibold tracking-[-0.01em] text-navy truncate">
          {greeting()}, <span className="text-brand">{session?.geo?.city || region}</span>
        </div>
      </div>

      <SearchBar />

      <div className="flex items-center gap-2 rise" style={{ '--i': 2 }}>
        {weather ? (
          <>
            <Chip>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
              </svg>
              <span className="font-semibold tabular-nums text-navy">
                {weather.temperature != null ? `${Math.round(weather.temperature)}°C` : '—'}
              </span>
              <span className="text-muted capitalize hidden xl:inline">{weather.description}</span>
            </Chip>
            <Chip>
              <span className="w-2 h-2 rounded-full" style={{ background: aqiTone.dot }} />
              <span className="text-muted">AQI</span>
              <span className="font-semibold" style={{ color: aqiTone.c }}>{weather.aqi_label || '—'}</span>
            </Chip>
          </>
        ) : status.snapshot === 'loading' ? (
          <>
            <Skeleton className="w-24 h-10 !rounded-full" />
            <Skeleton className="w-28 h-10 !rounded-full" />
          </>
        ) : null}
        <Chip>
          {busy ? <Spinner size={12} /> : <span className="w-2 h-2 rounded-full bg-[#34A56A] node-pulse" />}
          <span className={busy ? 'text-[#B45309] font-medium' : 'text-[#2F7A4F] font-medium'}>{busy ? 'Agents working' : 'Live'}</span>
        </Chip>
      </div>
    </header>
  )
}

function Chip({ children }) {
  return <div className="glass-card flex items-center gap-2 h-10 px-4 rounded-full text-[12px] whitespace-nowrap">{children}</div>
}
