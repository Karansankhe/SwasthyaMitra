import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, q } from './lib/api.js'
import { reportOf } from './lib/selectors.js'

const StoreContext = createContext(null)
const SESSION_KEY = 'swasthya.session'
const DATA_KEY = 'swasthya.data'
const BOARD_KEY = 'swasthya.board'

const PARTS = ['snapshot', 'inventory', 'alerts', 'analysis', 'plan']
const IDLE = Object.fromEntries(PARTS.map((p) => [p, 'idle']))

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null
  } catch {
    return null
  }
}
function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state still lives in memory */
  }
}

// Pulls a readable message out of an LLM/provider error payload, if any.
function upstreamError(v) {
  if (!v || typeof v !== 'object') return ''
  const e = v.error
  if (e) {
    const msg = typeof e === 'string' ? e : e.message || e.status || ''
    if (/quota|RESOURCE_EXHAUSTED|429/i.test(`${msg} ${e.code ?? ''}`)) return 'AI quota exceeded (Gemini rate limit). Please retry in a minute.'
    return String(msg).split('\n')[0] || 'Upstream AI error'
  }
  if (v.status === 'error') return 'The agent reported an error'
  return ''
}

// Session = the region chosen at onboarding: { query, geo }.
// Data    = every backend payload for that region, cached so a refresh doesn't
//           re-run the (slow) agent pipeline. Keyed by the query string.
export function StoreProvider({ children }) {
  const [session, setSession] = useState(() => read(SESSION_KEY))
  const [data, setData] = useState(() => {
    const cached = read(DATA_KEY)
    return cached && cached.key === read(SESSION_KEY)?.query ? cached : { key: null }
  })
  const [status, setStatus] = useState(IDLE)
  const [errors, setErrors] = useState({})
  const [progress, setProgress] = useState([])
  // Kanban stage for each transfer: { [transferId]: { stage, txn } }.
  const [board, setBoard] = useState(() => read(BOARD_KEY) || {})

  const gen = useRef(0)
  const inflight = useRef(null)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => write(DATA_KEY, data.key ? data : null), [data])
  useEffect(() => write(BOARD_KEY, board), [board])

  const startSession = (query, geo) => {
    const next = { query, geo }
    gen.current++
    inflight.current = null
    setSession(next)
    write(SESSION_KEY, next)
    setData({ key: query })
    setStatus(IDLE)
    setErrors({})
    setProgress([])
    setBoard({})
  }

  const endSession = () => {
    gen.current++
    inflight.current = null
    setSession(null)
    write(SESSION_KEY, null)
    setData({ key: null })
    setStatus(IDLE)
  }

  // Loading lifecycle (see dashboard_integration_guide.md):
  //   snapshot + inventory + alerts in parallel (fast) →
  //   analyze/stream (slow, streams agent progress) → distribution/plan.
  const load = useCallback(
    async ({ force = false } = {}) => {
      const s = session
      if (!s?.query) return
      // One pipeline per region at a time (StrictMode double-invokes effects in
      // dev, and every call here spends LLM quota).
      if (!force && inflight.current === s.query) return
      inflight.current = s.query
      const my = ++gen.current
      try {
        await pipeline(s, my, force)
      } finally {
        if (gen.current === my) inflight.current = null
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  )

  // Runs one generation `my` of the lifecycle; results from a superseded
  // generation (region changed / forced refresh) are dropped.
  const pipeline = async (s, my, force) => {
    const live = () => gen.current === my
    const have = (p) => !force && dataRef.current.key === s.query && dataRef.current[p]

    const set = (part, value) => live() && setData((d) => ({ ...d, key: s.query, [part]: value, at: Date.now() }))
    const mark = (part, st, err) => {
      if (!live()) return
      setStatus((x) => ({ ...x, [part]: st }))
      setErrors((e) => ({ ...e, [part]: err || '' }))
    }
    const run = async (part, fn) => {
      if (have(part)) return mark(part, 'done')
      mark(part, 'loading')
      try {
        const value = await fn()
        // Agent endpoints sometimes return 200 with an error payload.
        const upstream = upstreamError(value)
        if (upstream) throw new Error(upstream)
        set(part, value)
        mark(part, 'done')
      } catch (e) {
        mark(part, 'error', e.message || 'Request failed')
      }
    }

    run('snapshot', () => api.get(`/api/v1/surveillance/snapshot?location=${q(s.query)}`))
    run('inventory', () => api.get('/api/v1/inventory/status'))
    run('alerts', () => api.post('/api/v1/alerts/trigger', { region: s.query }))

    let analysis = have('analysis') ? dataRef.current.analysis : null
    if (analysis) mark('analysis', 'done')
    else {
      mark('analysis', 'loading')
      if (live()) setProgress(['Connecting to surveillance agents…'])
      const log = (msg) => live() && setProgress((p) => [...p, msg])
      try {
        let report = null
        try {
          await api.stream(
            '/api/v1/surveillance/analyze/stream',
            { location: s.query, time_horizon: 'short' },
            (ev) => {
              if (ev.type === 'progress') log(String(ev.data))
              else if (ev.type === 'weather_snapshot') log('Weather & AQI snapshot received')
              else if (ev.type === 'result') report = ev.data
            },
          )
        } catch (e) {
          if (e.status === 404) throw e
          log('Stream interrupted — retrying with the standard endpoint…')
        }
        if (!report) {
          const res = await api.post('/api/v1/surveillance/analyze', { location: s.query, time_horizon: 'short' })
          report = res?.report
        }
        analysis = { location: s.geo, report }
        const ok = !!reportOf(analysis)
        // Only cache a usable report, so the next visit retries a failed run.
        if (ok) set('analysis', analysis)
        log(ok ? 'Surveillance report ready' : 'Agents returned an unusable report')
        mark('analysis', ok ? 'done' : 'error', ok ? '' : upstreamError(report) || 'The agents did not return a usable report.')
      } catch (e) {
        mark('analysis', 'error', e.message || 'Analysis failed')
        mark('plan', 'error', 'Needs a completed surveillance analysis')
        return
      }
    }

    if (!live()) return
    if (!reportOf(analysis) && !have('plan')) {
      mark('plan', 'error', 'Needs a completed surveillance analysis')
      return
    }
    await run('plan', async () => {
      const res = await api.post('/api/v1/distribution/plan', { location: s.query, time_horizon: 'medium' })
      if (!res?.plan || res.plan.parse_error) throw new Error(upstreamError(res?.plan) || 'The planning agents did not return a usable plan.')
      return res.plan
    })
  }

  const setStage = (id, stage, txn) => setBoard((b) => ({ ...b, [id]: { stage, txn: txn ?? b[id]?.txn } }))

  return (
    <StoreContext.Provider
      value={{ session, startSession, endSession, data, status, errors, progress, load, board, setStage }}
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
