import { createContext, useContext, useState } from 'react'
import { api } from './lib/api.js'

const StoreContext = createContext(null)
const SESSION_KEY = 'prahari.session'

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    return null
  }
}

export function StoreProvider({ children }) {
  // Selected block + the analysis returned by the backend. Persisted so a
  // refresh keeps the user on the dashboard instead of re-onboarding.
  const [session, setSession] = useState(loadSession)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  // Tracks approve/dismiss decisions so a resolution on one screen shows everywhere.
  const [resolved, setResolved] = useState({})

  const startSession = (location, analysis = null, profile = null) => {
    const next = { location, analysis, profile, analysedAt: Date.now() }
    setSession(next)
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
  }

  const endSession = () => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }

  // Fetch a fresh report from the backend for the current (or given) block.
  const runAnalysis = async (loc) => {
    const location = loc || session?.location
    if (!location) return
    const profile = session?.profile || null
    setAnalyzeError('')
    setAnalyzing(true)
    try {
      const analysis = await api.post('/api/v1/surveillance/analyze', {
        location: `${location.district}, ${location.state}, India`,
        time_horizon: 'long',
      })
      startSession(location, analysis, profile)
    } catch (e) {
      setAnalyzeError(e.message || 'Could not reach the analysis service.')
    } finally {
      setAnalyzing(false)
    }
  }

  const approve = (id) => setResolved((r) => ({ ...r, [id]: 'approved' }))
  const dismiss = (id) => setResolved((r) => ({ ...r, [id]: 'dismissed' }))

  return (
    <StoreContext.Provider
      value={{ session, startSession, endSession, analyzing, analyzeError, runAnalysis, resolved, approve, dismiss }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
