// App configuration and client-side compute helpers only.
// All displayed metrics come from the backend (see src/lib/adapt.js); there is
// no hardcoded sample data here.

// Blocks the platform serves — these are the geocode inputs sent to /analyze.
export const LOCATIONS = [
  { id: 'rampur', name: 'Rampur Block', district: 'Barabanki', state: 'Uttar Pradesh' },
  { id: 'sitapur', name: 'Sitapur Block', district: 'Sitapur', state: 'Uttar Pradesh' },
  { id: 'malihabad', name: 'Malihabad Block', district: 'Lucknow', state: 'Uttar Pradesh' },
  { id: 'kakori', name: 'Kakori Block', district: 'Lucknow', state: 'Uttar Pradesh' },
]

// Sidebar navigation.
export const NAV = [
  { to: '/app', label: 'Command Center', icon: 'command', end: true },
  { to: '/app/alerts', label: 'Alerts', icon: 'alerts' },
  { to: '/app/forecast', label: 'Forecast', icon: 'forecast' },
  { to: '/app/comms', label: 'Comms', icon: 'comms' },
  { to: '/app/simulator', label: 'Simulator', icon: 'sim' },
]

// Communications composer options (UI choices, not data).
export const CHANNELS = ['SMS', 'IVR', 'WhatsApp']
export const DIALECTS = ['Awadhi', 'Bhojpuri', 'Hindi']
export const SEGMENTS = ['All', 'High-risk (elderly)', 'Children <5', 'ASHA workers']

// Scenario simulator — a client-side what-if calculator (no backend data).
export const OUTBREAK_LABELS = ['None', 'Mild', 'Moderate', 'Severe', 'Epidemic']

export function simOutcome({ aqi, festival, outbreak }) {
  const surplus = Math.round((aqi - 90) / 7 + festival * 1.5 + outbreak * 34)
  const beds = Math.round(surplus * 0.42)
  const staff = Math.ceil(surplus / 22)
  const o2 = Math.round(surplus * 0.6)
  const level =
    surplus > 180
      ? { l: 'SEVERE', c: '#DC2626', bg: 'rgba(248,113,113,0.12)' }
      : surplus > 90
      ? { l: 'HIGH', c: '#D97706', bg: 'rgba(251,191,36,0.12)' }
      : { l: 'MODERATE', c: '#F2785C', bg: 'rgba(242,120,92,0.12)' }
  return { surplus, beds, staff, o2, level }
}

export function simPlan(outcome) {
  return [
    { t: 'Pre-position oxygen', d: `Move ${outcome.o2} cylinders to high-load facilities` },
    { t: 'Staff up', d: `Add ${outcome.staff} extra shifts across the block` },
    { t: 'Reserve beds', d: `Ring-fence ${outcome.beds} surge beds` },
    { t: 'Advisory', d: 'Trigger multilingual prevention comms to high-risk segments' },
  ]
}
