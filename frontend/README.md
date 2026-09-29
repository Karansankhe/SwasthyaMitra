# SwasthyaMitra — Health Center & Supply Chain Platform (Frontend)

A surge-management dashboard for India's rural **PHCs / CHCs** — predicts and
prepares for patient surges from **festivals, pollution (AQI) spikes, and monsoon epidemics**.

Built with **Vite + React + React Router + Tailwind CSS**. Every screen is its own routed
component so the app is easy to extend and wire to a backend.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

Other scripts:

```bash
npm run build     # production build to /dist
npm run preview   # preview the production build
```

## Routes

The app follows `dashboard_integration_guide.md`:

| Route | Page | Backend calls |
| --- | --- | --- |
| `/` | Landing | — |
| `/onboarding` | Region search (validated live) | `GET /surveillance/geocode` |
| `/dashboard` | KPIs, compound-risk radar, demand forecast, alerts & shortages, recommendation detail, action timeline | `snapshot`, `inventory/status`, `alerts/trigger`, `surveillance/analyze/stream`, `distribution/plan` |
| `/dashboard/surveillance` | Full surveillance report + agent run log + health news | (shared data) |
| `/dashboard/logistics` | PHC map, transfer Kanban, critical shortages | `distribution/reallocate`, `surveillance/geocode` (map pins) |
| `/dashboard/inventory` | Stock register by district | (shared data) |
| `/dashboard/education` | Generated MCQ simulations with a "Why?" rationale | `POST /education/generate` |
| `/dashboard/assistant` | Chat grounded in the current report and plan | `POST /chat` (needs `X-API-Key`) |

## Project structure

```
src/
  main.jsx                 App bootstrap: Router + StoreProvider
  App.jsx                  Route table
  store.jsx                Region session + loading lifecycle (cached per region in localStorage)
  view.js                  useView(): derived view-model shared by every dashboard page
  lib/api.js               Fetch client + NDJSON stream reader (VITE_API_BASE_URL, VITE_API_KEY)
  lib/selectors.js         Pure mappers: KPIs, risk vectors, demand series, alerts, timeline
  components/
    Layout.jsx             Sidebar + Topbar + <Outlet/>; starts the loading lifecycle
    Sidebar.jsx / Topbar.jsx
    Charts.jsx             SVG radar + area charts (no chart library)
    Markdown.jsx           Safe Markdown renderer for chat replies
    ui.jsx                 Card, Skeleton, Spinner, SevPill, ErrorNote, …
  pages/                   Onboarding, Dashboard, Surveillance, Logistics, Inventory, Education, Assistant
```

## Loading lifecycle

1. `/onboarding` validates the region with `/geocode`, then routes to `/dashboard`.
2. `/snapshot`, `/inventory/status` and `/alerts/trigger` run in parallel (header, KPIs, warnings).
3. `/analyze/stream` streams agent progress over the charts. It falls back to `/analyze` if the stream breaks.
4. The finished report fills the radar and the timeline, then `/distribution/plan` runs and fills the demand forecast, shortages and transfers.

Only usable results are cached (per region), so a refresh doesn't re-run the agents, but a
failed run is retried on the next visit. **Refresh analysis** forces a new run.

## Configuration

```bash
cp .env.example .env.local   # set VITE_API_BASE_URL and VITE_API_KEY (= backend API_KEY)
```

## Design tokens

- **Brand:** coral `#F2785C` (hover `#E15D3F`)
- **Core:** dark `#1C2220` · white `#FFFFFF`
- **Status:** watch `#D97706` · critical `#DC2626`
- **Type:** Poppins (headings), Inter (UI), JetBrains Mono (numerics/labels)
