import { Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

// Blocks the dashboard until a location has been selected and analysed.
export default function RequireLocation({ children }) {
  const { session } = useStore()
  if (!session?.location) return <Navigate to="/onboarding" replace />
  return children
}
