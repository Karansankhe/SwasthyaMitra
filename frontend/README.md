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

## Project structure

```
index.html                 Vite entry (loads Google Fonts + /src/main.jsx)
tailwind.config.js         Design tokens (coral / dark / white, fonts)
src/
  main.jsx                 App bootstrap: Router + StoreProvider
  App.jsx                  Route table (one route per page)
  store.jsx                Shared approvals state (approve / dismiss)
  data.js                  Seed data + chart & simulator helpers  ← swap for API calls
  icons.jsx                Sidebar line icons
  lib/api.js               Fetch client (reads VITE_API_BASE_URL)
  components/
    Layout.jsx             Sidebar + Topbar + <Outlet/>
    Sidebar.jsx            Left nav (NavLink active states)
    Topbar.jsx             Facility switcher, threat level, search, profile
    AgentRail.jsx          Live agent-activity feed with approvals
    ui.jsx                 Shared primitives: Card, Badge, Bar, buttons
  pages/
    CommandCenter.jsx      /            KPIs, facility status, alerts, agent rail
    SurgeMonitor.jsx       /alerts      Alert list + detail with recommended actions
    Forecasting.jsx        /forecast    Patient-load charts + driver breakdown
    Inventory.jsx          /inventory   Stock, inter-clinic redistribution, PO queue
    Staff.jsx              /staff       Roster grid, load, staffing recommendations
    Communications.jsx     /comms       Multilingual (Bhashini) advisory composer
    Simulator.jsx          /simulator   What-if surge sliders + recommended plan
    Lms.jsx                /lms         Gamified staff surge-training modules
    Settings.jsx           /settings    Facility / integration / access settings
```

## Wiring to the backend

Screens read from a small set of seed exports in [`src/data.js`](src/data.js) — one or two
sample records each, plus the chart and simulator helpers. Every list already renders an
empty state, so screens behave correctly the moment the backend returns real (or no) data.

To go live, fetch through the API client in [`src/lib/api.js`](src/lib/api.js) and pass the
results into the same component props. Set the backend URL via an env var:

```bash
cp .env.example .env.local   # then set VITE_API_BASE_URL
```

Human-in-the-loop approvals (agent feed, procurement POs, staffing swaps) are tracked in
[`src/store.jsx`](src/store.jsx); point `approve` / `dismiss` at real endpoints there.

## Design tokens

- **Brand:** coral `#F2785C` (hover `#E15D3F`)
- **Core:** dark `#1C2220` · white `#FFFFFF`
- **Status:** watch `#D97706` · critical `#DC2626`
- **Type:** Poppins (headings), Inter (UI), JetBrains Mono (numerics/labels)
