import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import BottomDock, { navIndex } from './BottomDock.jsx'
import { useStore } from '../store.jsx'

const SIDEBAR_KEY = 'swasthya.sidebar'

export default function Layout() {
  const { session, load } = useStore()
  const { pathname } = useLocation()
  const wrapRef = useRef(null)
  const contentRef = useRef(null)
  const lenis = useRef(null)

  // Sidebar open ⇄ bottom dock visible. Remembered per browser.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== 'closed'
    } catch {
      return true
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? 'open' : 'closed')
    } catch {
      /* ignore */
    }
    // Content width changes as the sidebar animates; let Lenis re-measure.
    const t = setTimeout(() => lenis.current?.resize(), 520)
    return () => clearTimeout(t)
  }, [sidebarOpen])

  // Kick off the loading lifecycle whenever the region changes. Cached payloads
  // for the same region are reused, so a page refresh doesn't re-run the agents.
  useEffect(() => {
    load()
  }, [session?.query, load])

  // Smooth scrolling for the content pane. Inner scrollers opt out with
  // data-lenis-prevent.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    lenis.current = new Lenis({ wrapper: wrapRef.current, content: contentRef.current, lerp: 0.1, autoRaf: true })
    return () => {
      lenis.current?.destroy()
      lenis.current = null
    }
  }, [])

  // Pages slide in the direction of travel through the nav order.
  // (Derived during render so the new page mounts with the right animation.)
  const idx = navIndex(pathname)
  const nav = useRef({ idx, dir: 'next' })
  if (idx !== nav.current.idx) nav.current = { idx, dir: idx > nav.current.idx ? 'next' : 'prev' }
  const dir = nav.current.dir
  useLayoutEffect(() => {
    lenis.current ? lenis.current.scrollTo(0, { immediate: true }) : wrapRef.current?.scrollTo({ top: 0 })
  }, [idx])

  return (
    <div className="theme-glass relative flex h-screen w-full overflow-clip">
      <span className="orb w-[420px] h-[420px] bg-[#BFEAE2] -top-24 left-40" />
      <span className="orb w-[380px] h-[380px] bg-[#D8EEE9] top-1/3 -right-20" style={{ animationDelay: '-8s' }} />
      <span className="orb w-[360px] h-[360px] bg-[#CFEDE6] -bottom-24 left-1/3" style={{ animationDelay: '-14s' }} />

      {/* Sidebar collapses to zero width; the dock takes over navigation. */}
      <div
        className="sidebar-shell flex-none overflow-clip"
        style={{ width: sidebarOpen ? 248 : 0 }}
        aria-hidden={!sidebarOpen}
        inert={sidebarOpen ? undefined : ''}
      >
        <div className="w-[248px] h-full sidebar-panel" style={{ transform: sidebarOpen ? 'none' : 'translateX(-40px)', opacity: sidebarOpen ? 1 : 0 }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
      <div className="relative flex-1 flex flex-col min-w-0">
        <Topbar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
        <main ref={wrapRef} className="flex-1 overflow-auto">
          <div ref={contentRef} className={sidebarOpen ? 'pb-10' : 'pb-40'} style={{ '--dock-space': sidebarOpen ? '0px' : '140px' }}>
            <div key={pathname} className={dir === 'next' ? 'slide-next' : 'slide-prev'}>
              <Outlet />
            </div>
          </div>
        </main>
        {/* Bottom slider only while the sidebar is closed */}
        <div
          className="dock-shell pointer-events-none absolute bottom-0 inset-x-0 flex justify-center z-40"
          style={{ transform: sidebarOpen ? 'translateY(110%)' : 'none', opacity: sidebarOpen ? 0 : 1 }}
          aria-hidden={sidebarOpen}
          inert={sidebarOpen ? '' : undefined}
        >
          <BottomDock />
        </div>
      </div>
    </div>
  )
}
