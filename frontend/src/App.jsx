import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireLocation from './components/RequireLocation.jsx'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import CommandCenter from './pages/CommandCenter.jsx'
import SurgeMonitor from './pages/SurgeMonitor.jsx'
import Forecasting from './pages/Forecasting.jsx'
import Communications from './pages/Communications.jsx'
import Simulator from './pages/Simulator.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/app"
        element={
          <RequireLocation>
            <Layout />
          </RequireLocation>
        }
      >
        <Route index element={<CommandCenter />} />
        <Route path="alerts" element={<SurgeMonitor />} />
        <Route path="forecast" element={<Forecasting />} />
        <Route path="comms" element={<Communications />} />
        <Route path="simulator" element={<Simulator />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
