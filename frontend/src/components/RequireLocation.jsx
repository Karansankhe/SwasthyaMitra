import { Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

// The dashboard needs a validated region from onboarding.
export default function RequireLocation({ children }) {
  const { session } = useStore()
  if (!session?.geo) return <Navigate to="/onboarding" replace />
  return children
}
