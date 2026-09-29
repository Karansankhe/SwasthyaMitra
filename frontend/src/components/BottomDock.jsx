import { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NAV } from '../data.js'
import { Icons } from '../icons.jsx'

const STEP = 24 // degrees between icons on the ring
const R = 200 // ring radius (px)
const W = 400 // dock width
const H = 120 // dock height (a half-ellipse W × H)
const ACTIVE_Y = 42 // centre of the active icon from the dock top

export function navIndex(pathname) {
  const i = NAV.findIndex((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  return i < 0 ? 0 : i
}

// Arc-shaped page slider: icons sit on a rotating ring so the active page
// always slides to the top-centre. Click, drag, scroll or use ←/→ to move.
export default function BottomDock() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = navIndex(pathname)
  const drag = useRef(null)
  const wheelLock = useRef(0)

  const go = (i) => {
    const next = Math.max(0, Math.min(NAV.length - 1, i))
    if (next !== active) navigate(NAV[next].to)
  }

  return (
    <nav
      aria-label="Page slider"
      className="pointer-events-auto relative select-none"
      style={{ width: W, height: H }}
      onWheel={(e) => {
        const now = Date.now()
        if (now - wheelLock.current < 450) return
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
        if (Math.abs(d) < 8) return
        wheelLock.current = now
        go(active + (d > 0 ? 1 : -1))
      }}
      onPointerDown={(e) => (drag.current = { x: e.clientX, moved: false })}
      onPointerMove={(e) => {
        if (!drag.current) return
        const dx = e.clientX - drag.current.x
        if (Math.abs(dx) > 46) {
          drag.current = { x: e.clientX, moved: true }
          go(active + (dx < 0 ? 1 : -1))
        }
      }}
      onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
      onPointerLeave={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(active + 1)
        if (e.key === 'ArrowLeft') go(active - 1)
      }}
    >
      {/* half-ellipse glass body */}
      <div
        className="glass-card absolute inset-0 overflow-clip"
        style={{ borderRadius: `${W / 2}px ${W / 2}px 0 0 / ${H}px ${H}px 0 0`, borderBottom: 0, boxShadow: '0 -10px 40px rgba(20,40,38,0.12), inset 0 1px 0 #fff' }}
      >
        <span className="absolute left-1/2 -translate-x-1/2 top-2.5 w-8 h-1 rounded-full bg-navy/15" />

        {/* rotating ring */}
        <div className="dock-ring absolute" style={{ left: W / 2, top: ACTIVE_Y + R, transform: `rotate(${-active * STEP}deg)` }}>
          {NAV.map((item, i) => {
            const Icon = Icons[item.icon]
            const on = i === active
            const off = Math.abs(i - active)
            const size = on ? 54 : 44
            return (
              <button
                key={item.to}
                type="button"
                aria-label={item.label}
                title={item.label}
                aria-current={on ? 'page' : undefined}
                onClick={() => !drag.current?.moved && go(i)}
                className={`dock-item absolute rounded-full flex items-center justify-center ${
                  on ? 'bg-navy text-white shadow-[0_10px_24px_rgba(21,32,31,0.35)]' : 'bg-white text-navy/70 hover:text-brand shadow-[0_4px_12px_rgba(20,40,38,0.14)]'
                }`}
                style={{
                  width: size,
                  height: size,
                  left: -size / 2,
                  top: -size / 2,
                  opacity: off > 2 ? 0 : 1,
                  pointerEvents: off > 2 ? 'none' : undefined,
                  transform: `rotate(${i * STEP}deg) translateY(${-R}px) rotate(${-i * STEP + active * STEP}deg)`,
                }}
              >
                <span className={`flex ${on ? 'w-[20px] h-[20px]' : 'w-[17px] h-[17px]'}`}>
                  <Icon width="100%" height="100%" />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div key={active} className="absolute left-0 right-0 text-center text-[12px] font-semibold text-navy fade-in pointer-events-none"
        style={{ top: ACTIVE_Y + 34 }}>
        {NAV[active].label}
      </div>
    </nav>
  )
}
