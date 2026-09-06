import { useStore } from './store.jsx'
import { adaptReport } from './lib/adapt.js'

const EMPTY = {
  ready: false,
  threat: { label: '—', color: '#5C665F', bg: 'rgba(28,34,32,0.06)' },
  kpis: [],
  alerts: [],
  summary: null,
  weather: null,
  events: null,
  pollution: null,
  actions: null,
  dataSources: [],
  location: {},
}

// Single source of truth for the dashboard. All data comes from the backend
// /analyze report stored on the session; nothing is hardcoded.
export function useDashboard() {
  const { session } = useStore()
  const view = adaptReport(session?.analysis)
  if (!view) return EMPTY
  return { ready: true, ...view }
}
