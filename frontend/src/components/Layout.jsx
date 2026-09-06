import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useStore } from '../store.jsx'

export default function Layout() {
  const { session, analyzing, analyzeError, runAnalysis } = useStore()

  // Auto-run analysis once when a block is selected but no report exists yet.
  useEffect(() => {
    if (session?.location && !session.analysis && !analyzing && !analyzeError) {
      runAnalysis()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.location, session?.analysis])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
