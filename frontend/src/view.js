import { useMemo } from 'react'
import { useStore } from './store.jsx'
import { reportOf, planOf, warningItems, shortageItems, transferItems, kpis, regionName } from './lib/selectors.js'

// One derived view over every backend payload, shared by all dashboard pages.
export function useView() {
  const store = useStore()
  const { data, session } = store
  const view = useMemo(() => {
    const report = reportOf(data.analysis)
    const plan = planOf(data.plan)
    const warnings = warningItems(data.alerts, report)
    return {
      region: regionName(session),
      snapshot: data.snapshot || null,
      weather: data.snapshot?.weather_aqi && !data.snapshot.weather_aqi.error ? data.snapshot.weather_aqi : null,
      news: Array.isArray(data.snapshot?.health_news) ? data.snapshot.health_news : [],
      inventory: data.inventory || null,
      report,
      plan,
      warnings,
      shortages: shortageItems(plan),
      transfers: transferItems(plan),
      kpi: kpis({ report, inventory: data.inventory, warnings }),
    }
  }, [data, session])
  return { ...store, ...view }
}
