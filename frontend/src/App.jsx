import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireLocation from './components/RequireLocation.jsx'
import PageTransition from './components/PageTransition.jsx'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Surveillance from './pages/Surveillance.jsx'
import Logistics from './pages/Logistics.jsx'
import Inventory from './pages/Inventory.jsx'
import Education from './pages/Education.jsx'
import Assistant from './pages/Assistant.jsx'

export default function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <RequireLocation>
              <Layout />
            </RequireLocation>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="surveillance" element={<Surveillance />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="education" element={<Education />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
        {/* Old dashboard URLs */}
        <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}
